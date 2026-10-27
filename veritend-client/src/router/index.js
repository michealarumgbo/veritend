import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/admin/login" },
    {
      path: "/attendance",
      component: () => import("../pages/attendance/AttendanceTerminal.vue"),
    },
    {
      path: "/admin/login",
      component: () => import("../pages/auth/AdminLogin.vue"),
    },
    {
      path: "/admin",
      component: () => import("../layouts/AdminLayout.vue"),
      meta: { auth: true },
      redirect: "/admin/dashboard",
      children: [
        {
          path: "dashboard",
          component: () => import("../pages/admin/Dashboard.vue"),
        },
        {
          path: "sessions",
          component: () => import("../pages/admin/Sessions.vue"),
          meta: { roles: ["admin"] },
        },
        {
          path: "attendees",
          component: () => import("../pages/admin/Attendees.vue"),
        },
        {
          path: "attendees/:id",
          component: () => import("../pages/admin/AttendeeDetails.vue"),
        },
        {
          path: "records",
          component: () => import("../pages/admin/Records.vue"),
          meta: { roles: ["admin", "super_admin"] },
        },
        {
          path: "administrators",
          component: () => import("../pages/admin/Administrators.vue"),
          meta: { roles: ["super_admin"] },
        },
        {
          path: "profile",
          component: () => import("../pages/admin/Profile.vue"),
        },
      ],
    },
    { path: "/admin/settings", redirect: "/admin/profile" },
    { path: "/:p(.*)*", redirect: "/admin/login" },
  ],
});
router.beforeEach(async (to) => {
  const a = useAuthStore();
  if (!a.ready) await a.restore();
  if (to.path === "/admin/login" && a.isAuthed) return "/admin/dashboard";
  if (to.matched.some((r) => r.meta.auth) && !a.isAuthed) return "/admin/login"; // UX only; backend must enforce authorization
  const roles = to.meta.roles;
  if (roles && !roles.includes(a.role)) return "/admin/dashboard";
});
export default router;
