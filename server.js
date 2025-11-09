// server.js
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";

dotenv.config();

// 目錄設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB 連線
mongoose
  .connect("mongodb://localhost:27017/clockinDB")
  .then(() => console.log("✅ 已連線至 MongoDB"))
  .catch((err) => console.error("❌ MongoDB 連線失敗：", err));

// Schema
const userSchema = new mongoose.Schema({
  employeeId: String,
  deviceHash: String,
  userAgent: String,
  gpsLocation: { lat: Number, lng: Number },
});

const recordSchema = new mongoose.Schema({
  employeeId: String,
  time: Date,
  ip: String,
  location: { lat: Number, lng: Number },
});

const User = mongoose.model("User", userSchema);
const Record = mongoose.model("Record", recordSchema);

// 工具函數
function generateDeviceHash(employeeId, userAgent) {
  const salt = process.env.SALT || "mySecretSalt";
  const hash = crypto
    .createHash("sha256")
    .update(employeeId + userAgent + salt)
    .digest("hex");
  console.log("🧩 generateDeviceHash:", { employeeId, userAgent, hash });
  return hash;
}

function isNearCompany(lat, lng) {
  const companyLat = 22.608238; // ← 你的實際位置
  const companyLng = 120.344137;
  const distance = Math.sqrt(
    Math.pow(companyLat - lat, 2) + Math.pow(companyLng - lng, 2)
  );
  return distance < 0.0005; // 約 50 公尺
}

// 🏠 首頁
app.get("/", async (req, res) => {
  console.log("📥 [GET /] cookies:", req.cookies);
  const employeeId = req.cookies.employeeId || null;
  const records = employeeId
    ? await Record.find({ employeeId }).sort({ time: -1 })
    : [];
  res.render("index", { employeeId, records, message: null });
});

// 🔑 登入/綁定手機
app.post("/login", async (req, res) => {
  const { employeeId, lat, lng } = req.body;
  const userAgent = req.headers["user-agent"];
  let ip = req.ip.replace(/^::ffff:/, ""); // 清除 IPv6 前綴
  console.log("🌐 /login 取得到的 IP:", ip);

  const deviceHash = generateDeviceHash(employeeId, userAgent);

  // 🧩 Wi-Fi 檢查
  if (!ip.startsWith("192.168.")) {
    console.log("⚠️ 非公司 Wi-Fi:", ip);
    return res.render("index", {
      employeeId: null,
      records: [],
      message: "⚠️ 請連接公司 Wi-Fi",
    });
  }

  let user = await User.findOne({ employeeId });

  // 🆕 新使用者：綁定手機
  if (!user) {
    console.log("🆕 新使用者，建立資料:", employeeId);
    user = new User({
      employeeId,
      deviceHash,
      userAgent,
      gpsLocation: { lat, lng },
    });
    await user.save();
    res.cookie("employeeId", employeeId, { httpOnly: true });
    console.log("✅ 綁定完成，請重新登入");
    return res.render("index", {
      employeeId,
      records: [],
      message: "✅ 裝置綁定完成！請重新登入。",
    });
  }

  // 📱 裝置檢查
  if (user.deviceHash !== deviceHash) {
    console.log("❌ 裝置不符:", employeeId, "deviceHash 不同");
    return res.render("index", {
      employeeId: null,
      records: [],
      message: "❌ 裝置不同，請洽人資處理。",
    });
  }

  // 📍 GPS 檢查
  if (!isNearCompany(lat, lng)) {
    console.log("❌ GPS 不在公司範圍內:", lat, lng);
    return res.render("index", {
      employeeId: null,
      records: [],
      message: "❌ GPS 不在公司範圍內。",
    });
  }

  // ✅ 通過登入
  res.cookie("employeeId", employeeId, { httpOnly: true });
  const records = await Record.find({ employeeId }).sort({ time: -1 });
  console.log("✅ 登入成功:", employeeId);
  res.render("index", {
    employeeId,
    records,
    message: "✅ 登入成功！可以打卡囉。",
  });
});

// ⏰ 打卡
app.post("/clockin", async (req, res) => {
  const employeeId = req.cookies.employeeId;
  if (!employeeId) {
    console.log("⚠️ 尚未登入嘗試打卡");
    return res.render("index", {
      employeeId: null,
      records: [],
      message: "⚠️ 尚未登入",
    });
  }

  const { lat, lng } = req.body;
  let ip = req.ip.replace(/^::ffff:/, ""); // 清除 IPv6 前綴
  console.log("🌐 /clockin 取得到的 IP:", ip);

  // 🧩 Wi-Fi 檢查
  if (!ip.startsWith("192.168.")) {
    console.log("⚠️ 非公司 Wi-Fi:", ip);
    return res.render("index", {
      employeeId,
      records: [],
      message: "⚠️ 請連接公司 Wi-Fi",
    });
  }

  // 📍 GPS 檢查
  if (!isNearCompany(lat, lng)) {
    console.log("❌ GPS 不在公司範圍內:", lat, lng);
    return res.render("index", {
      employeeId,
      records: [],
      message: "❌ GPS 不在公司範圍內",
    });
  }

  // ✅ 寫入打卡紀錄
  await Record.create({
    employeeId,
    time: new Date(),
    ip,
    location: { lat, lng },
  });
  console.log("✅ 打卡成功:", employeeId, "IP:", ip);

  const records = await Record.find({ employeeId }).sort({ time: -1 });
  res.render("index", { employeeId, records, message: "✅ 打卡成功！" });
});

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "localhost+1-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "localhost+1.pem")),
};

// 伺服器啟動
https.createServer(httpsOptions, app).listen(3000, () => {
  console.log("✅ HTTPS 伺服器運行中：https://localhost:3000");
});
