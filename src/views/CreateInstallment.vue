<template>
  <div class="space-y-6" ref="viewRef">
    <!-- Back Button -->
    <router-link
      to="/installments"
      class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors"
    >
      <ArrowLeftIcon class="w-4 h-4" />
      Nasiya ro'yxatiga qaytish
    </router-link>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      <!-- Left: Product Selection & Customer -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Phone Search -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white">
            Telefon qidirish va qo'shish
          </h3>

          <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="phoneSearch"
              @input="searchPhones"
              type="text"
              placeholder="IMEI yoki model nomini kiriting..."
              class="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border rounded-xl focus:outline-none"
            />

            <!-- Phone Results -->
            <div
              v-if="phoneResults.length > 0"
              class="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y dark:divide-slate-800"
            >
              <div
                v-for="phone in phoneResults"
                :key="phone._id"
                @click="addPhoneToCart(phone)"
                class="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs flex justify-between items-center"
              >
                <div class="min-w-0">
                  <div class="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    IMEI: {{ phone.imei1 }}
                  </div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {{ phone.model || 'Nomsiz' }} • {{ phone.brand || '-' }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-primary-600 dark:text-primary-400">
                    ${{ phone.sellingPrice ?? 0 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Accessory Search -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white">
            Aksessuar qidirish va qo'shish
          </h3>

          <div class="relative">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="accSearch"
              @input="searchAccessories"
              type="text"
              placeholder="Aksessuar nomini kiriting..."
              class="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border rounded-xl focus:outline-none"
            />

            <!-- Accessory Results -->
            <div
              v-if="accResults.length > 0"
              class="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y dark:divide-slate-800"
            >
              <div
                v-for="acc in accResults"
                :key="acc._id"
                @click="addAccessoryToCart(acc)"
                class="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs flex justify-between items-center"
              >
                <div class="min-w-0">
                  <div class="font-semibold text-slate-800 dark:text-slate-200 truncate">{{ acc.name }}</div>
                  <div class="text-[10px] text-slate-500">{{ acc.category }} • Omborda: {{ acc.quantity }}</div>
                </div>
                <div class="font-bold text-primary-600 dark:text-primary-400">${{ acc.sellingPrice }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Items with Editable Selling Price -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <span class="text-xs font-semibold text-slate-400">Savatchadagi mahsulotlar</span>

          <div v-if="cart.length === 0" class="text-center py-6 text-slate-400 text-xs border border-dashed rounded-xl">
            Mahsulot tanlanmagan. Qidiruv orqali qo'shing.
          </div>

          <div
            v-for="(item, index) in cart"
            :key="index"
            class="p-4 rounded-xl border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-xs space-y-3"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                  :class="item.type === 'Phone' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'"
                >
                  <SmartphoneIcon v-if="item.type === 'Phone'" class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <TagIcon v-else class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-slate-800 dark:text-white truncate">{{ item.name }}</p>
                  <p v-if="item.imei" class="text-[10px] text-slate-400 font-mono">IMEI: {{ item.imei }}</p>
                  <p v-if="item.type === 'Accessory'" class="text-[10px] text-slate-400">Soni: {{ item.quantity }}</p>
                  <p v-if="item.condition" class="text-[10px] text-slate-400">Holati: {{ item.condition }}</p>
                </div>
              </div>
              <button
                type="button"
                @click="removeFromCart(index)"
                class="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>

            <!-- Price Section for Phones -->
            <div v-if="item.type === 'Phone'" class="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <div class="space-y-1">
                <span class="text-[10px] text-slate-400">Kirim narxi</span>
                <p class="font-bold text-slate-500 font-mono">${{ item.purchasePrice }}</p>
              </div>
              <div class="space-y-1">
                <span class="text-[10px] text-slate-400">Taklif narxi</span>
                <p class="font-semibold text-slate-400 font-mono">${{ item.suggestedPrice }}</p>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-semibold text-primary-500">Sotish narxi ($) *</label>
                <input
                  v-model.number="item.totalPrice"
                  type="number"
                  step="1"
                  min="0"
                  class="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-primary-300 dark:border-primary-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono text-right font-bold"
                />
              </div>
            </div>

            <!-- Price for Accessories -->
            <div v-else class="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <span class="text-slate-400">Narxi:</span>
              <span class="font-bold text-primary-600 dark:text-primary-400 font-mono">${{ item.totalPrice }}</span>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white">
            Mijoz ma'lumotlari
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Mijoz ismi *</label>
              <input
                v-model="form.customerName"
                type="text"
                placeholder="To'liq ism-familiya"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                required
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Telefon raqami *</label>
              <input
                v-model="form.customerPhone"
                type="text"
                placeholder="+998901234567"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Installment Terms & Summary -->
      <div class="space-y-6">
        <!-- Installment Terms -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white">
            Nasiya shartlari
          </h3>

          <div class="space-y-3 text-xs">
            <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span class="text-slate-500">Jami narx</span>
              <span class="font-extrabold text-slate-800 dark:text-white font-mono">${{ formatNumber(totalPrice) }}</span>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Chegirma ($)</label>
              <input
                v-model.number="form.discount"
                type="number"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none font-mono text-right"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Boshlang'ich to'lov ($) *</label>
              <input
                v-model.number="form.initialPayment"
                type="number"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none font-mono text-right"
              />
            </div>

            <div class="flex justify-between py-2 border-y border-slate-100 dark:border-slate-800/50">
              <span class="text-slate-500 font-bold">Qoldiq qarz</span>
              <span class="font-extrabold text-rose-600 dark:text-rose-400 font-mono">${{ formatNumber(remainingDebt) }}</span>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Oylar soni *</label>
              <input
                v-model.number="form.numberOfMonths"
                type="number"
                min="1"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none font-mono text-right"
              />
            </div>

            <div class="flex justify-between py-2 border-y border-slate-100 dark:border-slate-800/50">
              <span class="text-slate-500">Oylik to'lov</span>
              <span class="font-extrabold text-blue-600 dark:text-blue-400 font-mono">${{ formatNumber(monthlyPayment) }}</span>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Birinchi to'lov sanasi *</label>
              <input
                v-model="form.firstPaymentDate"
                type="date"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Izoh (ixtiyoriy)</label>
              <textarea
                v-model="form.notes"
                rows="2"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <button
            @click="submitInstallment"
            :disabled="instStore.loading || cart.length === 0 || !form.customerName || !form.customerPhone || !form.numberOfMonths || !form.firstPaymentDate"
            class="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {{ instStore.loading ? 'Yaratilmoqda...' : 'Nasiya sotuvini yakunlash' }}
          </button>
        </div>

        <!-- Payment Schedule Preview -->
        <div v-if="form.numberOfMonths > 0 && remainingDebt > 0 && form.firstPaymentDate" class="p-6 rounded-2xl border glass-card space-y-3">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white">
            To'lov jadvali
          </h3>
          <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
            <div
              v-for="(schedule, idx) in paymentSchedule"
              :key="idx"
              class="flex items-center justify-between p-2 rounded-lg text-xs"
              :class="idx % 2 === 0 ? 'bg-slate-50 dark:bg-slate-900/30' : ''"
            >
              <div class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-[9px] font-bold">
                  {{ idx + 1 }}
                </span>
                <span class="text-slate-500">{{ schedule.date }}</span>
              </div>
              <span class="font-bold text-slate-700 dark:text-slate-200 font-mono">${{ formatNumber(schedule.amount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Receipt Modal -->
    <Transition name="fade">
      <div
        v-if="invoiceData"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print"
      >
        <div class="w-full max-w-md p-6 rounded-2xl glass-card border shadow-2xl flex flex-col items-center">
          <div class="flex items-center justify-between w-full pb-3 border-b border-slate-200/50 dark:border-slate-800/50 mb-4">
            <span class="text-xs font-bold text-slate-400">Nasiya sotuvi yakunlandi</span>
            <button @click="closeReceipt" class="text-slate-400 hover:text-slate-600">
              <XIcon class="w-4 h-4" />
            </button>
          </div>

          <div id="installmentReceiptArea" class="print-area w-full p-6 bg-white rounded-xl border text-black font-sans text-xs space-y-4">
            <div class="text-center space-y-1">
              <h4 class="text-sm font-extrabold uppercase tracking-wide">Nasiya sotuv cheki</h4>
              <p class="text-[9px] text-gray-500">PhoneCRM - Nasiya bo'limi</p>
            </div>

            <div class="border-y border-dashed border-gray-300 py-2 space-y-1 text-[9px] text-gray-600">
              <div class="flex justify-between">
                <span>Faktura:</span>
                <span class="font-bold text-black">{{ invoiceData.invoiceNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span>Mijoz:</span>
                <span class="text-black">{{ invoiceData.installment?.customerName }}</span>
              </div>
              <div class="flex justify-between">
                <span>Telefon:</span>
                <span>{{ invoiceData.installment?.customerPhone }}</span>
              </div>
              <div class="flex justify-between">
                <span>Sana:</span>
                <span>{{ new Date().toLocaleDateString() }}</span>
              </div>
            </div>

            <div class="space-y-1 text-[9px]">
              <div class="font-semibold border-b pb-1">Mahsulotlar</div>
              <div
                v-for="item in invoiceData.installment?.items"
                :key="item.name"
                class="flex justify-between"
              >
                <span>{{ item.name }}</span>
                <span class="font-bold">${{ item.sellingPrice }}</span>
              </div>
            </div>

            <div class="border-t border-dashed border-gray-300 pt-2 space-y-1 text-[9px]">
              <div class="flex justify-between">
                <span>Jami narx:</span>
                <span class="font-bold">${{ invoiceData.installment?.totalPrice }}</span>
              </div>
              <div class="flex justify-between">
                <span>Boshlang'ich to'lov:</span>
                <span class="font-bold text-emerald-700">${{ invoiceData.installment?.initialPayment }}</span>
              </div>
              <div class="flex justify-between font-bold text-[10px]">
                <span>Qoldiq qarz:</span>
                <span class="text-rose-700">${{ invoiceData.installment?.remainingDebt }}</span>
              </div>
              <div class="flex justify-between">
                <span>Oylik to'lov:</span>
                <span>${{ invoiceData.installment?.monthlyPayment }}</span>
              </div>
              <div class="flex justify-between">
                <span>Oylar soni:</span>
                <span>{{ invoiceData.installment?.numberOfMonths }} oy</span>
              </div>
            </div>

            <div class="text-center text-[8px] text-gray-400 pt-4 border-t">
              Xaridingiz uchun rahmat!<br />
              To'lovlarni o'z vaqtida amalga oshiring.
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 w-full">
            <button
              @click="closeReceipt"
              class="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800"
            >
              Tayyor
            </button>
            <button
              @click="triggerPrint"
              class="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
            >
              <PrinterIcon class="w-4 h-4" />
              Chekni chop etish
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInstallmentsStore } from '../stores/installments';
import { useNotificationStore } from '../stores/notifications';
import axios from 'axios';
import {
  ArrowLeft as ArrowLeftIcon,
  Search as SearchIcon,
  Smartphone as SmartphoneIcon,
  Tag as TagIcon,
  Trash as TrashIcon,
  X as XIcon,
  Printer as PrinterIcon
} from 'lucide-vue-next';
import gsap from 'gsap';

const router = useRouter();
const instStore = useInstallmentsStore();
const notifications = useNotificationStore();
const viewRef = ref(null);

const phoneSearch = ref('');
const phoneResults = ref([]);
const accSearch = ref('');
const accResults = ref([]);
const cart = ref([]);
const invoiceData = ref(null);

const form = reactive({
  customerName: '',
  customerPhone: '',
  discount: 0,
  initialPayment: 0,
  numberOfMonths: 3,
  firstPaymentDate: getDefaultDate(),
  notes: ''
});

function getDefaultDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}

const totalPrice = computed(() => {
  const itemsTotal = cart.value.reduce((sum, item) => sum + item.totalPrice, 0);
  return Math.max(0, itemsTotal - (form.discount || 0));
});

const remainingDebt = computed(() => {
  return Math.max(0, totalPrice.value - (form.initialPayment || 0));
});

const monthlyPayment = computed(() => {
  if (!form.numberOfMonths || form.numberOfMonths < 1) return 0;
  return Math.ceil((remainingDebt.value / form.numberOfMonths) * 100) / 100;
});

const paymentSchedule = computed(() => {
  if (!form.firstPaymentDate || !form.numberOfMonths || remainingDebt.value <= 0) return [];
  const schedule = [];
  let remaining = remainingDebt.value;
  const monthly = monthlyPayment.value;

  for (let i = 0; i < form.numberOfMonths; i++) {
    const d = new Date(form.firstPaymentDate);
    d.setMonth(d.getMonth() + i);
    const amount = i === form.numberOfMonths - 1 ? remaining : Math.min(monthly, remaining);
    remaining -= amount;

    schedule.push({
      date: d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }),
      amount: Math.max(0, amount)
    });
  }
  return schedule;
});

const formatNumber = (val) => {
  return (val || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

// Phone search
let phoneDebounce;
const searchPhones = () => {
  clearTimeout(phoneDebounce);
  phoneDebounce = setTimeout(async () => {
    if (phoneSearch.value.trim().length < 2) {
      phoneResults.value = [];
      return;
    }
    try {
      const res = await axios.get('/api/phones', {
        params: { search: phoneSearch.value, status: 'In Stock', limit: 8 }
      });
      phoneResults.value = res.data.data;
    } catch (error) {
      console.error('Phone search failed:', error.message);
    }
  }, 300);
};

// Accessory search
let accDebounce;
const searchAccessories = () => {
  clearTimeout(accDebounce);
  accDebounce = setTimeout(async () => {
    if (accSearch.value.trim().length < 2) {
      accResults.value = [];
      return;
    }
    try {
      const res = await axios.get('/api/accessories', {
        params: { search: accSearch.value, limit: 8 }
      });
      accResults.value = res.data.data;
    } catch (error) {
      console.error('Accessory search failed:', error.message);
    }
  }, 300);
};

const addPhoneToCart = (phone) => {
  if (cart.value.some(i => i.id === phone._id && i.type === 'Phone')) {
    notifications.warning('Ogohlantirish', 'Bu telefon allaqachon qo\'shilgan');
    return;
  }
  cart.value.push({
    type: 'Phone',
    id: phone._id,
    name: `${phone.brand || ''} ${phone.model || ''}`.trim() || 'Unknown',
    imei: phone.imei1,
    purchasePrice: phone.purchasePrice || 0,
    suggestedPrice: phone.sellingPrice || 0,
    unitPrice: phone.sellingPrice || 0,
    quantity: 1,
    totalPrice: phone.sellingPrice || 0,
    condition: phone.condition || 'Used'
  });
  phoneSearch.value = '';
  phoneResults.value = [];
};

const addAccessoryToCart = (acc) => {
  const existing = cart.value.find(i => i.id === acc._id && i.type === 'Accessory');
  if (existing) {
    if (existing.quantity < acc.quantity) {
      existing.quantity += 1;
      existing.totalPrice = existing.unitPrice * existing.quantity;
    } else {
      notifications.warning('Ogohlantirish', 'Omborda yetarli mahsulot yo\'q');
    }
    accSearch.value = '';
    accResults.value = [];
    return;
  }
  cart.value.push({
    type: 'Accessory',
    id: acc._id,
    name: acc.name,
    imei: null,
    unitPrice: acc.sellingPrice,
    quantity: 1,
    totalPrice: acc.sellingPrice,
    maxQuantity: acc.quantity
  });
  accSearch.value = '';
  accResults.value = [];
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
};

const submitInstallment = async () => {
  if (cart.value.length === 0) {
    notifications.error('Xatolik', 'Kamida bitta mahsulot tanlang');
    return;
  }
  if (!form.customerName || !form.customerPhone) {
    notifications.error('Xatolik', 'Mijoz ismi va telefon raqami majburiy');
    return;
  }

  const phoneIds = cart.value.filter(i => i.type === 'Phone').map(i => i.id);
  const accessoryItems = cart.value
    .filter(i => i.type === 'Accessory')
    .map(i => ({ accessoryId: i.id, quantity: i.quantity }));

  const sellingPrices = {};
  cart.value.filter(i => i.type === 'Phone').forEach(i => {
    sellingPrices[i.id] = i.totalPrice || 0;
  });

  const payload = {
    customerName: form.customerName,
    customerPhone: form.customerPhone,
    phoneIds,
    sellingPrices,
    accessoryItems,
    initialPayment: form.initialPayment || 0,
    numberOfMonths: form.numberOfMonths,
    firstPaymentDate: form.firstPaymentDate,
    notes: form.notes,
    discount: form.discount || 0
  };

  const result = await instStore.createInstallment(payload);
  if (result) {
    invoiceData.value = result;
  }
};

const triggerPrint = () => {
  window.print();
};

const closeReceipt = () => {
  invoiceData.value = null;
  router.push('/installments');
};

onMounted(() => {
  gsap.from(viewRef.value.children, {
    duration: 0.5,
    opacity: 0,
    y: 10,
    stagger: 0.08,
    ease: 'power1.out'
  });
});
</script>
