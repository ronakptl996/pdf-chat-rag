import { Request, Response } from "express";
import { Queue } from "bullmq";

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

const queue = new Queue("file-upload-queue");

export const uploadPdf = async (req: RequestWithFile, res: Response) => {
  try {
    const filePath = req.file!.path;
    console.log(`Uploading file from ${filePath}`);

    await queue.add(
      "file-ready",
      JSON.stringify({
        path: filePath,
        fileName: req.file!.originalname,
        destination: req.file!.destination,
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
