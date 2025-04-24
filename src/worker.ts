import dotenv from "dotenv";
dotenv.config();
import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const embedder = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "text-embedding-004",
});

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    if (job.name === "file-ready") {
      const { path, fileName } = JSON.parse(job.data);

      const loader = new PDFLoader(path);
      const docs = await loader.load();

      const splitDocs = await textSplitter.splitDocuments(docs);

      const qdrantClient = new QdrantClient({
        url: process.env.QDRANT_URL,
      });

      const collectionExists = await qdrantClient.collectionExists(fileName);

      if (collectionExists.exists) {
        await qdrantClient.deleteCollection(fileName);
      }

      await QdrantVectorStore.fromDocuments(splitDocs, embedder, {
        url: process.env.QDRANT_URL,
        collectionName: fileName,
      });

      return { success: true, message: "PDF uploaded successfully" };
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    },
  }
);

worker.on("ready", () => {
  console.log("Worker is ready");
});

worker.on("completed", (jobId, result) => {
  console.log(
    `Job ${jobId.id} completed with result ${JSON.stringify(result)}`
  );
});

worker.on("failed", (jobId, error) => {
  console.log(`Job ${jobId} failed with error ${JSON.stringify(error)}`);
});
