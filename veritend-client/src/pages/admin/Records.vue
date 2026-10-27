<script setup>
import { onMounted } from 'vue'
import { Download } from 'lucide-vue-next'
import { useRecordStore } from '../../stores/recordStore'
import { useAuthStore } from '../../stores/authStore'
import { useNotify } from '../../stores/notifyStore'
import Pager from '../../components/common/Pager.vue'
const r = useRecordStore(), n = useNotify(), isSuper = useAuthStore().role === 'super_admin'
onMounted(() => { r.fetch(); r.loadSessions() })
const when = t => new Date(t).toLocaleString()
async function exp() { try { await r.exportCsv() } catch (e) { n.push(e.message, 'error') } }
</script>
<template>
  <div class="flex items-start justify-between gap-3 mb-4">
    <div>
      <h1 class="text-2xl font-extrabold text-navy">Attendance Records</h1>
      <p class="text-sm text-slate-500">Times shown are those recorded by the server.
        {{ isSuper ? 'Showing alladministrators’ sessions.' : 'Showing only your sessions.' }}
      </p>
    </div>
    <button class="btn-secondary" @click="exp">
      <Download class="size-4" />Export CSV
    </button>
  </div>
  <div class="flex flex-wrap gap-2 mb-3 items-end">
    <input v-model="r.f.search" @input="r.fetch(true)" class="input max-w-xs" placeholder="Search attendee or reg. no."
      aria-label="Search" />
    <select v-model="r.f.session" @change="r.fetch(true)" class="input max-w-60" aria-label="Session">
      <option value="">All sessions</option>
      <option v-for="t in r.sessions" :key="t.id" :value="t.id">{{ t.title }}</option>
    </select>
    <label class="text-xs">From<input v-model="r.f.from" @change="r.fetch(true)" type="date"
        class="input mt-1" /></label>
    <label class="text-xs">To<input v-model="r.f.to" @change="r.fetch(true)" type="date" class="input mt-1" /></label>
  </div>
  <p v-if="r.error" role="alert" class="text-sm text-red-700 bg-red-50 rounded-lg p-3 mb-3">{{ r.error }} <button
      class="underline" @click="r.fetch()">Retry</button></p>
  <div class="card p-0 overflow-x-auto">
    <table class="w-full text-sm min-w-155">
      <thead class="text-left text-xs text-slate-500 border-b">
        <tr>
          <th class="p-3">Attendee</th>
          <th>Reg. no.</th>
          <th>Session</th>
          <th v-if="isSuper">Admin</th>
          <th>Recorded</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="r.loading">
          <td colspan="5" class="p-6 text-center text-slate-400">Loading…</td>
        </tr>
        <tr v-else-if="!r.items.length">
          <td colspan="5" class="p-6 text-center text-slate-500">No records match these filters.</td>
        </tr>
        <tr v-else v-for="x in r.items" :key="x.id" class="border-b last:border-0">
          <td class="p-3">{{ x.name }}</td>
          <td>{{ x.regNo }}</td>
          <td>{{ x.session }}</td>
          <td v-if="isSuper">{{ x.ownerName }}</td>
          <td>{{ when(x.recordedAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <Pager :page="r.page" :total="r.total" @change="p => { r.page = p; r.fetch() }" />
</template>
