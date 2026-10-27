<script setup>
import { ref, onMounted } from 'vue'
import { UserPlus } from 'lucide-vue-next'
import { useAttendeeStore } from '../../stores/attendeeStore'
import { useAuthStore } from '../../stores/authStore'
import { useNotify } from '../../stores/notifyStore'
import Pager from '../../components/common/Pager.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import AttendeeRegistration from '../../components/attendees/AttendeeRegistration.vue'
const s = useAttendeeStore(), n = useNotify(), isSuper = useAuthStore().role === 'super_admin', open = ref(false)
onMounted(() => s.fetch())
async function toggle(x) { try { await s.update(x.id, { status: x.status === 'active' ? 'suspended' : 'active' }); n.push('Account updated.') } catch (e) { n.push(e.message, 'error') } }
</script>
<template>
  <div class="flex items-start justify-between gap-3 mb-4">
    <div>
      <h1 class="text-2xl font-extrabold text-navy">Attendees</h1>
      <p class="text-sm text-slate-500">Register attendees, enrol faces and manage accounts.</p>
    </div>
    <button v-if="!isSuper" class="btn-primary" @click="open = true">
      <UserPlus class="size-4" />Register attendee
    </button>
  </div>
  <AttendeeRegistration v-if="open" @close="open = false; s.fetch(true)" />
  <div class="flex flex-wrap gap-2 mb-3">
    <label class="sr-only" for="q">Search</label><input id="q" v-model="s.f.search" @input="s.fetch(true)"
      class="input max-w-xs" placeholder="Search name or reg. no." />
    <label class="sr-only" for="st">Status</label><select id="st" v-model="s.f.status" @change="s.fetch(true)"
      class="input max-w-40">
      <option value="">All statuses</option>
      <option value="active">Active</option>
      <option value="suspended">Suspended</option>
    </select>
  </div>
  <p v-if="s.error" role="alert" class="text-sm text-red-700 bg-red-50 rounded-lg p-3 mb-3">{{ s.error }} <button
      class="underline" @click="s.fetch()">Retry</button></p>
  <div class="card p-0 overflow-x-auto">
    <table class="w-full text-sm min-w-160]">
      <thead class="text-left text-xs text-slate-500 border-b">
        <tr>
          <th class="p-3">Reg. no.</th>
          <th>Name</th>
          <th>Status</th>
          <th>Face enrolment</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="s.loading">
          <td colspan="5" class="p-6 text-center text-slate-400">Loading…</td>
        </tr>
        <tr v-else-if="!s.items.length">
          <td colspan="5" class="p-6 text-center text-slate-500">No attendees match your filters.</td>
        </tr>
        <tr v-else v-for="x in s.items" :key="x.id" class="border-b last:border-0">
          <td class="p-3">{{ x.regNo }}</td>
          <td>{{ x.surname }} {{ x.firstname }}</td>
          <td>
            <StatusBadge :status="x.status" />
          </td>
          <td>
            <StatusBadge :status="x.enrolled ? 'enrolled' : 'pending'" />
          </td>
          <td class="text-right pr-3 space-x-2 whitespace-nowrap"><router-link :to="`/admin/attendees/${x.id}`"
              class="text-royal underline">View</router-link>
            <button v-if="isSuper" class="text-slate-600 underline" @click="toggle(x)">{{ x.status === 'active' ?
              'Suspend' : 'Reactivate' }}</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <Pager :page="s.page" :total="s.total" @change="p => { s.page = p; s.fetch() }" />
</template>
