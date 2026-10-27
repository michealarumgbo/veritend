<script setup>
import { computed } from 'vue'
const p = defineProps({ page: Number, total: Number, size: { type: Number, default: 8 } })
const e = defineEmits(['change'])
const pages = computed(() => Math.max(1, Math.ceil(p.total / p.size)))
</script>
<template>
  <div class="flex items-center justify-between text-sm text-slate-600 mt-3">
    <span>{{ total }} result{{ total === 1 ? '' : 's' }}</span>
    <div class="flex items-center gap-2">
      <button class="btn-secondary" :disabled="page <= 1" @click="e('change', page - 1)">Previous</button>
      <span>{{ page }} / {{ pages }}</span>
      <button class="btn-secondary" :disabled="page >= pages" @click="e('change', page + 1)">Next</button>
    </div>
  </div>
</template>
