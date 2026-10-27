import api from "./api";
const map = (s) => ({
  id: s._id,
  title: s.name,
  status: s.status,
  createdAt: s.createdAt,
  count: s.count ?? 0,
  ownerId: s.createdBy?._id,
  ownerName: s.createdBy?.name,
});
export const sessionService = {
  list: () => api.get("/attendance").then((r) => r.attendanceSessions.map(map)), // backend scopes by role
  create: (title) =>
    api
      .post("/attendance", { name: title })
      .then((r) => map(r.attendanceSession)), // created open
  setStatus: (id, status) =>
    api.patch(`/attendance/${id}/${status === "open" ? "open" : "close"}`),
  get: (id) =>
    api
      .get(`/attendance/${id}/public`, { skipRefresh: true })
      .then((r) => ({
        id: r.session._id,
        title: r.session.name,
        status: r.session.status,
      })),
};
