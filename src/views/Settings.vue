<template>
  <div class="space-y-6" ref="viewRef">
    <div class="max-w-xl mx-auto rounded-2xl border glass-card p-6">
      <h3 class="text-sm font-bold text-slate-800 dark:text-white mb-6 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
        Global Store Preferences
      </h3>

      <SkeletonTable v-if="settingsStore.loading" :rows="3" />

      <form v-else @submit.prevent="handleSave" class="space-y-4">
        <!-- Shop Name -->
        <div class="space-y-1.5">
          <label class="text-[10px] font-semibold text-slate-400">Shop Name *</label>
          <input
            v-model="form.shopName"
            type="text"
            class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
            required
          />
        </div>

        <!-- Currency -->
        <div class="space-y-1.5">
          <label class="text-[10px] font-semibold text-slate-400">Default Currency Symbol / Name *</label>
          <input
            v-model="form.currency"
            type="text"
            placeholder="e.g. USD, EUR, $"
            class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
            required
          />
        </div>

        <!-- Low Stock Alert threshold -->
        <div class="space-y-1.5">
          <label class="text-[10px] font-semibold text-slate-400">Low Stock Alert Count *</label>
          <input
            v-model.number="form.lowStockThreshold"
            type="number"
            class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
            required
          />
        </div>

        <!-- Receipt Footer Disclaimer -->
        <div class="space-y-1.5">
          <label class="text-[10px] font-semibold text-slate-400">Default Sales Invoice Footer Note</label>
          <textarea
            v-model="form.receiptFooter"
            rows="3"
            class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none resize-none"
          ></textarea>
        </div>

        <!-- Action submit -->
        <div class="flex justify-end pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <button
            type="submit"
            :disabled="settingsStore.loading"
            class="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useSettingsStore } from '../stores/settings';
import SkeletonTable from '../components/SkeletonTable.vue';
import gsap from 'gsap';

const settingsStore = useSettingsStore();
const viewRef = ref(null);

const form = reactive({
  shopName: '',
  currency: 'USD',
  lowStockThreshold: 5,
  receiptFooter: ''
});

const loadData = async () => {
  await settingsStore.fetchSettings();
  Object.assign(form, {
    shopName: settingsStore.settings?.shopName || 'Antigravity Mobile Solutions',
    currency: settingsStore.settings?.currency || 'USD',
    lowStockThreshold: settingsStore.settings?.lowStockThreshold || 5,
    receiptFooter: settingsStore.settings?.receiptFooter || ''
  });
};

const handleSave = async () => {
  await settingsStore.updateSettings(form);
};

onMounted(() => {
  loadData();

  gsap.from(viewRef.value.children, {
    duration: 0.5,
    opacity: 0,
    y: 10,
    ease: 'power1.out'
  });
});
</script>
