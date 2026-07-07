<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-96 max-w-full pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border glass-card shadow-lg transition-all duration-300"
        :class="getClasses(toast.type)"
      >
        <!-- Icon -->
        <component
          :is="getIcon(toast.type)"
          class="w-5 h-5 mt-0.5 shrink-0"
        />

        <!-- Content -->
        <div class="flex-1">
          <h4 class="text-sm font-semibold">{{ toast.title }}</h4>
          <p class="text-xs mt-1 text-slate-500 dark:text-slate-400">{{ toast.message }}</p>
        </div>

        <!-- Close -->
        <button
          @click="remove(toast.id)"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <XIcon class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useNotificationStore } from '../stores/notifications';
import {
  CheckCircle2 as CheckIcon,
  AlertCircle as AlertIcon,
  Info as InfoIcon,
  AlertTriangle as WarningIcon,
  X as XIcon
} from 'lucide-vue-next';

const store = useNotificationStore();
const toasts = computed(() => store.toasts);
const remove = (id) => store.remove(id);

const getIcon = (type) => {
  switch (type) {
    case 'success': return CheckIcon;
    case 'error': return AlertIcon;
    case 'warning': return WarningIcon;
    default: return InfoIcon;
  }
};

const getClasses = (type) => {
  switch (type) {
    case 'success':
      return 'border-emerald-200/50 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/20';
    case 'error':
      return 'border-rose-200/50 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/20';
    case 'warning':
      return 'border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/20';
    default:
      return 'border-blue-200/50 dark:border-blue-900/30 text-blue-800 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-950/20';
  }
};
</script>

<style scoped>
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.9);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
