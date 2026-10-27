<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ShieldCheck, Eye, EyeOff, Camera, CheckCircle2, Loader2 } from 'lucide-vue-next'
import { useAttendanceStore } from '../../stores/attendanceStore'
import { useCamera } from '../../composables/useCamera'
import { useFaceRecognition } from '../../composables/useFaceRecognition'
const a = useAttendanceStore(), cam = useCamera(), face = useFaceRecognition()
const reg = ref(''), pw = ref(''), show = ref(false), touched = ref(false), faceMsg = ref('')
const isOpen = computed(() => a.session?.status === 'open')
onMounted(() => a.loadSession(useRoute().query.session))
const bad = () => !reg.value.trim() || !pw.value
function submit() { touched.value = true; if (!bad() && a.session) a.verifyCredentials(reg.value.trim(), pw.value) }
watch(() => a.step, s => { if (s !== 'face') cam.stop() })
const scanLoading = ref(false)
async function scan() {
  scanLoading.value = true
  faceMsg.value = ''
  try { await a.submitFace(await face.getDescriptor(cam.video.value)) } catch (e) { faceMsg.value = e.message } finally { scanLoading.value = false }
}
function restart() { cam.stop(); reg.value = pw.value = ''; touched.value = false; a.reset() }
const time = t => new Date(t).toLocaleString()
</script>
<template>
  <main class="min-h-screen flex flex-col items-center px-4 py-8">
    <header class="text-center mb-6">
      <div class="inline-flex items-center gap-2 text-navy">
        <ShieldCheck class="size-7 text-teal" /><span class="text-2xl font-extrabold tracking-tight">Veritend</span>
      </div>
      <p class="text-sm text-slate-500 mt-1">Every Identity. Every Attendance. Verified.</p>
    </header>
    <section class="card w-full max-w-md">
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-500">Active session</p>
          <p class="font-bold text-navy">{{ a.session?.title || 'No active session' }}</p>
        </div>
        <span class="rounded-full px-2.5 py-1 text-xs font-semibold"
          :class="isOpen ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'">{{ isOpen ? 'Open' : a.session
            ? 'Closed' : 'No session' }}</span>
      </div>
      <ol class="flex items-center gap-2 text-xs font-semibold mb-5" aria-label="Progress">
        <li class="flex-1 rounded-full py-1.5 text-center"
          :class="a.step === 'creds' ? 'bg-navy text-white' : 'bg-teal/15 text-teal'">1 Identity</li>
        <li class="flex-1 rounded-full py-1.5 text-center"
          :class="a.step === 'face' ? 'bg-navy text-white' : a.step === 'done' ? 'bg-teal/15 text-teal' : 'bg-slate-100 text-slate-500'">
          2 Facial</li>
      </ol>
      <p v-if="!isOpen" class="text-sm text-slate-600 py-6 text-center">
        {{ a.error || (a.session ? 'This session is closed.' : 'Loading session…') }}</p>
      <form v-else-if="a.step === 'creds'" @submit.prevent="submit" novalidate class="space-y-4">
        <div><label for="reg" class="text-sm font-medium">Registration number</label>
          <input id="reg" v-model="reg" class="input mt-1" autocomplete="username" :aria-invalid="touched && !reg"
            aria-describedby="e1" />
          <p id="e1" v-if="touched && !reg" class="text-xs text-red-600 mt-1">Enter your registration number.</p>
        </div>
        <div><label for="pw" class="text-sm font-medium">Password</label>
          <div class="relative mt-1"><input id="pw" v-model="pw" :type="show ? 'text' : 'password'" class="input pr-10"
              autocomplete="current-password" />
            <button type="button" class="absolute right-2 top-2.5 text-slate-500" @click="show = !show"
              :aria-label="show ? 'Hide password' : 'Show password'">
              <component :is="show ? EyeOff : Eye" class="size-5" />
            </button>
          </div>
          <p v-if="touched && !pw" class="text-xs text-red-600 mt-1">Enter your password.</p>
        </div>
        <p v-if="a.error" role="alert" class="text-sm text-red-700 bg-red-50 rounded-lg p-3">{{ a.error }}</p>
        <button class="btn-primary w-full" :disabled="a.loading">
          <Loader2 v-if="a.loading" class="size-4 animate-spin" />Verify identity
        </button>
      </form>
      <div v-else-if="a.step === 'face'" class="space-y-4">
        <div class="relative aspect-4/3 rounded-xl bg-slate-900 overflow-hidden grid place-items-center">
          <video :ref="el => (cam.video.value = el)" autoplay playsinline muted
            class="absolute inset-0 size-full object-cover scale-x-[-1]" />
          <div class="relative w-36 h-48 rounded-[50%] border-2 border-dashed border-teal/80" />
          <p v-if="cam.state.value !== 'live'" class="absolute text-xs text-slate-300 px-6 text-center">{{
            cam.message.value || 'Camera is off' }}</p>
        </div>
        <p class="text-xs text-slate-500">Face the camera in good light, keep your face inside the frame, and remove
          glasses or masks if possible.</p>
        <button v-if="cam.state.value !== 'live'" class="btn-secondary w-full" @click="cam.start">
          <Camera class="size-4" />{{ cam.state.value === 'denied' || cam.state.value === 'unavailable' ? 'Retry camera'
            :
            'Enable camera' }}
        </button>
        <button v-else class="btn-primary w-full" :disabled="scanLoading" @click="scan">
          <Loader2 v-if="scanLoading" class="size-4 animate-spin" />Scan face
        </button>
        <p v-if="faceMsg || a.error" role="alert" class="text-sm text-red-700 bg-red-50 rounded-lg p-3">{{ faceMsg ||
          a.error }}</p>
        <button class="text-xs text-slate-500 underline" @click="restart">Start over</button>
      </div>
      <div v-else class="text-center space-y-3 py-2">
        <CheckCircle2 class="size-14 text-green-600 mx-auto" />
        <h2 class="text-lg font-bold text-navy">Attendance recorded</h2>
        <dl class="text-sm text-left bg-slate-50 rounded-lg p-4 space-y-1">
          <div class="flex justify-between">
            <dt class="text-slate-500">Name</dt>
            <dd>{{ a.receipt.attendee.name }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Reg. no.</dt>
            <dd>{{ a.receipt.attendee.regNo }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Session</dt>
            <dd>{{ a.session.title }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Time</dt>
            <dd>{{ time(a.receipt.timestamp) }}</dd>
          </div>
        </dl>
        <button class="btn-primary w-full" @click="restart">Done</button>
      </div>
    </section>
    <router-link to="/admin/login" class="mt-6 text-xs text-slate-500 hover:underline">Staff portal</router-link>
  </main>
</template>
