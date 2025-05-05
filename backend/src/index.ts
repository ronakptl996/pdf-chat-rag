import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import uploadPdfFileMiddleware from "./middlewares/multer.middleware";
import { pdfExistsMiddleware } from "./middlewares/chat.middleware";
import { login, register } from "./controllers/auth.controller";
import {
  uploadPdf,
  getPdfFiles,
  getPdfById,
} from "./controllers/file.controller";
import { chatWithPdf, getChatsByFileId } from "./controllers/chat.controller";
import dbConnection from "./utils/dbConnection";
import authMiddleware from "./middlewares/auth.middleware";
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
// app.use(express.static("uploads"));
dbConnection();

app.post("/upload-pdf", authMiddleware, uploadPdfFileMiddleware, uploadPdf);
app.get("/get-pdfs", authMiddleware, getPdfFiles);
app.get("/pdf/:id", getPdfById);

app.post("/chat", authMiddleware, pdfExistsMiddleware, chatWithPdf);
app.post("/chats/:fileId", authMiddleware, getChatsByFileId);

app.post("/login", login);
app.post("/register", register);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
