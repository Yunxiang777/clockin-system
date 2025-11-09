// controllers/home.controller.js
export async function home(req, res) {
  const employeeId = req.cookies.employeeId || null;
  res.render("index", { employeeId, records: [], message: null });
}
