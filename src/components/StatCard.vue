<template>
  <div class="p-6 rounded-2xl glass-card border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
    <div class="space-y-2">
      <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {{ title }}
      </span>
      <h3 class="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
        {{ value }}
      </h3>
      <div v-if="trend" class="flex items-center gap-1.5 text-xs">
        <component
          :is="trendUp ? ArrowUpIcon : ArrowDownIcon"
          class="w-3.5 h-3.5"
          :class="[trendUp ? 'text-emerald-500' : 'text-rose-500']"
        />
        <span
          class="font-bold"
          :class="[trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400']"
        >
          {{ trend }}
        </span>
        <span class="text-slate-400">{{ context }}</span>
      </div>
    </div>

    <!-- Icon circle -->
    <div
      class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
      :class="getColorClass(color)"
    >
      <component :is="icon" class="w-6 h-6" />
    </div>
  </div>
</template>

<script setup>
import {
  TrendingUp as ArrowUpIcon,
  TrendingDown as ArrowDownIcon
} from 'lucide-vue-next';

defineProps({
  title: String,
  value: [String, Number],
  icon: Object,
  trend: String,
  trendUp: Boolean,
  context: String,
  color: { type: String, default: 'purple' }
});

const getColorClass = (color) => {
  switch (color) {
    case 'emerald':
      return 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
    case 'blue':
      return 'bg-blue-500/10 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
    case 'amber':
      return 'bg-amber-500/10 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
    case 'rose':
      return 'bg-rose-500/10 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400';
    default:
      return 'bg-primary-500/10 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400';
  }
};
</script>
