import { Request, Response } from "express";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import Chat from "../models/Chat.model";
import File from "../models/File.model";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const embedder = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "text-embedding-004",
});

interface RequestBody extends Request {
  user?: { userId: string; email: string };
}

export const chatWithPdf = async (req: RequestBody, res: Response) => {
  try {
    const { fileId, query } = req.body;
    if (!query) {
      throw new Error("Query is required");
    }

    const file = await File.findById(fileId);
    if (!file) {
      throw new Error("File not found");
    }

    const vectorStore = new QdrantVectorStore(embedder, {
      collectionName: file.name,
      url: process.env.QDRANT_URL,
    });

    const searchResults = await vectorStore.similaritySearch(query);
    const context = searchResults
      .map((result) => result.pageContent)
      .join("\n\n");

    const systemPrompt = `You are a helpful assistant that can answer questions from the provided context.
        context: ${context}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: query,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    if (!response.text) {
      throw new Error("No response");
    }

    await Chat.create({
      userId: req.user?.userId,
      fileId,
      query,
      response: response.text,
    });

    res.status(200).json({ success: true, data: response.text });
  } catch (error: any) {
    console.log("error >>>", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getChatsByFileId = async (req: RequestBody, res: Response) => {
  try {
    const { fileId } = req.params;
    let { page = 1, limit = 10 } = req.body;

    page = parseInt(page);
    limit = parseInt(limit);

    const chats = await Chat.find({ fileId, userId: req.user?.userId })
      .sort({ createdAt: -1 })
      .select("query response")
      .skip((page - 1) * limit)
      .limit(limit);

    const chatInOrder = chats.reverse();

    const total = await Chat.countDocuments({
      fileId,
      userId: req.user?.userId,
    });

    res.status(200).json({
      success: true,
      data: chatInOrder,
      total,
      page,
    });
  } catch (error: any) {
    console.log("error >>>", error);
    res.status(400).json({ success: false, error: error.message });
  }
};
