import api from "./api";
const norm = (u) =>
  u && {
    id: u._id,
    surname: u.surname,
    firstname: u.firstname,
    name: `${u.surname} ${u.firstname}`,
    loginId: u.regNo,
    role: String(u.role).replace("-", "_"),
    status: u.status,
  };
export const authService = {
  login: (loginId, password) =>
    api
      .post("/auth/login", { regNo: loginId, password }, { skipRefresh: true })
      .then((r) => norm(r.user)),
  me: () => api.get("/users/me", { silent: true }).then((r) => norm(r.user)),
  logout: () => api.post("/auth/logout", null, { silent: true }),
};
