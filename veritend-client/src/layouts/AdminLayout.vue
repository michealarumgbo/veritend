<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LayoutDashboard, CalendarClock, ShieldCheck, LogOut, Users, ClipboardList, UserCog, UserCircle, Menu, X } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'
const auth = useAuthStore(), router = useRouter(), route = useRoute()
const all = [{ to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard }, { to: '/admin/attendees', label: 'Attendees', icon: Users }, { to: '/admin/sessions', label: 'Attendance Sessions', icon: CalendarClock, role: 'admin' }, { to: '/admin/records', label: 'Attendance Records', icon: ClipboardList, role: ['admin', 'super_admin'] }, { to: '/admin/administrators', label: 'Administrators', icon: UserCog, role: 'super_admin' }, { to: '/admin/profile', label: 'Profile', icon: UserCircle }]
const nav = computed(() => all.filter(n => !n.role || [].concat(n.role).includes(auth.role)))
// mobile drawer
const open = ref(false), mobile = ref(false), mq = window.matchMedia('(max-width: 767px)')
const sync = () => { mobile.value = mq.matches; if (!mq.matches) open.value = false }
const onKey = e => e.key === 'Escape' && (open.value = false)
onMounted(() => { sync(); mq.addEventListener('change', sync); document.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { mq.removeEventListener('change', sync); document.removeEventListener('keydown', onKey); document.body.style.overflow = '' })
watch(() => route.path, () => (open.value = false))
watch(open, v => (document.body.style.overflow = v ? 'hidden' : ''))
async function out() { await auth.logout(); router.push('/admin/login') }
</script>
<template>
  <div class="min-h-screen md:flex">
    <header class="md:hidden sticky top-0 z-20 flex items-center gap-3 bg-navy text-white px-3 py-2.5">
      <button class="rounded-lg p-2 hover:bg-white/10" aria-label="Open menu" :aria-expanded="open"
        aria-controls="sidebar" @click="open = true">
        <Menu class="size-6" />
      </button>
      <span class="flex items-center gap-2 font-extrabold text-lg">
        <ShieldCheck class="text-teal" />Veritend
      </span>
    </header>
    <div v-if="open" class="md:hidden fixed inset-0 z-30 bg-slate-900/50" aria-hidden="true" @click="open = false" />
    <aside id="sidebar" :inert="(mobile && !open) || undefined" :aria-label="'Main navigation'"
      class="fixed inset-y-0 left-0 z-40 w-64 bg-navy text-white p-4 flex flex-col gap-1 overflow-y-auto transition-transform duration-200 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:translate-x-0"
      :class="open ? 'translate-x-0' : '-translate-x-full'">
      <div class="flex items-center justify-between mb-4"><span class="flex items-center gap-2 font-extrabold text-lg">
          <ShieldCheck class="text-teal" />Veritend
        </span>
        <button class="md:hidden rounded-lg p-2 hover:bg-white/10" aria-label="Close menu" @click="open = false">
          <X class="size-5" />
        </button>
      </div>
      <router-link v-for="n in nav" :key="n.to" :to="n.to"
        class="flex items-center gap-2 rounded-lg px-3 py-3 md:py-2 text-sm hover:bg-white/10"
        active-class="bg-white/15">
        <component :is="n.icon" class="size-4" />{{ n.label }}
      </router-link>
      <button
        class="mt-auto flex items-center gap-2 rounded-lg px-3 py-3 md:py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10"
        @click="out">
        <LogOut class="size-4" />Sign out
      </button>
    </aside>
    <main class="flex-1 p-4 md:p-8 min-w-0"><router-view /></main>
  </div>
</template>
