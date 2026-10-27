import api from "./api";
export const recordService = {
  list: (p) =>
    api.get("/report/attendance", { params: p }).then((r) => ({
      // backend scopes by role
      total: r.total,
      items: r.records.map((x) => ({
        id: x._id,
        name: x.attendeeName,
        regNo: x.attendeeRegNo,
        session: x.attendanceName,
        sessionId: x.sessionId,
        ownerName: x.createdBy,
        recordedAt: x.recorded,
      })),
    })),
  // daily counts + busiest sessions; admins get only their own sessions, super admin gets all (enforced by the backend)
  activity: (days) =>
    api
      .get("/report/activity", { params: { days } })
      .then((r) => ({
        days: r.days,
        bySession: r.bySession.map((s) => ({
          id: s._id,
          title: s.name,
          count: s.count,
        })),
      })),
};
