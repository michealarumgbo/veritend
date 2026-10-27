<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'
defineProps({ title: String })
const emit = defineEmits(['close'])
const panel = ref(null), onKey = e => e.key === 'Escape' && emit('close')
onMounted(() => { document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'; panel.value?.focus() })
onBeforeUnmount(() => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' })
</script>
<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-40 grid place-items-center bg-slate-900/50 p-4">
      <div ref="panel" tabindex="-1" role="dialog" aria-modal="true" :aria-label="title"
        class="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-5 shadow-xl outline-none">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-extrabold text-navy">{{ title }}</h2>
          <button class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close" @click="emit('close')">
            <X class="size-5" />
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
