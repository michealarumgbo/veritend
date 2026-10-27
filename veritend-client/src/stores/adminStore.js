import { defineStore } from "pinia";
import { adminService } from "../services/adminService";
import { useList } from "./listFactory";
export const useAdminStore = defineStore("admins", () => {
  const l = useList(adminService.list, { search: "", status: "" });
  const create = async (d) => {
    const r = await adminService.create(d);
    await l.fetch(true);
    return r;
  };
  const update = async (id, d) => {
    await adminService.update(id, d);
    await l.fetch();
  };
  return { ...l, create, update };
});
