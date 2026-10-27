<script setup>
import { useNotify } from './stores/notifyStore'
const n = useNotify()
</script>
<template>
  <router-view />
  <div class="fixed bottom-4 right-4 z-50 space-y-2" aria-live="polite">
    <div v-for="t in n.items" :key="t.id" class="rounded-lg px-4 py-3 text-sm text-white shadow-lg"
      :class="t.type === 'error' ? 'bg-red-600' : 'bg-navy'">{{ t.msg }}</div>
  </div>
</template>
