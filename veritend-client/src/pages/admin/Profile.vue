<script setup>
import { useAuthStore } from '../../stores/authStore'
const u = useAuthStore().user
</script>
<template>
  <h1 class="text-2xl font-extrabold text-navy">Profile</h1>
  <p class="text-sm text-slate-500 mb-4">Your account details. These are managed by a super administrator.</p>
  <dl class="card max-w-md text-sm space-y-2">
    <div class="flex justify-between">
      <dt class="text-slate-500">Surname</dt>
      <dd>{{ u.surname }}</dd>
    </div>
    <div class="flex justify-between">
      <dt class="text-slate-500">First name</dt>
      <dd>{{ u.firstname }}</dd>
    </div>
    <div class="flex justify-between">
      <dt class="text-slate-500">Login ID</dt>
      <dd class="font-mono">{{ u.loginId }}</dd>
    </div>
    <div class="flex justify-between">
      <dt class="text-slate-500">Role</dt>
      <dd>{{ u.role === 'super_admin' ? 'Super administrator' : 'Administrator' }}</dd>
    </div>
  </dl>
</template>
