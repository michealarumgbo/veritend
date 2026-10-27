import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.API_BASE_URL,
  withCredentials: true,
  timeout: 20000,
});
let refreshing = null;
// Per-request flags: skipRefresh = never try the refresh flow (login, terminal); silent = no global "signed out" event.
api.interceptors.response.use(
  (r) => r.data,
  async (e) => {
    const cfg = e.config || {},
      status = e.response?.status;
    if (status === 401 && !cfg.skipRefresh && !cfg._retried) {
      cfg._retried = true;
      try {
        refreshing ||= api
          .patch("/auth/token/refresh", null, { skipRefresh: true })
          .finally(() => {
            refreshing = null;
          });
        await refreshing;
        return api(cfg); // retry once with the fresh cookies
      } catch {
        if (!cfg.silent)
          window.dispatchEvent(new Event("veritend:unauthorized"));
      }
    }
    const err = new Error(
      e.response?.data?.error ||
        e.response?.data?.message ||
        (e.response
          ? "Request failed."
          : "Server unreachable. Please try again later."),
    );
    err.status = status;
    return Promise.reject(err);
  },
);
export default api;
