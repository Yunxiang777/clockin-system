// controllers/auth.controller.js
import { findUser, createUser } from "../services/user.service.js";
import { getRecords } from "../services/record.service.js";
import { isNearCompany } from "../utils/security.js";

export async function login(req, res) {
  const { employeeId, lat, lng, deviceHash } = req.body;
  const ip = req.ip.replace(/^::ffff:/, "");

  // 目前使用者
  let user = await findUser(employeeId);

  // 新使用者，重新綁定
  if (!user) {
    const deviceHash = crypto.randomUUID();
    await createUser(employeeId, deviceHash);
    res.cookie("employeeId", employeeId, { httpOnly: true });
    res.cookie("deviceHash", deviceHash, { httpOnly: true });
    return res.render("pages/index", {
      title: "員工打卡系統",
      employeeId,
      records: [],
      message: "✅ 裝置綁定完成，請重新登入。",
    });
  }

  // 裝置不符
  if (user.deviceHash !== deviceHash) {
    return res.render("pages/index", {
      title: "員工打卡系統",
      employeeId: null,
      records: [],
      message: "❌ 裝置不同，請洽人資。",
    });
  }

  // 是否入公司才打卡
  if (!isNearCompany(lat, lng)) {
    return res.render("pages/index", {
      title: "員工打卡系統",
      employeeId: null,
      records: [],
      message: "❌ GPS 不在公司範圍內。",
    });
  }

  // 登入成功打卡
  const records = await getRecords(employeeId);
  res.render("pages/index", {
    title: "員工打卡系統",
    employeeId,
    records,
    message: "✅ 登入成功！可以打卡囉。",
  });
}
