import { QdrantClient } from "@qdrant/js-client-rest";
import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import File from "../models/File.model";

export const pdfExistsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("fileId >>>", req.body);
    const { fileId } = req.body;

    if (!fileId) {
      throw new Error("File ID is required");
    }

    const file = await File.findById(fileId);

    if (!file) {
      throw new Error("File not found");
    }

    const uploadDir = path.join(__dirname, "../../uploads");
    const filePath = path.join(uploadDir, file.name);

    if (!fs.existsSync(filePath)) {
      throw new Error("PDF not found");
    }

    const qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
    });

    const collectionExists = await qdrantClient.collectionExists(file.name);

    if (!collectionExists.exists) {
      throw new Error("PDF not found");
    }

    next();
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
        ? error.message
        : "An error occurred while checking the PDF",
    });
  }
};
