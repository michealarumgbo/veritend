<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { attendeeService } from '../../services/attendeeService'
import { useAuthStore } from '../../stores/authStore'
import { useNotify } from '../../stores/notifyStore'
import StatusBadge from '../../components/common/StatusBadge.vue'
const id = useRoute().params.id, n = useNotify(), isSuper = useAuthStore().role === 'super_admin'
const st = ref(null), surname = ref(''), firstname = ref(''), err = ref('')
async function load() { try { st.value = await attendeeService.get(id); if (!st.value) throw new Error('Attendee not found.'); surname.value = st.value.surname; firstname.value = st.value.firstname } catch (e) { err.value = e.message } }
onMounted(load)
async function save() { if (!surname.value.trim() || !firstname.value.trim()) return n.push('Both names are required.', 'error'); try { await attendeeService.update(id, { surname: surname.value.trim(), firstname: firstname.value.trim() }); await load(); n.push('Details saved.') } catch (e) { n.push(e.message, 'error') } }
async function toggle() { try { await attendeeService.update(id, { status: st.value.status === 'active' ? 'suspended' : 'active' }); await load(); n.push('Account updated.') } catch (e) { n.push(e.message, 'error') } }
</script>
<template>
  <router-link to="/admin/attendees" class="text-sm text-royal underline">← All attendees</router-link>
  <p v-if="err" role="alert" class="mt-3 text-sm text-red-700 bg-red-50 rounded-lg p-3">{{ err }}</p>
  <p v-else-if="!st" class="mt-3 text-slate-400">Loading…</p>
  <div v-else class="mt-3 grid lg:grid-cols-2 gap-4">
    <form class="card space-y-3" @submit.prevent="save">
      <h1 class="text-xl font-extrabold text-navy">{{ st.regNo }}</h1>
      <div><label for="d1" class="text-sm font-medium">Surname</label><input id="d1" v-model="surname"
          class="input mt-1" :disabled="isSuper" /></div>
      <div><label for="d2" class="text-sm font-medium">First name</label><input id="d2" v-model="firstname"
          class="input mt-1" :disabled="isSuper" /></div>
      <button v-if="!isSuper" class="btn-primary">Save changes</button>
    </form>
    <div class="card space-y-3">
      <h2 class="font-bold text-navy">Account &amp; biometrics</h2>
      <p class="text-sm flex justify-between">Account
        <StatusBadge :status="st.status" />
      </p>
      <p class="text-sm flex justify-between">Face enrolment
        <StatusBadge :status="st.enrolled ? 'enrolled' : 'pending'" />
      </p>
      <p class="text-xs text-slate-500">Facial descriptors are never shown in this interface.</p>
      <button v-if="isSuper" class="btn-secondary" @click="toggle">{{ st.status === 'active' ? 'Suspend account' :
        'Reactivate account' }}</button>
    </div>
  </div>
</template>
