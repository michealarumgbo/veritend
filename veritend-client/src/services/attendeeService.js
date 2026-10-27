import api from "./api";
const map = (u) => ({
  id: u._id,
  regNo: u.regNo,
  surname: u.surname,
  firstname: u.firstname,
  status: u.status,
  enrolled: !!u.hasFace,
});
export const attendeeService = {
  list: (p) =>
    api
      .get("/users/attendees", { params: p })
      .then((r) => ({ items: r.attendees.map(map), total: r.total })),
  get: (id) => api.get(`/users/${id}`).then((r) => map(r.user)),
  create: (d) =>
    api
      .post("/users/attendees", d)
      .then((r) => ({ id: r.attendee._id, ...r.attendee })), // password returned once
  update: (id, d) =>
    d.status
      ? api.post(
          `/users/${id}/${d.status === "suspended" ? "suspend" : "reactivate"}`,
        )
      : api.patch(`/users/attendees/${id}`, d),
  enrollFace: (id, descriptor) =>
    api.post(`/users/attendees/${id}/store-face`, { descriptor }),
};
