import api from "./api";
const map = (u) => ({
  id: u._id,
  surname: u.surname,
  firstname: u.firstname,
  loginId: u.regNo,
  role: String(u.role).replace("-", "_"),
  status: u.status,
});
export const adminService = {
  list: (p) =>
    api
      .get("/users/admins", { params: p })
      .then((r) => ({ items: r.admins.map(map), total: r.total })),
  create: (d) =>
    api
      .post("/users/admins", d)
      .then((r) => ({
        id: r.admin._id,
        surname: r.admin.surname,
        firstname: r.admin.firstname,
        loginId: r.admin.regNo,
        role: "admin",
        password: r.admin.password,
      })),
  update: (id, d) =>
    api.post(
      `/users/${id}/${d.status === "suspended" ? "suspend" : "reactivate"}`,
    ),
};
