<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ShieldCheck, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/authStore'
const auth = useAuthStore(), router = useRouter()
const loginId = ref(''), pw = ref(''), err = ref(''), busy = ref(false)
async function submit() {
  err.value = ''; if (!loginId.value.trim() || !pw.value) return (err.value = 'Enter your login ID and password.')
  busy.value = true
  try { await auth.login(loginId.value.trim(), pw.value); router.push('/admin/dashboard') } catch (e) { err.value = e.message } finally { busy.value = false }
}
</script>
<template>
  <main class="min-h-screen grid place-items-center px-4">
    <form class="card w-full max-w-sm space-y-4" @submit.prevent="submit" novalidate>
      <div class="flex items-center gap-2 text-navy">
        <ShieldCheck class="text-teal" /><span class="text-xl font-extrabold">Veritend</span><span
          class="text-xs text-slate-500 ml-auto">Staff</span>
      </div>
      <div><label for="id" class="text-sm font-medium">Login ID</label><input id="id" v-model="loginId"
          class="input mt-1" autocomplete="username" placeholder="e.g. STAFF/123456AB" /></div>
      <div><label for="pw" class="text-sm font-medium">Password</label><input id="pw" v-model="pw" type="password"
          class="input mt-1" autocomplete="current-password" /></div>
      <p v-if="err" role="alert" class="text-sm text-red-700 bg-red-50 rounded-lg p-3">{{ err }}</p>
      <button class="btn-primary w-full" :disabled="busy">
        <Loader2 v-if="busy" class="size-4 animate-spin" />Sign in
      </button>
    </form>
  </main>
</template>
