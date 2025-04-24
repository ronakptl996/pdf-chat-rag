import { Request, Response } from "express";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export const embedder = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "text-embedding-004",
});

export const uploadPdf = async (req: RequestWithFile, res: Response) => {
  try {
    const filePath = req.file!.path;
    console.log(`Uploading file from ${filePath}`);

    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} documents ===>`, JSON.stringify(docs));

    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(
      `Split ${splitDocs.length} documents ===>`,
      JSON.stringify(splitDocs)
    );

    const qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
    });

    const collectionExists = await qdrantClient.collectionExists(
      req.file!.originalname
    );
    if (collectionExists) {
      await qdrantClient.deleteCollection(req.file!.originalname);
    }

    await QdrantVectorStore.fromDocuments(splitDocs, embedder, {
      url: process.env.QDRANT_URL,
      collectionName: req.file!.originalname,
    });

    res
      .status(200)
      .json({ success: true, message: "PDF uploaded successfully" });
  } catch (error: any) {
    console.error("Error uploading PDF:", error);
    res.status(500).json({ success: false, error: "Error uploading PDF" });
  }
};
