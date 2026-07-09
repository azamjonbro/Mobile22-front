<template>
  <div class="space-y-6" ref="viewRef">
    <div class="max-w-4xl mx-auto rounded-2xl border glass-card p-6">
      <h3 class="text-sm font-bold text-slate-800 dark:text-white mb-6 pb-3 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2">
        <span>🔄</span> Telefon sotib olish (Kirim qilish)
      </h3>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Customer / Supplier Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5 relative text-left">
            <label class="text-[10px] font-semibold text-slate-400">Mijoz ismi (Buyback uchun) *</label>
            <input
              v-model="invoice.customerName"
              @input="handleCustomerInput($event.target.value)"
              @keydown="handleCustomerKeydown($event)"
              @blur="handleCustomerBlur"
              type="text"
              placeholder="Masalan: Sherzod (yoki Yetkazib beruvchi nomi)"
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
              type="text"
              placeholder="Masalan: +998901234567"
              class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:border-primary-500 font-mono"
              required
            />
          </div>
        </div>

        <!-- Invoice notes & generic number -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-slate-400">Invoys raqami (Invoice Number)</label>
            <input
              v-model="invoice.invoiceNumber"
              type="text"
              placeholder="Masalan: PINV-987"
              class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:border-primary-500 font-mono"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-slate-400">Izohlar</label>
            <input
              v-model="invoice.notes"
              type="text"
              placeholder="Ixtiyoriy izoh..."
              class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <!-- Products Dynamic List -->
        <div class="space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-200/30 dark:border-slate-800/30">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sotib olinayotgan mahsulotlar ({{ invoice.phones.length }})
            </span>
            <button
              type="button"
              @click="addPhoneRow"
              class="px-3 py-1.5 text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <PlusIcon class="w-3.5 h-3.5" />
              Mahsulot qo'shish
            </button>
          </div>

          <!-- Product items -->
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

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Product Name Autocomplete -->
                <div class="space-y-1 relative md:col-span-2">
                  <label class="text-[9px] font-bold text-slate-400">Mahsulot nomi (Model) *</label>
                  <input
                    v-model="phone.model"
                    @input="handleProductInput(index, $event.target.value)"
                    @keydown="handleSuggestionKeydown(index, $event)"
                    @blur="handleBlur"
                    type="text"
                    placeholder="Masalan: Galaxy S26 Ultra"
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
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- Brand -->
                <div class="space-y-1">
                  <label class="text-[9px] font-bold text-slate-400">Brand *</label>
                  <input
                    v-model="phone.brand"
                    type="text"
                    placeholder="Masalan: Samsung"
                    class="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-md focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Storage -->
                <div class="space-y-1">
                  <label class="text-[9px] font-bold text-slate-400">Xotira (Storage)</label>
                  <input
                    v-model="phone.storage"
                    type="text"
                    placeholder="Masalan: 256GB"
                    class="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-md focus:outline-none focus:border-primary-500 font-mono"
                  />
                </div>

                <!-- Condition -->
                <div class="space-y-1">
                  <label class="text-[9px] font-bold text-slate-400">Holati *</label>
                  <select
                    v-model="phone.condition"
                    class="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-md focus:outline-none focus:border-primary-500"
                    required
                  >
                    <option value="New">Yangi (New)</option>
                    <option value="Used">Ishlatilgan (Used)</option>
                    <option value="Refurbished">Yangilangan (Refurbished)</option>
                  </select>
                </div>

                <!-- Quantity -->
                <div class="space-y-1">
                  <label class="text-[9px] font-bold text-slate-400">Miqdori (Quantity) *</label>
                  <input
                    v-model.number="phone.quantity"
                    type="number"
                    min="1"
                    class="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-md focus:outline-none focus:border-primary-500 font-mono text-right"
                    required
                  />
                </div>

                <!-- Purchase Price -->
                <div class="space-y-1">
                  <label class="text-[9px] font-bold text-slate-400">Sotib olish narxi ($) *</label>
                  <input
                    v-model.number="phone.purchasePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Sotib olingan summa"
                    class="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-md focus:outline-none focus:border-primary-500 text-right font-mono"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Summary -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <div class="text-xs font-bold text-slate-500 dark:text-slate-400 space-x-6">
            <span>Jami turlar: <span class="text-slate-800 dark:text-white font-mono">{{ invoice.phones.length }}</span></span>
            <span>Jami xarid summasi: <span class="text-primary-600 dark:text-primary-400 font-mono">${{ formatTotal().toLocaleString() }}</span></span>
          </div>
          <button
            type="submit"
            :disabled="inventoryStore.loading"
            class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer animate-all"
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
const selectedSuggestions = reactive({});
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
  row.brand = item.brand;
  row.storage = item.storage;
  row.condition = item.condition;
  if (!row.purchasePrice || row.purchasePrice === 0) {
    row.purchasePrice = item.lastPurchasePrice;
  }
  selectedSuggestions[index] = item;
  activeDropdownIndex.value = -1;
  activeSuggestionIndex.value = -1;
};

const handleSuggestionKeydown = (index, e) => {
  if (activeDropdownIndex.value !== index || searchSuggestions.value.length === 0) {
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

const invoice = reactive({
  customerName: '',
  customerPhone: '',
  invoiceNumber: '',
  notes: '',
  phones: [
    {
      model: '',
      brand: '',
      storage: '',
      condition: 'New',
      quantity: 1,
      purchasePrice: 0
    }
  ]
});

const addPhoneRow = () => {
  invoice.phones.push({
    model: '',
    brand: '',
    storage: '',
    condition: 'New',
    quantity: 1,
    purchasePrice: 0
  });
};

const removePhoneRow = (index) => {
  invoice.phones.splice(index, 1);
  delete selectedSuggestions[index];
};

const formatTotal = () => {
  return invoice.phones.reduce((sum, p) => sum + ((p.purchasePrice || 0) * (p.quantity || 1)), 0);
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
