import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import recordRoutes from "./routes/record.routes.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB
connectDB();

// Routes
app.use("/", authRoutes);
app.use("/", recordRoutes);
app.get("/", (req, res) => {
  const employeeId = req.cookies.employeeId || null;
  res.render("index", { employeeId, records: [], message: null });
});

// HTTPS 設定
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "localhost+2-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "localhost+2.pem")),
};

https.createServer(httpsOptions, app).listen(3000, () => {
  console.log("✅ HTTPS 伺服器運行中：https://localhost:3000");
});
