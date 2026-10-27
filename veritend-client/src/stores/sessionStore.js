import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { sessionService } from "../services/sessionService";
export const useSessionStore = defineStore("sessions", () => {
  const list = ref([]),
    loading = ref(false),
    error = ref("");
  const active = computed(
    () => list.value.find((s) => s.status === "open") || null,
  );
  async function refresh() {
    loading.value = true;
    error.value = "";
    try {
      list.value = await sessionService.list();
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }
  async function create(t) {
    await sessionService.create(t);
    await refresh();
  }
  async function setStatus(id, s) {
    await sessionService.setStatus(id, s);
    await refresh();
  }
  return { list, loading, error, active, refresh, create, setStatus };
});
