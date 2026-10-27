<script setup>
import { ref, onMounted } from 'vue'
import { ExternalLink } from 'lucide-vue-next'
import { useSessionStore } from '../../stores/sessionStore'
import { useNotify } from '../../stores/notifyStore'
const s = useSessionStore(), n = useNotify(), title = ref(''), closing = ref(null)
onMounted(s.refresh)
async function add() { if (!title.value.trim()) return n.push('Enter a session title.', 'error'); try { await s.create(title.value.trim()); title.value = ''; n.push('Session created and opened.') } catch (e) { n.push(e.message, 'error') } }
async function set(id, st) { try { await s.setStatus(id, st); closing.value = null; n.push(`Session ${st}.`) } catch (e) { n.push(e.message, 'error') } }
</script>
<template>
  <h1 class="text-2xl font-extrabold text-navy">Attendance Sessions</h1>
  <p class="text-sm text-slate-500 mb-4">You see only sessions you created. Several can be open at once; each has its
    own terminal.</p>
  <form class="card flex gap-2 mb-4" @submit.prevent="add"><label for="t" class="sr-only">Session title</label>
    <input id="t" v-model="title" class="input" placeholder="e.g. COS 434 – Computer Graphics" /><button
      class="btn-primary">Create &amp; open</button>
  </form>
  <p v-if="s.error" role="alert" class="text-sm text-red-700 bg-red-50 rounded-lg p-3">{{ s.error }}</p>
  <p v-else-if="!s.loading && !s.list.length" class="card text-sm text-slate-500">No sessions yet. Create your first one
    above.</p>
  <ul class="space-y-2">
    <li v-for="x in s.list" :key="x.id" class="card flex flex-wrap items-center gap-3">
      <div class="flex-1 min-w-48">
        <p class="font-semibold">{{ x.title }}</p>
        <p class="text-xs text-slate-500">{{ new Date(x.createdAt).toLocaleDateString() }} · {{ x.count }} records</p>
      </div>
      <span class="rounded-full px-2.5 py-1 text-xs font-semibold"
        :class="x.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'">{{ x.status }}</span>
      <a v-if="x.status === 'open'" :href="`/attendance?session=${x.id}`" target="_blank" rel="noopener"
        class="btn-secondary">Open terminal
        <ExternalLink class="size-4" />
      </a>
      <button v-if="x.status !== 'open'" class="btn-secondary" @click="set(x.id, 'open')">Open</button>
      <template v-else-if="closing !== x.id"><button class="btn-secondary" @click="closing = x.id">Close</button></template>
      <template v-else><span class="text-xs text-red-700">Attendees can no longer mark attendance. Close?</span>
        <button class="btn-primary" @click="set(x.id, 'closed')">Confirm</button><button class="btn-secondary"
          @click="closing = null">Cancel</button></template>
    </li>
  </ul>
</template>
