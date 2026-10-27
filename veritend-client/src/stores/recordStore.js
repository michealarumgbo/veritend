import { defineStore } from "pinia";
import { ref } from "vue";
import { recordService } from "../services/recordService";
import { sessionService } from "../services/sessionService";
import { useList } from "./listFactory";
export const useRecordStore = defineStore("records", () => {
  const l = useList(recordService.list, {
      search: "",
      session: "",
      from: "",
      to: "",
    }),
    sessions = ref([]);
  const loadSessions = async () => {
    try {
      sessions.value = await sessionService.list();
    } catch {
      sessions.value = [];
    }
  }; // backend scopes by role
  async function exportCsv() {
    // client-side export of all rows matching filters
    const r = await recordService.list({ ...l.f.value, page: 1, size: 5000 });
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Name", "Reg No", "Session", "Recorded At"],
      ...r.items.map((x) => [x.name, x.regNo, x.session, x.recordedAt]),
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([rows.map((x) => x.map(esc).join(",")).join("\n")], {
        type: "text/csv",
      }),
    );
    a.download = "attendance-records.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return { ...l, sessions, loadSessions, exportCsv };
});
