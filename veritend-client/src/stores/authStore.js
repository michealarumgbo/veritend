import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authService } from "../services/authService";
export const useAuthStore = defineStore("auth", () => {
  const user = ref(null),
    ready = ref(false); // token lives in httpOnly cookie, never localStorage
  const role = computed(() => user.value?.role);
  const isAuthed = computed(() => !!user.value);
  async function restore() {
    try {
      user.value = await authService.me();
    } catch {
      user.value = null;
    }
    ready.value = true;
  }
  async function login(e, p) {
    user.value = await authService.login(e, p);
  }
  async function logout() {
    try {
      await authService.logout();
    } finally {
      user.value = null;
    }
  }
  return { user, ready, role, isAuthed, restore, login, logout };
});
