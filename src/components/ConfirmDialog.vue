<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div class="w-full max-w-md p-6 rounded-2xl glass-card border shadow-2xl scale-100 transition-all duration-300">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ title }}</h3>
        <p class="text-sm mt-3 text-slate-500 dark:text-slate-400">{{ message }}</p>
        
        <div class="flex items-center justify-end gap-3 mt-6">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
          >
            {{ cancelText }}
          </button>
          <button
            @click="$emit('confirm')"
            class="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-600/10 transition-colors"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: 'Confirm Action' },
  message: { type: String, default: 'Are you sure you want to proceed?' },
  confirmText: { type: String, default: 'Delete' },
  cancelText: { type: String, default: 'Cancel' }
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.modal-enter-from {
  opacity: 0;
}
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from .glass-card {
  transform: scale(0.95);
}
.modal-leave-to .glass-card {
  transform: scale(0.95);
}
</style>
