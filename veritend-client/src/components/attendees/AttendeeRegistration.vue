<script setup>
import BaseModal from '../common/BaseModal.vue'
import { ref } from 'vue'
import { Camera, Loader2, Copy } from 'lucide-vue-next'
import { useAttendeeStore } from '../../stores/attendeeStore'
import { useNotify } from '../../stores/notifyStore'
import { useCamera } from '../../composables/useCamera'
import { useFaceRecognition } from '../../composables/useFaceRecognition'
const emit = defineEmits(['close'])
const s = useAttendeeStore(), n = useNotify(), cam = useCamera(), face = useFaceRecognition()
const step = ref('form'), form = ref({ surname: '', firstname: '', regNo: '' }), errs = ref({}), busy = ref(false), attendee = ref(null), password = ref(''), msg = ref('')
async function register() {
  const d = form.value; errs.value = {}
  if (!d.surname.trim()) errs.value.surname = 'Surname is required.'
  if (!d.firstname.trim()) errs.value.firstname = 'First name is required.'
  if (!/^[A-Za-z0-9/-]{4,20}$/.test(d.regNo.trim())) errs.value.regNo = 'Enter a valid registration number.'
  if (Object.keys(errs.value).length) return
  busy.value = true
  try { const { password: pw, ...st } = await s.create({ surname: d.surname.trim(), firstname: d.firstname.trim(), regNo: d.regNo.trim() }); attendee.value = st; password.value = pw; step.value = 'face' }
  catch (e) { n.push(e.message, 'error') } finally { busy.value = false }
}
async function enrol() {
  msg.value = ''; busy.value = true
  try { await s.enrollFace(attendee.value.id, await face.getDescriptor(cam.video.value)); cam.stop(); step.value = 'done' }
  catch (e) { msg.value = e.message } finally { busy.value = false }
}
const copy = async () => { try { await navigator.clipboard.writeText(password.value); n.push('Password copied.') } catch { n.push('Copy failed. Select and copy manually.', 'error') } }
function close() { cam.stop(); password.value = ''; emit('close') } // password only ever lives in memory
</script>
<template>
  <BaseModal title="Register attendee" @close="close">
    <ol class="flex gap-2 text-xs font-semibold mb-4">
      <li v-for="(l, i) in ['Details', 'Face enrolment', 'Credentials']" :key="l"
        class="flex-1 rounded-full py-1.5 text-center"
        :class="['form', 'face', 'done'][i] === step ? 'bg-navy text-white' : 'bg-slate-100 text-slate-500'">{{ i + 1 }}
        {{ l }}</li>
    </ol>
    <form v-if="step === 'form'" class="grid sm:grid-cols-3 gap-3 items-start" @submit.prevent="register" novalidate>
      <div><label for="ss" class="text-sm font-medium">Surname</label><input id="ss" v-model="form.surname"
          class="input mt-1" />
        <p class="text-xs text-red-600">{{ errs.surname }}</p>
      </div>
      <div><label for="sf" class="text-sm font-medium">First name</label><input id="sf" v-model="form.firstname"
          class="input mt-1" />
        <p class="text-xs text-red-600">{{ errs.firstname }}</p>
      </div>
      <div><label for="sr" class="text-sm font-medium">Registration no.</label><input id="sr" v-model="form.regNo"
          class="input mt-1" />
        <p class="text-xs text-red-600">{{ errs.regNo }}</p>
      </div>
      <div class="sm:col-span-3 flex gap-2"><button class="btn-primary" :disabled="busy">
          <Loader2 v-if="busy" class="size-4 animate-spin" />Register &amp; continue
        </button><button type="button" class="btn-secondary" @click="close">Cancel</button></div>
    </form>
    <div v-else-if="step === 'face'" class="space-y-3">
      <p class="text-sm">Registered <b>{{ attendee.surname }} {{ attendee.firstname }}</b>. Ask the attendee to face the
        camera to enrol their face.</p>
      <div class="relative aspect-4/3 rounded-xl bg-slate-900 overflow-hidden grid place-items-center">
        <video :ref="el => (cam.video.value = el)" autoplay playsinline muted
          class="absolute inset-0 size-full object-cover scale-x-[-1]" />
        <div class="relative w-36 h-48 rounded-[50%] border-2 border-dashed border-teal/80" />
        <p v-if="cam.state.value !== 'live'" class="absolute text-xs text-slate-300 px-6 text-center">{{
          cam.message.value || 'Camera is off' }}</p>
      </div>
      <button v-if="cam.state.value !== 'live'" class="btn-secondary w-full" @click="cam.start">
        <Camera class="size-4" />
        {{ ['denied', 'unavailable'].includes(cam.state.value) ? 'Retry camera' : 'Enablecamera' }}
      </button>
      <button v-else class="btn-primary w-full" :disabled="busy" @click="enrol">
        <Loader2 v-if="busy" class="size-4 animate-spin" />Enrol face
      </button>
      <p v-if="msg" role="alert" class="text-sm text-red-700 bg-red-50 rounded-lg p-3">{{ msg }}</p>
      <p class="text-xs text-slate-500">If you leave now, the attendee stays registered with face enrolment pending.</p>
      <button class="text-xs underline text-slate-500" @click="close">Leave for now</button>
    </div>
    <div v-else class="space-y-3">
      <h2 class="font-bold text-navy">Registration complete</h2>
      <dl class="text-sm bg-slate-50 rounded-lg p-4 space-y-1">
        <div class="flex justify-between">
          <dt class="text-slate-500">Name</dt>
          <dd>{{ attendee.surname }} {{ attendee.firstname }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-slate-500">Reg. no.</dt>
          <dd>{{ attendee.regNo }}</dd>
        </div>
        <div class="flex justify-between items-center">
          <dt class="text-slate-500">Password</dt>
          <dd class="font-mono font-bold">{{ password }} <button class="ml-1 align-middle" aria-label="Copy password"
              @click="copy">
              <Copy class="size-4 inline" />
            </button></dd>
        </div>
      </dl>
      <p class="text-xs text-amber-700">Shown only now. Give it to the attendee; they use it with their registration
        number to mark attendance.</p>
      <button class="btn-primary" @click="close">Done</button>
    </div>
  </BaseModal>
</template>
