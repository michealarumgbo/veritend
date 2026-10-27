import { defineStore } from "pinia";
import { attendeeService } from "../services/attendeeService";
import { useList } from "./listFactory";
export const useAttendeeStore = defineStore("attendees", () => {
  const l = useList(attendeeService.list, { search: "", status: "" });
  const create = async (d) => {
    const r = await attendeeService.create(d);
    await l.fetch(true);
    return r;
  };
  const enrollFace = async (id, d) => {
    await attendeeService.enrollFace(id, d);
    await l.fetch();
  };
  const update = async (id, d) => {
    await attendeeService.update(id, d);
    await l.fetch();
  };
  return { ...l, create, update, enrollFace };
});
