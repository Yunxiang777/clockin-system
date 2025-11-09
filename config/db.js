// config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;

  try {
    await mongoose.connect(mongoURI);
    console.log("✅ 已成功連線至 MongoDB:", mongoURI);
  } catch (err) {
    console.error("❌ 無法連線至 MongoDB：", err.message);
    process.exit(1); // 強制結束應用程式
  }
}
