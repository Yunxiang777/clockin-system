// controllers/home.controller.js
export async function home(req, res) {
  const employeeId = req.cookies.employeeId || null;

  res.render("pages/index", {
    layout: "layouts/layout",
    title: "員工打卡系統",
    employeeId,
    records: [],
    message: null,
  });
}
