import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    fileId: {
      type: Schema.Types.ObjectId,
      ref: "File",
    },
    query: String,
    response: String,
  },
  { timestamps: true }
);

const Chat = model("Chat", chatSchema);

export default Chat;
