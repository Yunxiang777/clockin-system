import { Record } from "../models/record.model.js";
import { isNearCompany } from "../utils/location.js";

// ✅ 打卡邏輯
export async function clockInService(employeeId, lat, lng, ip) {
  if (!ip.startsWith("192.168.")) {
    return { records: [], message: "⚠️ 請連接公司 Wi-Fi" };
  }

  if (!isNearCompany(lat, lng)) {
    return { records: [], message: "❌ GPS 不在公司範圍內" };
  }

  await Record.create({
    employeeId,
    time: new Date(),
    ip,
    location: { lat, lng },
  });

  const records = await Record.find({ employeeId }).sort({ time: -1 });
  return { records, message: "✅ 打卡成功！" };
}

// ✅ 查詢某員工的打卡紀錄（登入後使用）
export async function getRecords(employeeId) {
  return await Record.find({ employeeId }).sort({ time: -1 });
}
