<template>
  <div class="space-y-6" ref="viewRef">
    <div class="max-w-4xl mx-auto rounded-2xl border glass-card p-6">
      <h3 class="text-sm font-bold text-slate-800 dark:text-white mb-6 pb-3 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2">
        <span>🔄</span> Telefon sotib olish (Mijozdan sotib olish)
      </h3>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Customer Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5 relative text-left">
            <label class="text-[10px] font-semibold text-slate-400">Mijoz ismi *</label>
            <input
              v-model="invoice.customerName"
              @input="handleCustomerInput($event.target.value)"
              @keydown="handleCustomerKeydown($event)"
              @blur="handleCustomerBlur"
              type="text"
              placeholder="Masalan: Sherzod"
              class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:border-primary-500"
              required
              autocomplete="off"
            />

            <!-- Customer Suggestions Dropdown -->
            <Transition name="slide-up">
              <div
                v-if="showCustomerDropdown && customerSuggestions.length > 0"
                class="absolute left-0 right-0 top-full mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border dark:border-slate-800 rounded-2xl shadow-2xl z-50 max-h-[220px] overflow-y-auto divide-y dark:divide-slate-850"
              >
                <div
                  v-for="(item, idx) in customerSuggestions"
                  :key="idx"
                  @mousedown="selectCustomerSuggestion(item)"
                  class="p-2.5 hover:bg-slate-100/50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors text-xs flex justify-between items-center text-left"
                  :class="{ 'bg-slate-100 dark:bg-slate-850': activeCustomerSuggestionIndex === idx }"
                >
                  <span class="font-bold text-slate-800 dark:text-slate-200">👤 {{ item.name }}</span>
                  <span class="font-mono text-[10px] text-slate-400 font-semibold">{{ item.phone }}</span>
                </div>
              </div>
            </Transition>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-slate-400">Mijoz telefon raqami *</label>
            <input
              v-model="invoice.customerPhone"
              @keydown.enter.prevent="focusNextInput"
              type="text"
              placeholder="Masalan: +998901234567"
              class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:border-primary-500 font-mono"
              required
            />
          </div>
        </div>

        <!-- Phones Dynamic List -->
        <div class="space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-200/30 dark:border-slate-800/30">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sotib olingan telefonlar ({{ invoice.phones.length }})
            </span>
            <button
              type="button"
              @click="addPhoneRow"
              class="px-3 py-1.5 text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <PlusIcon class="w-3.5 h-3.5" />
              Telefon qo'shish
            </button>
          </div>

          <!-- Phone items -->
          <div class="space-y-4">
            <div
              v-for="(phone, index) in invoice.phones"
              :key="index"
              class="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/10 space-y-4 relative"
            >
              <!-- Delete Row button -->
              <button
                v-if="invoice.phones.length > 1"
                type="button"
                @click="removePhoneRow(index)"
                class="absolute right-3 top-3 text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                title="Qatorni o'chirish"
              >
                <TrashIcon class="w-4 h-4" />
              </button>

              <!-- Phone specifications row -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Product Name Autocomplete -->
                <div class="space-y-1 relative md:col-span-2">
                  <label class="text-[9px] font-bold text-slate-400">Mahsulot nomi *</label>
                  <input
                    v-model="phone.model"
                    @input="handleProductInput(index, $event.target.value)"
                    @keydown="handleSuggestionKeydown(index, $event)"
                    @blur="handleBlur"
                    type="text"
                    placeholder="Masalan: a 17 6/128gb"
                    class="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-md focus:outline-none focus:border-primary-500"
                    required
                    autocomplete="off"
                  />

                  <!-- Suggestions Dropdown -->
                  <Transition name="slide-up">
                    <div
                      v-if="activeDropdownIndex === index && phone.model.trim().length >= 1"
                      class="absolute left-0 right-0 top-full mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border dark:border-slate-800 rounded-2xl shadow-2xl z-50 max-h-[220px] overflow-y-auto divide-y dark:divide-slate-850"
                    >
                      <!-- Suggestion Row -->
                      <div
                        v-for="(item, idx) in searchSuggestions"
                        :key="idx"
                        @mousedown="selectSuggestion(index, item)"
                        class="p-2.5 hover:bg-slate-100/50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors text-xs flex flex-col gap-1 text-left"
                        :class="{ 'bg-slate-100 dark:bg-slate-850': activeSuggestionIndex === idx }"
                      >
                        <div class="flex justify-between items-center">
                          <span class="font-bold text-slate-800 dark:text-slate-200">📱 {{ item.productName }}</span>
                          <span class="text-[9px] text-slate-400 font-semibold">Omborda: {{ item.stock }}</span>
                        </div>
                        <div class="flex justify-between items-center text-[9px] text-slate-500 font-medium">
                          <span>Sotib olingan: {{ item.purchaseCount }} marta</span>
                          <span class="font-mono">Oxirgi xarid: ${{ item.lastPurchasePrice }}</span>
                        </div>
                      </div>

                      <!-- Empty State -->
                      <div v-if="searchSuggestions.length === 0" class="p-3 text-center text-xs text-slate-400">
                        Oldin sotib olingan telefon topilmadi.
                        <p class="text-[9px] text-slate-500 mt-1">Yangi model yaratish uchun Enterni bosing.</p>
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- Condition -->
                <div class="space-y-1">
                  <label class="text-[9px] font-bold text-slate-400">Holati *</label>
                  <select
                    v-model="phone.condition"
                    @keydown.enter.prevent="focusNextInput"
                    class="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-md focus:outline-none focus:border-primary-500"
                    required
                  >
                    <option value="New">Yangi (New)</option>
                    <option value="Used">Ishlatilgan (Used)</option>
                    <option value="Refurbished">Yangilangan (Refurbished)</option>
                  </select>
                </div>

                <!-- Purchase Price -->
                <div class="space-y-1">
                  <label class="text-[9px] font-bold text-slate-400">Sotib olish narxi ($) *</label>
                  <input
                    v-model.number="phone.purchasePrice"
                    @keydown.enter.prevent="focusNextInput"
                    type="number"
                    placeholder="Sotib olingan summa"
                    class="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-md focus:outline-none focus:border-primary-500 text-right font-mono"
                    required
                  />
                </div>
              </div>

              <!-- IMEI Row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[9px] font-bold text-slate-400">IMEI 1 *</label>
                  <input
                    v-model="phone.imei1"
                    @keydown.enter.prevent="focusNextInput"
                    type="text"
                    placeholder="IMEI 1 kodini kiriting"
                    class="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-md focus:outline-none focus:border-primary-500 font-mono"
                    required
                  />
                </div>

                <!-- Last Buy statistics indicator -->
                <div class="flex items-end">
                  <div
                    v-if="selectedSuggestions[index]"
                    class="w-full p-2 rounded-lg bg-slate-100/50 dark:bg-slate-900/40 border dark:border-slate-800 text-[9px] font-mono text-slate-500 flex justify-between items-center"
                  >
                    <span>Oxirgi xarid: <strong>${{ selectedSuggestions[index].lastPurchasePrice }}</strong></span>
                    <span>O'rtacha narx: <strong>${{ selectedSuggestions[index].averagePurchasePrice }}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Summary -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <div class="text-xs font-bold text-slate-500 dark:text-slate-400 space-x-6">
            <span>Jami telefonlar: <span class="text-slate-800 dark:text-white font-mono">{{ invoice.phones.length }}</span></span>
            <span>Jami xarid summasi: <span class="text-primary-600 dark:text-primary-400 font-mono">${{ formatTotal().toLocaleString() }}</span></span>
          </div>
          <button
            type="submit"
            :disabled="inventoryStore.loading"
            class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
          >
            {{ inventoryStore.loading ? 'Amalga oshirilmoqda...' : 'Sotib olishni yakunlash' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInventoryStore } from '../stores/inventory';
import { Plus as PlusIcon, Trash as TrashIcon } from 'lucide-vue-next';
import gsap from 'gsap';
import axios from 'axios';

const router = useRouter();
const inventoryStore = useInventoryStore();

const viewRef = ref(null);

const searchSuggestions = ref([]);
const activeSuggestionIndex = ref(-1);
const activeDropdownIndex = ref(-1);
const selectedSuggestions = reactive({}); // map row index to selected suggestion object
const suggestionCache = {};

// Customer Autocomplete Suggestions
const customerSuggestions = ref([]);
const activeCustomerSuggestionIndex = ref(-1);
const showCustomerDropdown = ref(false);
const customerCache = {};

const fetchCustomerSuggestions = async (query) => {
  if (!query || query.trim().length < 1) {
    customerSuggestions.value = [];
    return;
  }
  const cacheKey = query.trim().toLowerCase();
  if (customerCache[cacheKey]) {
    customerSuggestions.value = customerCache[cacheKey];
    return;
  }
  try {
    const res = await axios.get(`/api/phones/customers?search=${encodeURIComponent(query)}`);
    customerSuggestions.value = res.data.customers;
    customerCache[cacheKey] = res.data.customers;
  } catch (error) {
    console.error('Failed to fetch customer suggestions:', error);
  }
};

let customerTimeout;
const handleCustomerInput = (val) => {
  showCustomerDropdown.value = true;
  activeCustomerSuggestionIndex.value = -1;
  clearTimeout(customerTimeout);
  customerTimeout = setTimeout(() => {
    fetchCustomerSuggestions(val);
  }, 250);
};

const selectCustomerSuggestion = (item) => {
  invoice.customerName = item.name;
  invoice.customerPhone = item.phone;
  showCustomerDropdown.value = false;
  activeCustomerSuggestionIndex.value = -1;
};

const handleCustomerKeydown = (e) => {
  if (!showCustomerDropdown.value || customerSuggestions.value.length === 0) {
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNextInput(e);
    }
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeCustomerSuggestionIndex.value = (activeCustomerSuggestionIndex.value + 1) % customerSuggestions.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeCustomerSuggestionIndex.value = (activeCustomerSuggestionIndex.value - 1 + customerSuggestions.value.length) % customerSuggestions.value.length;
  } else if (e.key === 'Enter') {
    if (activeCustomerSuggestionIndex.value >= 0) {
      e.preventDefault();
      selectCustomerSuggestion(customerSuggestions.value[activeCustomerSuggestionIndex.value]);
    } else {
      showCustomerDropdown.value = false;
      e.preventDefault();
      focusNextInput(e);
    }
  } else if (e.key === 'Escape') {
    showCustomerDropdown.value = false;
    activeCustomerSuggestionIndex.value = -1;
  }
};

const handleCustomerBlur = () => {
  setTimeout(() => {
    showCustomerDropdown.value = false;
  }, 200);
};

const fetchSuggestions = async (query) => {
  if (!query || query.trim().length < 1) {
    searchSuggestions.value = [];
    return;
  }
  const cacheKey = query.trim().toLowerCase();
  if (suggestionCache[cacheKey]) {
    searchSuggestions.value = suggestionCache[cacheKey];
    return;
  }
  try {
    const res = await axios.get(`/api/phones/suggestions?search=${encodeURIComponent(query)}`);
    searchSuggestions.value = res.data.suggestions;
    suggestionCache[cacheKey] = res.data.suggestions;
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
  }
};

let suggestTimeout;
const handleProductInput = (index, val) => {
  activeDropdownIndex.value = index;
  activeSuggestionIndex.value = -1;
  clearTimeout(suggestTimeout);
  
  suggestTimeout = setTimeout(() => {
    fetchSuggestions(val);
  }, 300);
};

const selectSuggestion = (index, item) => {
  const row = invoice.phones[index];
  row.model = item.productName;
  if (!row.purchasePrice || row.purchasePrice === 0) {
    row.purchasePrice = item.lastPurchasePrice;
  }
  selectedSuggestions[index] = item;
  activeDropdownIndex.value = -1;
  activeSuggestionIndex.value = -1;
};

const focusNextInput = (e) => {
  const formEl = e.target.form;
  if (!formEl) return;
  const inputs = Array.from(formEl.querySelectorAll('input:not([type="hidden"]):not([disabled]), select:not([disabled])'));
  const index = inputs.indexOf(e.target);
  if (index > -1 && index < inputs.length - 1) {
    inputs[index + 1].focus();
    if (typeof inputs[index + 1].select === 'function') {
      inputs[index + 1].select();
    }
  } else if (index === inputs.length - 1) {
    handleSubmit();
  }
};

const handleSuggestionKeydown = (index, e) => {
  if (activeDropdownIndex.value !== index || searchSuggestions.value.length === 0) {
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNextInput(e);
    }
    return;
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % searchSuggestions.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + searchSuggestions.value.length) % searchSuggestions.value.length;
  } else if (e.key === 'Enter') {
    if (activeSuggestionIndex.value >= 0) {
      e.preventDefault();
      selectSuggestion(index, searchSuggestions.value[activeSuggestionIndex.value]);
    } else {
      activeDropdownIndex.value = -1;
      e.preventDefault();
      focusNextInput(e);
    }
  } else if (e.key === 'Escape') {
    activeDropdownIndex.value = -1;
    activeSuggestionIndex.value = -1;
  }
};

const handleBlur = () => {
  setTimeout(() => {
    activeDropdownIndex.value = -1;
  }, 200);
};

const highlightMatch = (text, query) => {
  if (!query) return text;
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark class="bg-primary-500/20 text-primary-600 dark:text-primary-400 font-bold">$1</mark>');
};

const invoice = reactive({
  customerName: '',
  customerPhone: '',
  phones: [
    {
      imei1: '',
      model: '',
      purchasePrice: 0,
      condition: 'Used'
    }
  ]
});

const addPhoneRow = () => {
  invoice.phones.push({
    imei1: '',
    model: '',
    purchasePrice: 0,
    condition: 'Used'
  });
};

const removePhoneRow = (index) => {
  invoice.phones.splice(index, 1);
  delete selectedSuggestions[index];
};

const formatTotal = () => {
  return invoice.phones.reduce((sum, p) => sum + (p.purchasePrice || 0), 0);
};

const handleSubmit = async () => {
  const success = await inventoryStore.receivePhones(invoice);
  if (success) {
    router.push('/inventory');
  }
};

onMounted(() => {
  gsap.from(viewRef.value.children, {
    duration: 0.5,
    opacity: 0,
    y: 10,
    ease: 'power1.out'
  });
});
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
