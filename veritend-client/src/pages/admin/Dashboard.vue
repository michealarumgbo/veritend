<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useAuthStore } from '../../stores/authStore'
import { useSessionStore } from '../../stores/sessionStore'
import { attendeeService } from '../../services/attendeeService'
import { adminService } from '../../services/adminService'
import { recordService } from '../../services/recordService'
import BarChart from '../../components/common/BarChart.vue'
const auth = useAuthStore(), s = useSessionStore()
const isSuper = computed(() => auth.role === 'super_admin')
const days = ref(14), activity = ref(null), totals = ref({ attendees: null, admins: null }), err = ref(''), loading = ref(true)
async function loadActivity() { try { activity.value = await recordService.activity(days.value) } catch (e) { err.value = e.message } }
async function load() {
  loading.value = true; err.value = ''
  const jobs = [s.refresh(), loadActivity()]
  if (isSuper.value) jobs.push(Promise.all([attendeeService.list({ size: 1 }), adminService.list({ size: 1 })]).then(([a, b]) => { totals.value = { attendees: a.total, admins: b.total } }).catch(e => { err.value = e.message }))
  await Promise.all(jobs); loading.value = false
}
onMounted(load)
watch(days, loadActivity)
const fmt = d => new Date(d + 'T00:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
const points = computed(() => (activity.value?.days || []).map(d => ({ label: fmt(d.date), short: fmt(d.date), value: d.count })))
const rangeTotal = computed(() => points.value.reduce((n, p) => n + p.value, 0))
const today = computed(() => points.value.at(-1)?.value ?? 0)
const openCount = computed(() => s.list.filter(x => x.status === 'open').length)
const records = computed(() => s.list.reduce((n, x) => n + x.count, 0))
const busiest = computed(() => activity.value?.bySession || [])
const topCount = computed(() => Math.max(1, ...busiest.value.map(b => b.count)))
const v = x => (x === null || loading.value ? '…' : x)
const cards = computed(() => isSuper.value
  ? [['Total attendees', totals.value.attendees], ['Total administrators', totals.value.admins], ['Attendance sessions created', s.list.length], ['Attendance today', today.value]]
  : [['Sessions you created', s.list.length], ['Open right now', openCount.value], ['Records collected', records.value], ['Attendance today', today.value]])
</script>
<template>
  <h1 class="text-2xl font-extrabold text-navy">{{ isSuper ? 'Overview' : `Welcome back, ${auth.user?.firstname}` }}
  </h1>
  <p class="text-sm text-slate-500 mb-4">
    {{ isSuper ? 'System-wide statistics across all administrators.' :
      'Everything here comes from the sessions you created.' }}
  </p>
  <p v-if="s.error || err" role="alert" class="text-sm text-red-700 bg-red-50 rounded-lg p-3 mb-4">{{ s.error || err }}
    <button class="underline" @click="load">Retry</button>
  </p>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div v-for="c in cards" :key="c[0]" class="card">
      <p class="text-xs text-slate-500">{{ c[0] }}</p>
      <p class="text-3xl font-extrabold text-navy">{{ v(c[1]) }}</p>
    </div>
  </div>
  <div class="grid lg:grid-cols-3 gap-4 mt-4">
    <section class="card lg:col-span-2">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 class="font-bold text-navy">Attendance activity</h2>
          <p class="text-xs text-slate-500">{{ isSuper ? 'All sessions' : 'Your sessions' }} · {{ rangeTotal }} in the
            last {{ days }} days</p>
        </div>
        <div class="flex gap-1" role="group" aria-label="Range"><button v-for="d in [7, 14, 30]" :key="d"
            class="rounded-lg px-2.5 py-1 text-xs font-semibold"
            :class="days === d ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            :aria-pressed="days === d" @click="days = d">{{ d }}d</button></div>
      </div>
      <div v-if="loading && !activity" class="h-48 rounded-lg bg-slate-100 animate-pulse" />
      <template v-else>
        <BarChart :points="points" :label="`Attendance per day, last ${days} days`" />
        <p v-if="!rangeTotal" class="text-xs text-slate-500 text-center mt-2">No attendance recorded in this period.</p>
      </template>
    </section>
    <section class="card">
      <h2 class="font-bold text-navy mb-3">Busiest sessions</h2>
      <p v-if="!busiest.length" class="text-sm text-slate-500">Nothing recorded yet.</p>
      <ul class="space-y-3">
        <li v-for="b in busiest" :key="b.id">
          <div class="flex justify-between text-sm gap-2"><span class="truncate">{{ b.title }}</span><span
              class="font-semibold">{{ b.count }}</span></div>
          <div class="h-1.5 rounded-full bg-slate-100 mt-1">
            <div class="h-1.5 rounded-full bg-teal" :style="{ width: (b.count / topCount) * 100 + '%' }" />
          </div>
        </li>
      </ul>
    </section>
  </div>
  <section v-if="!isSuper" class="card mt-4">
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-bold text-navy">Your sessions</h2><router-link to="/admin/sessions"
        class="text-xs text-royal underline">Manage</router-link>
    </div>
    <p v-if="!s.loading && !s.list.length" class="text-sm text-slate-500">You have not created a session yet.
      <router-link to="/admin/sessions" class="text-royal underline">Create one</router-link> and it opens straight
      away.
    </p>
    <ul class="divide-y">
      <li v-for="x in s.list.slice(0, 5)" :key="x.id" class="py-2 flex flex-wrap items-center gap-3 text-sm">
        <span class="flex-1 min-w-40 font-medium">{{ x.title }}</span><span class="text-xs text-slate-500">{{ x.count }}
          records</span>
        <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          :class="x.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'">{{ x.status
          }}</span>
        <a v-if="x.status === 'open'" :href="`/attendance?session=${x.id}`" target="_blank" rel="noopener"
          class="text-royal underline text-xs">Open terminal</a>
      </li>
    </ul>
  </section>
</template>
