<template>
  <div class="w-full space-y-4 skeleton-pulse">
    <!-- Header skeleton -->
    <div class="h-10 bg-slate-200/50 dark:bg-slate-800/40 rounded-xl w-full"></div>
    
    <!-- Rows skeleton -->
    <div class="space-y-2">
      <div v-for="i in rows" :key="i" class="h-12 bg-slate-100/50 dark:bg-slate-900/30 rounded-xl w-full flex items-center justify-between px-4">
        <div class="h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded-md w-1/4"></div>
        <div class="h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded-md w-1/6"></div>
        <div class="h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded-md w-1/5"></div>
        <div class="h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded-md w-12"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Number, default: 5 }
});
</script>
