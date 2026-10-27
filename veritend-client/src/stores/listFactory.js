import { ref } from "vue";
export function useList(fetcher, filters) {
  const items = ref([]),
    total = ref(0),
    page = ref(1),
    loading = ref(false),
    error = ref(""),
    f = ref({ ...filters });
  async function fetch(reset) {
    if (reset) page.value = 1;
    loading.value = true;
    error.value = "";
    try {
      const r = await fetcher({ ...f.value, page: page.value, size: 8 });
      items.value = r.items;
      total.value = r.total;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }
  return { items, total, page, loading, error, f, fetch };
}
