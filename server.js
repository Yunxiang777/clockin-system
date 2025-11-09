import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import recordRoutes from "./routes/record.routes.js";
import homeRoutes from "./routes/home.routes.js";
import { connectDB } from "./config/db.js";
import expressLayouts from "express-ejs-layouts";

// 載入環境變數
dotenv.config();

// 路徑設定（ES 模組專用）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化 Express
const app = express();

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ 啟用 layout 功能
app.use(expressLayouts);
app.set("layout", "layouts/layout");

// MongoDB
connectDB();

// Routes
app.use("/", homeRoutes);
app.use("/", authRoutes);
app.use("/", recordRoutes);

// HTTPS 設定
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "localhost+2-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "localhost+2.pem")),
};

https.createServer(httpsOptions, app).listen(3000, () => {
  console.log("✅ HTTPS 伺服器運行中：https://localhost:3000");
});
