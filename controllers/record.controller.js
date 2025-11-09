import { clockInService } from "../services/record.service.js";

export async function clockIn(req, res) {
  try {
    const employeeId = req.cookies.employeeId;
    if (!employeeId) {
      return res.render("index", {
        employeeId: null,
        records: [],
        message: "⚠️ 尚未登入",
      });
    }

    const { lat, lng } = req.body;
    const ip = req.ip.replace(/^::ffff:/, "");

    // 呼叫 service 執行打卡邏輯
    const result = await clockInService(employeeId, lat, lng, ip);

    const { records, message } = result;
    res.render("index", { employeeId, records, message });
  } catch (err) {
    console.error("❌ 打卡錯誤:", err);
    res.render("index", {
      employeeId: req.cookies.employeeId || null,
      records: [],
      message: "❌ 打卡失敗：" + err.message,
    });
  }
}
