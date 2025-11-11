import { clockInService } from "../services/record.service.js";

export async function clockIn(req, res) {
  try {
    const employeeId = req.cookies.employeeId;

    // 未登入
    if (!employeeId) {
      return res.render("index", {
        title: "員工打卡系統",
        employeeId: null,
        records: [],
        message: "⚠️ 尚未登入",
      });
    }

    const { lat, lng } = req.body;
    const ip = req.ip.replace(/^::ffff:/, "");

    // 執行打卡
    const result = await clockInService(employeeId, lat, lng, ip);
    const { records, message } = result;
    res.render("pages/index", {
      title: "員工打卡系統",
      employeeId,
      records,
      message,
    });
  } catch (err) {
    console.error("❌ 打卡錯誤:", err);
    res.render("pages/index", {
      title: "員工打卡系統",
      employeeId: req.cookies.employeeId || null,
      records: [],
      message: "❌ 打卡失敗：" + err.message,
    });
  }
}
