import dotenv from "dotenv";
dotenv.config();
import express from "express";
import uploadPdfFileMiddleware from "./middlewares/multer.middleware";
import { pdfExistsMiddleware } from "./middlewares/chat.middleware";
import { uploadPdf } from "./controllers/upload-pdf";
import { chatWithPdf } from "./controllers/chat-with-pdf";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/upload-pdf", uploadPdfFileMiddleware, uploadPdf);
app.post("/chat", pdfExistsMiddleware, chatWithPdf);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
