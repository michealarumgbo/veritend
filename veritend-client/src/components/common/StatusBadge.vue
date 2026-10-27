<script setup>
defineProps({ status: String })
const c = { active: 'bg-green-100 text-green-800', enrolled: 'bg-green-100 text-green-800', suspended: 'bg-red-100 text-red-800', pending: 'bg-amber-100 text-amber-800' }
</script>
<template><span class="rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
        :class="c[status] || 'bg-slate-100 text-slate-600'">{{ status }}</span></template>
