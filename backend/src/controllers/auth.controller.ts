import { Request, Response } from "express";
import User from "../models/User.model";
import { generateToken } from "../utils";

interface RequestBody extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

const login = async (req: RequestBody, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, message: "User not found!" });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(400).json({ success: false, message: "Invalid Credentials!" });
      return;
    }

    const token = generateToken({ userId: user._id, email: user.email });
    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const register = async (req: RequestBody, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const alreadyExists = await User.findOne({ email });
    if (alreadyExists) {
      res.status(400).json({ success: false, message: "User already exists!" });
      return;
    }

    const user = await User.create({ email, password });
    const token = generateToken({ userId: user._id, email: user.email });
    res
      .status(201)
      .json({ success: true, message: "User created successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { login, register };
