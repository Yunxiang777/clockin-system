// controllers/auth.controller.js
import { findUser, createUser } from "../services/user.service.js";
import { getRecords } from "../services/record.service.js";
import { generateDeviceHash, isNearCompany } from "../utils/security.js";

export async function login(req, res) {
  const { employeeId, lat, lng } = req.body;
  const userAgent = req.headers["user-agent"];
  const ip = req.ip.replace(/^::ffff:/, "");

  if (!ip.startsWith("192.168.")) {
    return res.render("index", {
      employeeId: null,
      records: [],
      message: "⚠️ 請連接公司 Wi-Fi",
    });
  }

  const deviceHash = generateDeviceHash(employeeId, userAgent);
  let user = await findUser(employeeId);

  if (!user) {
    await createUser(employeeId, deviceHash, userAgent, lat, lng);
    res.cookie("employeeId", employeeId, { httpOnly: true });
    return res.render("index", {
      employeeId,
      records: [],
      message: "✅ 裝置綁定完成，請重新登入。",
    });
  }

  if (user.deviceHash !== deviceHash) {
    return res.render("index", {
      employeeId: null,
      records: [],
      message: "❌ 裝置不同，請洽人資。",
    });
  }

  if (!isNearCompany(lat, lng)) {
    return res.render("index", {
      employeeId: null,
      records: [],
      message: "❌ GPS 不在公司範圍內。",
    });
  }

  res.cookie("employeeId", employeeId, { httpOnly: true });
  const records = await getRecords(employeeId);
  res.render("index", {
    employeeId,
    records,
    message: "✅ 登入成功！可以打卡囉。",
  });
}
