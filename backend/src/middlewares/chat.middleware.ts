import { QdrantClient } from "@qdrant/js-client-rest";
import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

export const pdfExistsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pdfName } = req.body;

    if (!pdfName) {
      throw new Error("PDF name is required");
    }

    const uploadDir = path.join(__dirname, "../../uploads");
    const filePath = path.join(uploadDir, pdfName);

    if (!fs.existsSync(filePath)) {
      throw new Error("PDF not found");
    }

    const qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
    });

    const collectionExists = await qdrantClient.collectionExists(pdfName);

    if (!collectionExists.exists) {
      throw new Error("PDF not found");
    }

    next();
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
        ? error.message
        : "An error occurred while checking the PDF",
    });
  }
};
