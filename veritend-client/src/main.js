import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/authStore";
import "./style.css";
createApp(App).use(createPinia()).use(router).mount("#app");
// a refresh that fails mid-session means the staff member must sign in again
window.addEventListener("veritend:unauthorized", () => {
  const a = useAuthStore();
  if (a.user) {
    a.user = null;
    router.push("/admin/login");
  }
});
