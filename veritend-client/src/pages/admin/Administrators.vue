<script setup>
import { ref, onMounted } from 'vue'
import { UserPlus } from 'lucide-vue-next'
import { useAdminStore } from '../../stores/adminStore'
import { useNotify } from '../../stores/notifyStore'
import Pager from '../../components/common/Pager.vue'
import StatusBadge from '../../components/common/StatusBadge.vue'
import AdminRegistration from '../../components/attendees/AdminRegistration.vue'
const s = useAdminStore(), n = useNotify(), open = ref(false)
onMounted(() => s.fetch())
const toggle = async x => { try { await s.update(x.id, { status: x.status === 'active' ? 'suspended' : 'active' }); n.push('Account updated.') } catch (e) { n.push(e.message, 'error') } }
</script>
<template>
  <div class="flex items-start justify-between gap-3 mb-4">
    <div>
      <h1 class="text-2xl font-extrabold text-navy">Administrators</h1>
      <p class="text-sm text-slate-500">Super administrators only. The backend must also enforce this.</p>
    </div>
    <button class="btn-primary" @click="open = true">
      <UserPlus class="size-4" />Register administrator
    </button>
  </div>
  <AdminRegistration v-if="open" @close="open = false; s.fetch(true)" />
  <div class="flex flex-wrap gap-2 mb-3"><input v-model="s.f.search" @input="s.fetch(true)" class="input max-w-xs"
      placeholder="Search name or login ID" aria-label="Search" />
    <select v-model="s.f.status" @change="s.fetch(true)" class="input max-w-40" aria-label="Status">
      <option value="">All</option>
      <option value="active">Active</option>
      <option value="suspended">Suspended</option>
    </select>
  </div>
  <p v-if="s.error" role="alert" class="text-sm text-red-700 bg-red-50 rounded-lg p-3 mb-3">{{ s.error }}</p>
  <div class="card p-0 overflow-x-auto">
    <table class="w-full text-sm min-w-150">
      <thead class="text-left text-xs text-slate-500 border-b">
        <tr>
          <th class="p-3">Login ID</th>
          <th>Name</th>
          <th>Role</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="s.loading">
          <td colspan="5" class="p-6 text-center text-slate-400">Loading…</td>
        </tr>
        <tr v-else-if="!s.items.length">
          <td colspan="5" class="p-6 text-center text-slate-500">No administrators found.</td>
        </tr>
        <tr v-else v-for="x in s.items" :key="x.id" class="border-b last:border-0">
          <td class="p-3 font-mono">{{ x.loginId }}</td>
          <td>{{ x.surname }} {{ x.firstname }}</td>
          <td>{{ x.role === 'super_admin' ? 'Super admin' : 'Administrator' }}</td>
          <td>
            <StatusBadge :status="x.status" />
          </td>
          <td class="pr-3 text-right"><button v-if="x.role !== 'super_admin'" class="underline text-slate-600"
              @click="toggle(x)">{{ x.status === 'active' ? 'Suspend' : 'Reactivate' }}</button></td>
        </tr>
      </tbody>
    </table>
  </div>
  <Pager :page="s.page" :total="s.total" @change="p => { s.page = p; s.fetch() }" />
</template>
