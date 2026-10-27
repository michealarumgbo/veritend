import { defineStore } from "pinia";
import { ref } from "vue";
export const useNotify = defineStore("notify", () => {
  const items = ref([]);
  let id = 0;
  const push = (msg, type = "ok") => {
    const t = { id: ++id, msg, type };
    items.value.push(t);
    setTimeout(
      () => (items.value = items.value.filter((x) => x.id !== t.id)),
      3500,
    );
  };
  return { items, push };
});
