<script setup>
import { computed } from 'vue'
// Dependency-free SVG bar chart. points: [{ label, short, value }]
const props = defineProps({ points: { type: Array, default: () => [] }, label: { type: String, default: 'Bar chart' } })
const W = 600, H = 220, L = 34, B = 28, T = 10
const max = computed(() => { const m = Math.max(0, ...props.points.map(p => p.value)); return m <= 4 ? 4 : Math.ceil(m / 4) * 4 })
const ticks = computed(() => [0, 1, 2, 3, 4].map(i => (max.value / 4) * i))
const slot = computed(() => (W - L) / Math.max(1, props.points.length))
const y = v => H - B - (v / max.value) * (H - B - T)
const bars = computed(() => props.points.map((p, i) => ({ p, x: L + i * slot.value + slot.value * 0.15, w: slot.value * 0.7, y: y(p.value), h: H - B - y(p.value) })))
const step = computed(() => Math.max(1, Math.ceil(props.points.length / 7)))
</script>
<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto" role="img" :aria-label="label">
    <g v-for="t in ticks" :key="t">
      <line :x1="L" :x2="W" :y1="y(t)" :y2="y(t)" class="stroke-slate-200" /><text :x="L - 6" :y="y(t) + 3"
        text-anchor="end" class="fill-slate-500 text-[10px]">{{ t }}</text>
    </g>
    <g v-for="(b, i) in bars" :key="i">
      <rect :x="b.x" :y="b.y" :width="b.w" :height="b.h" rx="3" class="fill-royal hover:fill-navy">
        <title>{{ b.p.label }}: {{ b.p.value }}</title>
      </rect>
      <text v-if="i % step === 0" :x="b.x + b.w / 2" :y="H - 10" text-anchor="middle"
        class="fill-slate-500 text-[10px]">{{ b.p.short }}</text>
    </g>
  </svg>
</template>
