// controllers/home.controller.js
export async function home(req, res) {
  const employeeId = req.cookies.employeeId || null;

  res.render("pages/index", {
    layout: "layouts/layout", // 告訴 Express 使用此 layout
    title: "員工打卡系統",
    employeeId,
    records: [], // 之後你可以改成從資料庫撈打卡紀錄
    message: null,
  });
}
