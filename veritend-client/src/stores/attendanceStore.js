import { defineStore } from "pinia";
import { ref } from "vue";
import { attendanceService } from "../services/attendanceService";
import { sessionService } from "../services/sessionService";
// Only the attendee's document id is kept (never the password or face data), per session, so a refresh resumes at phase 2.
const key = (sid) => `veritend.pendingAttendee:${sid}`;
const read = (sid) => {
  try {
    return localStorage.getItem(key(sid));
  } catch {
    return null;
  }
};
const write = (sid, v) => {
  try {
    v ? localStorage.setItem(key(sid), v) : localStorage.removeItem(key(sid));
  } catch {}
};
export const useAttendanceStore = defineStore("attendance", () => {
  const session = ref(null),
    step = ref("creds"),
    attendeeId = ref(null),
    receipt = ref(null),
    error = ref(""),
    loading = ref(false);
  async function loadSession(id) {
    if (!id) {
      error.value =
        "No session selected. Open the terminal from the Sessions page.";
      return;
    }
    try {
      session.value = await sessionService.get(id);
      const saved = session.value.status === "open" ? read(id) : null;
      if (saved) {
        attendeeId.value = saved;
        step.value = "face";
      } // resume phase 2; no id means phase 1
    } catch (e) {
      error.value = e.message;
    }
  }
  async function verifyCredentials(reg, pw) {
    loading.value = true;
    error.value = "";
    try {
      const r = await attendanceService.verifyCredentials(
        reg,
        pw,
        session.value?.id,
      );
      attendeeId.value = String(r.id);
      write(session.value.id, attendeeId.value);
      step.value = "face";
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }
  async function submitFace(descriptor) {
    if (!attendeeId.value) {
      step.value = "creds";
      error.value = "Please verify your credentials first.";
      return;
    }
    loading.value = true;
    error.value = "";
    try {
      receipt.value = await attendanceService.verifyFace(
        descriptor,
        session.value?.id,
        attendeeId.value,
      );
      write(session.value.id, null);
      step.value = "done";
    } catch (e) {
      error.value = e.message;
      if (e.status === 401) {
        write(session.value.id, null);
        attendeeId.value = null;
        step.value = "creds";
      } // proof of phase 1 expired
    } finally {
      loading.value = false;
    }
  }
  const reset = () => {
    if (session.value) write(session.value.id, null);
    step.value = "creds";
    attendeeId.value = null;
    receipt.value = null;
    error.value = "";
  };
  return {
    session,
    step,
    attendeeId,
    receipt,
    error,
    loading,
    loadSession,
    verifyCredentials,
    submitFace,
    reset,
  };
});
