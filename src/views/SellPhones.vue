<template>
  <div class="space-y-6" ref="viewRef">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      <!-- Left: Ticket Assembly & Customer details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Phone Search and Add to Ticket -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white">
            Sotish uchun telefon qidirish
          </h3>

          <div class="relative">
            <SearchIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            />
            <input
              v-model="searchQuery"
              @input="searchPhones"
              type="text"
              placeholder="IMEI yoki model nomini kiriting..."
              class="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border rounded-xl focus:outline-none"
            />

            <!-- Auto-complete Dropdown -->
            <div
              v-if="searchResults.length > 0"
              class="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y dark:divide-slate-800"
            >
              <div
                v-for="phone in searchResults"
                :key="phone._id"
                @click="addToCart(phone)"
                class="px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs flex justify-between items-center"
              >
                <div class="min-w-0">
                  <div class="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {{ phone.brand }} {{ phone.model }}
                  </div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    IMEI: {{ phone.imei1 }} • {{ phone.condition || 'Used' }}
                    <span v-if="phone.clientName"> • Mijoz: {{ phone.clientName }}</span>
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-[10px] text-slate-400">Kirim narxi</div>
                  <div class="font-bold text-slate-600 dark:text-slate-300">
                    ${{ phone.purchasePrice ?? 0 }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Checkout Cart Items — Phone Cards with Editable Selling Price -->
          <div class="space-y-3 mt-4">
            <span class="text-xs font-semibold text-slate-400">Chiptadagi telefonlar</span>

            <div
              v-if="cart.length === 0"
              class="text-center py-6 text-slate-400 text-xs border border-dashed rounded-xl"
            >
              Telefon tanlanmagan. Qidiruv orqali qo'shing.
            </div>

            <div
              v-for="(item, index) in cart"
              :key="item._id"
              class="p-4 rounded-xl border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-xs space-y-3"
            >
              <!-- Phone Info Header -->
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-slate-800 dark:text-white text-sm">
                    {{ item.brand }} {{ item.model }}
                  </p>
                  <p class="text-[10px] text-slate-400 font-mono mt-0.5">
                    IMEI: {{ item.imei1 }}
                  </p>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {{ item.storage || '-' }}
                    </span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {{ item.color || '-' }}
                    </span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      :class="item.condition === 'New' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'"
                    >
                      {{ item.condition || 'Used' }}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeFromCart(index)"
                  class="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>

              <!-- Price Section -->
              <div class="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <div class="space-y-1">
                  <span class="text-[10px] text-slate-400">Kirim narxi</span>
                  <p class="font-bold text-slate-600 dark:text-slate-300 font-mono">${{ item.purchasePrice }}</p>
                </div>
                <div class="space-y-1">
                  <span class="text-[10px] text-slate-400">Taklif narxi</span>
                  <p class="font-semibold text-slate-500 font-mono">${{ item.suggestedPrice }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-semibold text-primary-500">Sotish narxi ($) *</label>
                  <input
                    v-model.number="item.sellingPrice"
                    type="number"
                    step="1"
                    min="0"
                    class="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-primary-300 dark:border-primary-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono text-right font-bold"
                  />
                </div>
              </div>

              <!-- Profit Indicator -->
              <div class="flex items-center justify-between text-[10px] pt-1">
                <span class="text-slate-400">Foyda:</span>
                <span :class="[
                  'font-bold font-mono',
                  (item.sellingPrice - item.purchasePrice) >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-rose-600 dark:text-rose-400'
                ]">
                  {{ (item.sellingPrice - item.purchasePrice) >= 0 ? '+' : '' }}${{ item.sellingPrice - item.purchasePrice }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer & Payment Options -->
        <div class="p-6 rounded-2xl border glass-card space-y-4">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white">
            Mijoz va to'lov ma'lumotlari
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Name -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400"
                >Mijoz ismi</label
              >
              <input
                v-model="customer.name"
                type="text"
                placeholder="Odatdagi mijoz"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
              />
            </div>
            <!-- Phone -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400"
                >Mijoz telefon raqami</label
              >
              <input
                v-model="customer.phone"
                type="text"
                placeholder="Masalan: +998901234567"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <!-- Payment Type -->
          <div class="space-y-2">
            <label class="text-[10px] font-semibold text-slate-400"
              >To'lov turi *</label
            >
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="type in ['Cash', 'Card', 'Transfer', 'Mixed', 'Installment']"
                :key="type"
                type="button"
                @click="handlePaymentTypeSelect(type)"
                class="py-2 text-xs rounded-xl border text-center font-semibold transition-all cursor-pointer"
                :class="[
                  paymentType === type
                    ? 'bg-primary-600 text-white border-transparent shadow'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400',
                ]"
              >
                {{ translatePaymentType(type) }}
              </button>
            </div>
          </div>

          <!-- Mixed Payment Details Form -->
          <div
            v-if="paymentType === 'Mixed'"
            class="p-4 rounded-xl border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 space-y-3"
          >
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">To'lov taqsimotini kiriting</span>
            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="space-y-1">
                <label class="text-[9px] text-slate-400">Naqd summa</label>
                <input
                  v-model.number="paymentDetails.cashAmount"
                  type="number"
                  class="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg focus:outline-none text-right font-mono"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[9px] text-slate-400">Karta summasi</label>
                <input
                  v-model.number="paymentDetails.cardAmount"
                  type="number"
                  class="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg focus:outline-none text-right font-mono"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[9px] text-slate-400">O'tkazma</label>
                <input
                  v-model.number="paymentDetails.transferAmount"
                  type="number"
                  class="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-lg focus:outline-none text-right font-mono"
                />
              </div>
            </div>
            <p class="text-[10px] text-slate-400 text-right">
              Kiritilgan summa: ${{ mixedAllocatedTotal() }} / ${{ netTotal() }}
            </p>
          </div>
        </div>
      </div>

      <!-- Right: Cart Invoicing totals -->
      <div class="space-y-6">
        <div
          class="p-6 rounded-2xl border glass-card flex flex-col justify-between h-80"
        >
          <h3
            class="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-200/50 dark:border-slate-800/50"
          >
            Sotuv hisobi
          </h3>

          <div class="flex-1 py-4 space-y-3 text-xs">
            <div class="flex justify-between text-slate-500">
              <span>Jami sotish narxi:</span>
              <span class="font-mono">${{ subtotal() }}</span>
            </div>

            <div class="flex justify-between items-center text-slate-500">
              <span>Chegirma ($):</span>
              <input
                v-model.number="discount"
                type="number"
                class="w-20 px-2 py-1 text-right bg-white dark:bg-slate-900 border rounded-md focus:outline-none font-mono"
              />
            </div>

            <div class="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Jami foyda:</span>
              <span class="font-mono font-bold">${{ totalProfit() }}</span>
            </div>

            <div
              class="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between text-slate-800 dark:text-white font-extrabold text-sm"
            >
              <span>Yakuniy summa:</span>
              <span class="font-mono">${{ netTotal() }}</span>
            </div>
          </div>

          <button
            @click="processCheckout"
            :disabled="salesStore.loading || cart.length === 0"
            class="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {{
              salesStore.loading
                ? "Hisob-faktura yaratilmoqda..."
                : "Kassani yakunlash va chek chiqarish"
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Beautiful Generated Invoice Print Overlay Modal -->
    <Transition name="fade">
      <div
        v-if="invoiceReceipt"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print"
      >
        <div
          class="w-full max-w-md p-6 rounded-2xl glass-card border shadow-2xl flex flex-col items-center"
        >
          <div
            class="flex items-center justify-between w-full pb-3 border-b border-slate-200/50 dark:border-slate-800/50 mb-4"
          >
            <span class="text-xs font-bold text-slate-400">To'lov yakunlandi</span>
            <button
              @click="closeReceipt"
              class="text-slate-400 hover:text-slate-600"
            >
              <XIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Printable Invoice Receipt Area -->
          <div
            id="invoiceReceiptArea"
            class="print-area w-full p-6 bg-white rounded-xl border text-black font-sans text-xs space-y-4"
          >
            <!-- Receipt Header -->
            <div class="text-center space-y-1">
              <h4 class="text-sm font-extrabold uppercase tracking-wide">
                Telefon do'koni cheki
              </h4>
              <p class="text-[9px] text-gray-500">
                PhoneCRM
              </p>
              <p class="text-[9px] text-gray-400">Tel: +998 90 123 45 67</p>
            </div>

            <!-- Receipt Metadata -->
            <div
              class="border-y border-dashed border-gray-300 py-2 space-y-1 text-[9px] text-gray-600"
            >
              <div class="flex justify-between">
                <span>Faktura raqami:</span>
                <span class="font-bold text-black">{{
                  invoiceReceipt.invoiceNumber
                }}</span>
              </div>
              <div class="flex justify-between">
                <span>Sana:</span>
                <span>{{ formatDate(invoiceReceipt.date) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Mijoz:</span>
                <span class="text-black">{{
                  invoiceReceipt.customerName || "Odatdagi mijoz"
                }}</span>
              </div>
              <div class="flex justify-between">
                <span>Telefon:</span>
                <span>{{ invoiceReceipt.phoneNumber || "-" }}</span>
              </div>
            </div>

            <!-- Receipt Items -->
            <div class="space-y-2">
              <div class="font-semibold border-b pb-1 text-[10px]">
                Sotib olingan telefonlar
              </div>
              <div
                v-for="phone in invoiceReceipt.phones"
                :key="phone.phoneId"
                class="flex justify-between items-start"
              >
                <div>
                  <div class="font-bold text-black">
                    {{ phone.brand }} {{ phone.model }}
                  </div>
                  <div class="text-[9px] text-gray-500">
                    IMEI: {{ phone.imei1 }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-black">
                    ${{ phone.sellingPrice }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Receipt Totals -->
            <div
              class="border-t border-dashed border-gray-300 pt-2 space-y-1.5 text-right font-mono"
            >
              <div class="flex justify-between text-gray-500 text-[10px]">
                <span>Chegirma:</span>
                <span>-${{ invoiceReceipt.discount }}</span>
              </div>
              <div
                class="flex justify-between text-black font-extrabold text-[11px] pt-1"
              >
                <span>Yakuniy to'lov:</span>
                <span>${{ invoiceReceipt.totalAmount }}</span>
              </div>
              <div class="text-[9px] text-gray-500 mt-1">
                To'lov usuli:
                {{ translatePaymentType(invoiceReceipt.paymentType) }}
              </div>
            </div>

            <!-- Footer -->
            <div class="text-center text-[8px] text-gray-400 pt-4 border-t">
              Xaridingiz uchun rahmat!<br />
              Barcha mobil qurilmalarga 12 oylik kafolat beriladi.
            </div>
          </div>

          <!-- Printable Controls -->
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
              <PrintIcon class="w-4 h-4" />
              Chekni chop etish
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSalesStore } from "../stores/sales";
import { useNotificationStore } from "../stores/notifications";
import axios from "axios";
import {
  Search as SearchIcon,
  Trash as TrashIcon,
  X as XIcon,
  Printer as PrintIcon,
} from "lucide-vue-next";
import gsap from "gsap";

const router = useRouter();
const salesStore = useSalesStore();
const notifications = useNotificationStore();

const viewRef = ref(null);
const searchQuery = ref("");
const searchResults = ref([]);
const cart = ref([]);
const discount = ref(0);
const paymentType = ref("Cash");

const translatePaymentType = (type) => {
  switch (type) {
    case "Cash":
      return "Naqd";
    case "Card":
      return "Karta";
    case "Transfer":
      return "O'tkazma";
    case "Mixed":
      return "Aralash";
    case "Installment":
      return "Nasiya";
    default:
      return type;
  }
};

const handlePaymentTypeSelect = (type) => {
  if (type === 'Installment') {
    router.push('/installments/new');
    return;
  }
  paymentType.value = type;
};

const paymentDetails = reactive({
  cashAmount: 0,
  cardAmount: 0,
  transferAmount: 0,
});

const customer = reactive({
  name: "",
  phone: "",
});

const invoiceReceipt = ref(null);

const searchPhones = async () => {
  if (searchQuery.value.trim().length < 2) {
    searchResults.value = [];
    return;
  }
  try {
    const res = await axios.get("/api/phones", {
      params: { search: searchQuery.value, status: "In Stock", limit: 8 },
    });
    searchResults.value = res.data.data;
  } catch (error) {
    console.error("Phone search failed:", error.message);
  }
};

const addToCart = (phone) => {
  if (cart.value.some((p) => p._id === phone._id)) {
    notifications.warning(
      "Already Added",
      "This phone is already added to the ticket",
    );
    return;
  }
  // Add phone with editable sellingPrice — default to the suggested sellingPrice from inventory
  cart.value.push({
    ...phone,
    suggestedPrice: phone.sellingPrice || 0,
    sellingPrice: phone.sellingPrice || 0,
  });
  searchQuery.value = "";
  searchResults.value = [];
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
};

const subtotal = () => {
  return cart.value.reduce((sum, p) => sum + (p.sellingPrice || 0), 0);
};

const totalProfit = () => {
  return cart.value.reduce((sum, p) => sum + ((p.sellingPrice || 0) - (p.purchasePrice || 0)), 0);
};

const netTotal = () => {
  return Math.max(0, subtotal() - discount.value);
};

const mixedAllocatedTotal = () => {
  return (
    (paymentDetails.cashAmount || 0) +
    (paymentDetails.cardAmount || 0) +
    (paymentDetails.transferAmount || 0)
  );
};

const processCheckout = async () => {
  const phoneIds = cart.value.map((p) => p._id);
  const net = netTotal();

  // Build selling prices map to send to backend
  const sellingPrices = {};
  cart.value.forEach(p => {
    sellingPrices[p._id] = p.sellingPrice || 0;
  });

  if (paymentType.value === "Mixed") {
    const allocated = mixedAllocatedTotal();
    if (Math.abs(allocated - net) > 0.01) {
      notifications.error(
        "Checkout Error",
        "Mixed payment allocation must match the exact net invoice total",
      );
      return;
    }
  }

  const payload = {
    customerName: customer.name || "Walk-in Customer",
    phoneNumber: customer.phone || "",
    phoneIds,
    sellingPrices,
    discount: discount.value,
    paymentType: paymentType.value,
    paymentDetails: paymentType.value === "Mixed" ? paymentDetails : null,
  };

  const invoice = await salesStore.processSale(payload);
  if (invoice) {
    invoiceReceipt.value = invoice;
  }
};

const triggerPrint = () => {
  window.print();
};

const closeReceipt = () => {
  invoiceReceipt.value = null;
  cart.value = [];
  discount.value = 0;
  customer.name = "";
  customer.phone = "";
  paymentType.value = "Cash";
  Object.assign(paymentDetails, {
    cashAmount: 0,
    cardAmount: 0,
    transferAmount: 0,
  });
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString();
};

onMounted(() => {
  gsap.from(viewRef.value.children, {
    duration: 0.5,
    opacity: 0,
    y: 10,
    ease: "power1.out",
  });
});
</script>
