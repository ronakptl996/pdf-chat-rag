import { Request, Response } from "express";
import { Queue } from "bullmq";
import File from "../models/File.model";

interface RequestBody extends Request {
  file?: Express.Multer.File;
  user?: { userId: string; email: string };
}

const queue = new Queue("file-upload-queue");

export const getPdfFiles = async (
  req: RequestBody,
  res: Response
): Promise<any> => {
  try {
    const { userId } = req.user!;
    const pdfFiles = await File.find({ userId, isUploaded: true });
    res.status(200).json({ success: true, data: pdfFiles });
  } catch (error: any) {
    console.log("error >>>", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPdfById = async (
  req: RequestBody,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;
    const pdf = await File.findById(id);
    if (!pdf) {
      throw new Error("PDF not found");
    }
    res.setHeader("Content-Type", "application/pdf");
    res.sendFile(pdf.path);
  } catch (error: any) {
    console.log("error >>>", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadPdf = async (
  req: RequestBody,
  res: Response
): Promise<any> => {
  try {
    const filePath = req.file!.path;
    console.log(`Uploading file from ${filePath}`);
    const file = await File.create({
      name: req.file!.originalname,
      path: filePath,
      userId: req.user!.userId,
    });

    await queue.add(
      "file-ready",
      JSON.stringify({
        path: filePath,
        fileName: req.file!.originalname,
        destination: req.file!.destination,
        fileId: file._id,
      })
    );

    res
      .status(200)
      .json({ success: true, message: "PDF uploaded successfully" });
  } catch (error: any) {
    console.error("Error uploading PDF:", error);
    res.status(500).json({ success: false, error: "Error uploading PDF" });
  }
};
