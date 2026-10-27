import api from "./api";
// Public terminal calls: no staff session, so never run the refresh flow. Phase 1 sets a signed cookie that phase 2 relies on.
export const attendanceService = {
  verifyCredentials: (regNo, password, sessionId) =>
    api
      .post(
        "/attendance/verify-credentials",
        { regNo, password, sessionId },
        { skipRefresh: true },
      )
      .then((r) => ({
        id: r.attendee._id,
        name: r.attendee.name,
        regNo: r.attendee.regNo,
      })),
  verifyFace: (descriptor) =>
    api
      .post("/attendance/mark", { descriptor }, { skipRefresh: true })
      .then((r) => ({
        attendee: r.attendee,
        session: r.session,
        timestamp: r.timestamp,
      })),
};
