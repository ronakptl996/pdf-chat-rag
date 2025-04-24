import { Request, Response } from "express";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const embedder = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "text-embedding-004",
});

export const chatWithPdf = async (req: Request, res: Response) => {
  try {
    const { pdfName, query } = req.body;
    if (!query) {
      throw new Error("Query is required");
    }

    const vectorStore = new QdrantVectorStore(embedder, {
      collectionName: pdfName,
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

    res.status(200).json({ success: true, data: response.text });
  } catch (error: any) {
    console.log("error >>>", error);
    res.status(400).json({ success: false, error: error.message });
  }
};
