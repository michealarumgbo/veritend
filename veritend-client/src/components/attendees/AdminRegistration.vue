<script setup>
import BaseModal from '../common/BaseModal.vue'
import { ref } from 'vue'
import { Loader2, Copy } from 'lucide-vue-next'
import { useAdminStore } from '../../stores/adminStore'
import { useNotify } from '../../stores/notifyStore'
const emit = defineEmits(['close'])
const s = useAdminStore(), n = useNotify()
const form = ref({ surname: '', firstname: '' }), errs = ref({}), busy = ref(false), created = ref(null), password = ref('')
async function register() {
  const d = form.value; errs.value = {}
  if (!d.surname.trim()) errs.value.surname = 'Surname is required.'
  if (!d.firstname.trim()) errs.value.firstname = 'First name is required.'
  if (Object.keys(errs.value).length) return
  busy.value = true
  try { const { password: pw, ...a } = await s.create({ surname: d.surname.trim(), firstname: d.firstname.trim() }); created.value = a; password.value = pw }
  catch (e) { n.push(e.message, 'error') } finally { busy.value = false }
}
const copy = async () => { try { await navigator.clipboard.writeText(password.value); n.push('Password copied.') } catch { n.push('Copy failed. Select and copy manually.', 'error') } }
function close() { password.value = ''; emit('close') } // password only lives in memory
</script>
<template>
  <BaseModal title="Register administrator" @close="close">
    <form v-if="!created" class="grid sm:grid-cols-2 gap-3 items-start" @submit.prevent="register" novalidate>
      <div><label for="as" class="text-sm font-medium">Surname</label><input id="as" v-model="form.surname"
          class="input mt-1" />
        <p class="text-xs text-red-600">{{ errs.surname }}</p>
      </div>
      <div><label for="af" class="text-sm font-medium">First name</label><input id="af" v-model="form.firstname"
          class="input mt-1" />
        <p class="text-xs text-red-600">{{ errs.firstname }}</p>
      </div>
      <p class="sm:col-span-2 text-xs text-slate-500">The login ID and password are generated when you register.</p>
      <div class="sm:col-span-2 flex gap-2"><button class="btn-primary" :disabled="busy">
          <Loader2 v-if="busy" class="size-4 animate-spin" />Register administrator
        </button><button type="button" class="btn-secondary" @click="close">Cancel</button></div>
    </form>
    <div v-else class="space-y-3">
      <h2 class="font-bold text-navy">Administrator registered</h2>
      <dl class="text-sm bg-slate-50 rounded-lg p-4 space-y-1">
        <div class="flex justify-between">
          <dt class="text-slate-500">Name</dt>
          <dd>{{ created.surname }} {{ created.firstname }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-slate-500">Login ID</dt>
          <dd class="font-mono font-bold">{{ created.loginId }}</dd>
        </div>
        <div class="flex justify-between items-center">
          <dt class="text-slate-500">Password</dt>
          <dd class="font-mono font-bold">{{ password }} <button class="ml-1 align-middle" aria-label="Copy password"
              @click="copy">
              <Copy class="size-4 inline" />
            </button></dd>
        </div>
      </dl>
      <p class="text-xs text-amber-700">Shown only now. Give these to the administrator; they sign in with the login ID
        and password.</p>
      <button class="btn-primary" @click="close">Done</button>
    </div>
  </BaseModal>
</template>
