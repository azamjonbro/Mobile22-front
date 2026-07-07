<template>
  <div class="space-y-6" ref="viewRef">
    <!-- Header with controls -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <!-- Search & Filters -->
      <div class="flex flex-wrap gap-2 items-center w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
          <SearchIcon
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          />
          <input
            v-model="filters.search"
            @input="handleSearch"
            type="text"
            placeholder="IMEI, mijoz ismi yoki raqami bo'yicha qidirish..."
            class="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <select
          v-model="filters.status"
          @change="fetchData"
          class="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
        >
          <option value="">Barcha holatlar</option>
          <option value="In Stock">Omborda</option>
          <option value="Sold">Sotilgan</option>
          <option value="Reserved">Band qilingan</option>
        </select>
      </div>

      <!-- Add Phone Button -->
      <button
        v-if="authStore.hasPermission('inventory:write')"
        @click="openModal()"
        class="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-600/15"
      >
        <PlusIcon class="w-4 h-4" />
        Telefon qo'shish
      </button>
    </div>

    <!-- Inventory Table -->
    <div class="glass-card border rounded-2xl overflow-hidden">
      <SkeletonTable v-if="inventoryStore.loading" :rows="5" />
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr
              class="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/40 text-slate-500"
            >
              <th class="p-4">IMEI 1</th>
              <th class="p-4">Mahsulot nomi</th>
              <th class="p-4">Mijoz ismi</th>
              <th class="p-4">Mijoz telefoni</th>
              <th class="p-4 text-right">Kirim / Sotuv</th>
              <th class="p-4 text-center">Holati</th>
              <th class="p-4 text-center">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/40">
            <tr v-if="phones.length === 0">
              <td colspan="7" class="p-8 text-center text-slate-400">
                Filtrlarga mos keladigan telefonlar omborda topilmadi
              </td>
            </tr>
            <tr
              v-for="phone in phones"
              :key="phone._id"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
            >
              <td
                class="p-4 font-mono font-bold text-slate-800 dark:text-white"
              >
                {{ phone.imei1 }}
              </td>
              <td class="p-4 text-slate-700 dark:text-slate-300 font-semibold">
                {{ phone.model || "-" }}
              </td>
              <td class="p-4 text-slate-500">
                {{ phone.clientName || "-" }}
              </td>
              <td class="p-4 font-mono text-slate-500">
                {{ phone.clientPhone || "-" }}
              </td>
              <td class="p-4 text-right">
                <div
                  class="font-semibold text-slate-600 dark:text-slate-400 font-mono"
                >
                  C: ${{ phone.purchasePrice }}
                </div>
                <div
                  class="font-bold text-primary-600 dark:text-primary-400 font-mono"
                >
                  S: ${{ phone.sellingPrice }}
                </div>
              </td>
              <td class="p-4 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="getStatusClasses(phone.status)"
                >
                  {{ translateStatus(phone.status) }}
                </span>
              </td>
              <td class="p-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="printLabels(phone)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    title="QR/Shtrix-kod yorliqlarini yaratish"
                  >
                    <QrIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="authStore.hasPermission('inventory:write')"
                    @click="openModal(phone)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    title="Telefonni tahrirlash"
                  >
                    <EditIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="authStore.hasPermission('inventory:write')"
                    @click="confirmDelete(phone)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    title="Telefonni o'chirish"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="inventoryStore.pages > 1"
        class="px-4 py-3 border-t border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between"
      >
        <span class="text-[10px] text-slate-400">
          Sahifa {{ filters.page }} / {{ inventoryStore.pages }}
        </span>
        <div class="flex items-center gap-2">
          <button
            @click="changePage(filters.page - 1)"
            :disabled="filters.page === 1"
            class="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            @click="changePage(filters.page + 1)"
            :disabled="filters.page === inventoryStore.pages"
            class="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Phone Modal -->
    <Transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      >
        <div
          class="w-full max-w-md p-6 rounded-2xl glass-card border shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          <div
            class="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/50"
          >
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">
              {{
                editingPhone
                  ? "Telefon ma'lumotlarini tahrirlash"
                  : "Yangi telefon qo'shish"
              }}
            </h3>
            <button
              @click="showModal = false"
              class="text-slate-400 hover:text-slate-600"
            >
              <XIcon class="w-4 h-4" />
            </button>
          </div>

          <form
            @submit.prevent="savePhone"
            class="space-y-4 mt-4"
            ref="modalForm"
          >
            <!-- IMEI 1 -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400"
                >IMEI 1 *</label
              >
              <input
                v-model="form.imei1"
                @keydown.enter.prevent="focusNextInput"
                type="text"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none font-mono"
                required
              />
            </div>

            <!-- Product Name -->
            <div class="space-y-1.5 relative">
              <label class="text-[10px] font-semibold text-slate-400"
                >Mahsulot nomi *</label
              >
              <input
                v-model="form.model"
                @input="handleProductInput"
                @keydown="handleSuggestionKeydown"
                @blur="handleBlur"
                type="text"
                placeholder="e.g. a 17 6/128gb"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                required
                autocomplete="off"
              />

              <!-- Suggestions Dropdown -->
              <Transition name="slide-up">
                <div
                  v-if="
                    showSuggestionsDropdown && form.model.trim().length >= 1
                  "
                  class="absolute left-0 right-0 top-full mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border dark:border-slate-800 rounded-2xl shadow-2xl z-50 max-h-[350px] overflow-y-auto divide-y dark:divide-slate-850"
                >
                  <!-- Suggestion Row -->
                  <div
                    v-for="(item, idx) in searchSuggestions"
                    :key="idx"
                    @mousedown="selectSuggestion(item)"
                    class="p-3 hover:bg-slate-100/50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors text-xs flex flex-col gap-1 text-left"
                    :class="{
                      'bg-slate-100 dark:bg-slate-850':
                        activeSuggestionIndex === idx,
                    }"
                  >
                    <div class="flex justify-between items-center">
                      <span
                        class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1"
                      >
                        <span>📱</span>
                        <span
                          v-html="highlightMatch(item.productName, form.model)"
                        ></span>
                      </span>
                      <span class="text-[10px] text-slate-400 font-semibold"
                        >Omborda: {{ item.stock }}</span
                      >
                    </div>
                    <div
                      class="flex justify-between items-center text-[10px] text-slate-500 font-medium"
                    >
                      <span>Sotib olingan: {{ item.purchaseCount }} marta</span>
                      <span class="font-mono"
                        >Oxirgi xarid: ${{ item.lastPurchasePrice }} | Oxirgi
                        sotish: ${{ item.lastSellingPrice }}</span
                      >
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div
                    v-if="searchSuggestions.length === 0"
                    class="p-4 text-center text-xs text-slate-400"
                  >
                    Oldin sotib olingan telefon topilmadi.
                    <p class="text-[9px] text-slate-500 mt-1">
                      Yangi model yaratish uchun Enterni bosing.
                    </p>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Client Name & Phone -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5 relative text-left">
                <label class="text-[10px] font-semibold text-slate-400"
                  >Mijoz ismi</label
                >
                <input
                  v-model="form.clientName"
                  @input="handleCustomerInput($event.target.value)"
                  @keydown="handleCustomerKeydown($event)"
                  @blur="handleCustomerBlur"
                  type="text"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                  autocomplete="off"
                />

                <!-- Customer Suggestions Dropdown -->
                <Transition name="slide-up">
                  <div
                    v-if="
                      showCustomerDropdown && customerSuggestions.length > 0
                    "
                    class="absolute left-0 right-0 top-full mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border dark:border-slate-800 rounded-2xl shadow-2xl z-50 max-h-[220px] overflow-y-auto divide-y dark:divide-slate-850"
                  >
                    <div
                      v-for="(item, idx) in customerSuggestions"
                      :key="idx"
                      @mousedown="selectCustomerSuggestion(item)"
                      class="p-2.5 hover:bg-slate-100/50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors text-xs flex justify-between items-center text-left"
                      :class="{
                        'bg-slate-100 dark:bg-slate-850':
                          activeCustomerSuggestionIndex === idx,
                      }"
                    >
                      <span class="font-bold text-slate-800 dark:text-slate-200"
                        >👤 {{ item.name }}</span
                      >
                      <span
                        class="font-mono text-[10px] text-slate-400 font-semibold"
                        >{{ item.phone }}</span
                      >
                    </div>
                  </div>
                </Transition>
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400"
                  >Mijoz telefon raqami</label
                >
                <input
                  v-model="form.clientPhone"
                  @keydown.enter.prevent="focusNextInput"
                  type="text"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none font-mono"
                />
              </div>
            </div>

            <!-- Purchase Price -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400"
                >Sotib olish narxi ($) *</label
              >
              <input
                v-model.number="form.purchasePrice"
                @keydown.enter.prevent="focusNextInput"
                type="number"
                step="0.01"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none font-mono"
                required
              />
            </div>

            <!-- Price Statistics Helper Info -->
            <Transition name="fade">
              <div
                v-if="selectedSuggestion"
                class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 text-[10px] space-y-1 text-slate-500 font-medium font-mono grid grid-cols-2 gap-x-4 gap-y-1.5"
              >
                <div class="flex justify-between border-b pb-1">
                  <span>Oxirgi xarid:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200"
                    >${{ selectedSuggestion.lastPurchasePrice }}</span
                  >
                </div>
                <div class="flex justify-between border-b pb-1">
                  <span>O'rtacha xarid:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200"
                    >${{ selectedSuggestion.averagePurchasePrice }}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span>Oxirgi sotish:</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200"
                    >${{ selectedSuggestion.lastSellingPrice }}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span>Oxirgi foyda:</span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400"
                    >${{
                      selectedSuggestion.lastSellingPrice -
                      selectedSuggestion.lastPurchasePrice
                    }}</span
                  >
                </div>
              </div>
            </Transition>

            <!-- Status -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400"
                >Holati</label
              >
              <select
                v-model="form.status"
                @keydown.enter.prevent="focusNextInput"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
              >
                <option value="In Stock">Omborda (In Stock)</option>
                <option value="Sold">Sotilgan (Sold)</option>
                <option value="Reserved">Band qilingan (Reserved)</option>
              </select>
            </div>

            <!-- Actions -->
            <div
              class="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50"
            >
              <button
                type="button"
                @click="showModal = false"
                class="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-lg cursor-pointer"
              >
                Saqlash
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Barcode / QR Label Preview Dialog -->
    <Transition name="fade">
      <div
        v-if="labelPhone"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs no-print"
      >
        <div
          class="w-full max-w-sm p-6 rounded-2xl glass-card border shadow-2xl flex flex-col items-center"
        >
          <div
            class="flex items-center justify-between w-full pb-3 border-b border-slate-200/50 dark:border-slate-800/50 mb-4"
          >
            <h4 class="text-sm font-bold text-slate-800 dark:text-white">
              Yorliqlarni chop etish
            </h4>
            <button
              @click="labelPhone = null"
              class="text-slate-400 hover:text-slate-600"
            >
              <XIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Printable area containing labels -->
          <div
            id="printArea"
            class="print-area p-6 bg-white rounded-xl border text-black flex flex-col items-center text-center space-y-4"
          >
            <div>
              <h5 class="text-sm font-bold">
                Mijoz: {{ labelPhone.clientName || "Walk-in" }}
              </h5>
              <p class="text-[9px] text-gray-500 font-mono">
                Telefon: {{ labelPhone.clientPhone || "-" }}
              </p>
            </div>

            <!-- Simulated SVG Barcode -->
            <div class="space-y-1 flex flex-col items-center">
              <svg class="w-48 h-12" viewBox="0 0 100 20">
                <g fill="black">
                  <rect x="2" width="1.5" height="20" />
                  <rect x="5" width="0.5" height="20" />
                  <rect x="7" width="1.0" height="20" />
                  <rect x="10" width="2.0" height="20" />
                  <rect x="14" width="0.5" height="20" />
                  <rect x="16" width="1.5" height="20" />
                  <rect x="19" width="1.0" height="20" />
                  <rect x="22" width="0.5" height="20" />
                  <rect x="24" width="2.5" height="20" />
                  <rect x="28" width="0.5" height="20" />
                  <rect x="30" width="1.0" height="20" />
                  <rect x="33" width="1.5" height="20" />
                  <rect x="36" width="2.0" height="20" />
                  <rect x="40" width="0.5" height="20" />
                  <rect x="42" width="1.0" height="20" />
                  <rect x="45" width="1.5" height="20" />
                  <rect x="48" width="2.5" height="20" />
                  <rect x="52" width="0.5" height="20" />
                  <rect x="54" width="1.0" height="20" />
                  <rect x="57" width="1.5" height="20" />
                  <rect x="60" width="2.0" height="20" />
                  <rect x="64" width="0.5" height="20" />
                  <rect x="66" width="1.0" height="20" />
                  <rect x="69" width="1.5" height="20" />
                  <rect x="72" width="2.5" height="20" />
                  <rect x="76" width="0.5" height="20" />
                  <rect x="78" width="1.0" height="20" />
                  <rect x="81" width="1.5" height="20" />
                  <rect x="84" width="2.0" height="20" />
                  <rect x="88" width="0.5" height="20" />
                  <rect x="90" width="1.0" height="20" />
                  <rect x="93" width="1.5" height="20" />
                  <rect x="96" width="2.0" height="20" />
                </g>
              </svg>
              <span class="text-[8px] tracking-[4px] font-mono">{{
                labelPhone.imei1
              }}</span>
            </div>

            <!-- Simulated SVG QR Code -->
            <div class="flex flex-col items-center">
              <svg class="w-20 h-20" viewBox="0 0 21 21">
                <!-- Outer borders -->
                <rect x="0" y="0" width="7" height="7" fill="black" />
                <rect x="1" y="1" width="5" height="5" fill="white" />
                <rect x="2" y="2" width="3" height="3" fill="black" />

                <rect x="14" y="0" width="7" height="7" fill="black" />
                <rect x="15" y="1" width="5" height="5" fill="white" />
                <rect x="16" y="2" width="3" height="3" fill="black" />

                <rect x="0" y="14" width="7" height="7" fill="black" />
                <rect x="1" y="15" width="5" height="5" fill="white" />
                <rect x="2" y="16" width="3" height="3" fill="black" />

                <!-- Random pixels for code -->
                <rect x="9" y="1" width="2" height="2" fill="black" />
                <rect x="8" y="4" width="1" height="3" fill="black" />
                <rect x="11" y="6" width="2" height="1" fill="black" />
                <rect x="9" y="9" width="3" height="3" fill="black" />
                <rect x="16" y="9" width="2" height="2" fill="black" />
                <rect x="15" y="12" width="2" height="4" fill="black" />
                <rect x="9" y="15" width="3" height="2" fill="black" />
                <rect x="10" y="18" width="4" height="2" fill="black" />
                <rect x="18" y="16" width="2" height="2" fill="black" />
              </svg>
              <span class="text-[8px] font-mono text-gray-400 mt-1"
                >Skan IMEI: {{ labelPhone.imei1 }}</span
              >
            </div>
          </div>

          <!-- Controls -->
          <div class="flex justify-end gap-3 mt-6 w-full">
            <button
              @click="labelPhone = null"
              class="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800"
            >
              Yopish
            </button>
            <button
              @click="triggerPrint"
              class="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
            >
              <PrintIcon class="w-4 h-4" />
              Chop etish
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="showConfirm"
      title="Telefon yozuvini o'chirish"
      :message="`Haqiqatan ham ushbu telefonni ${phoneToDelete?.model || ''} (IMEI: ${phoneToDelete?.imei1 || ''}) o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`"
      @confirm="handleDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useInventoryStore } from "../stores/inventory";
import SkeletonTable from "../components/SkeletonTable.vue";
import ConfirmDialog from "../components/ConfirmDialog.vue";
import {
  Search as SearchIcon,
  Plus as PlusIcon,
  Edit2 as EditIcon,
  Trash2 as TrashIcon,
  QrCode as QrIcon,
  Printer as PrintIcon,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
} from "lucide-vue-next";
import gsap from "gsap";

import axios from "axios";

const authStore = useAuthStore();
const inventoryStore = useInventoryStore();

const viewRef = ref(null);
const showModal = ref(false);
const editingPhone = ref(null);
const labelPhone = ref(null);
const showConfirm = ref(false);
const phoneToDelete = ref(null);

const phones = computed(() => inventoryStore.phones);

const searchSuggestions = ref([]);
const activeSuggestionIndex = ref(-1);
const selectedSuggestion = ref(null);
const showSuggestionsDropdown = ref(false);
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
    const res = await axios.get(
      `/api/phones/customers?search=${encodeURIComponent(query)}`,
    );
    customerSuggestions.value = res.data.customers;
    customerCache[cacheKey] = res.data.customers;
  } catch (error) {
    console.error("Failed to fetch customer suggestions:", error);
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
  form.clientName = item.name;
  form.clientPhone = item.phone;
  showCustomerDropdown.value = false;
  activeCustomerSuggestionIndex.value = -1;
};

const handleCustomerKeydown = (e) => {
  if (!showCustomerDropdown.value || customerSuggestions.value.length === 0) {
    if (e.key === "Enter") {
      e.preventDefault();
      focusNextInput(e);
    }
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeCustomerSuggestionIndex.value =
      (activeCustomerSuggestionIndex.value + 1) %
      customerSuggestions.value.length;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeCustomerSuggestionIndex.value =
      (activeCustomerSuggestionIndex.value -
        1 +
        customerSuggestions.value.length) %
      customerSuggestions.value.length;
  } else if (e.key === "Enter") {
    if (activeCustomerSuggestionIndex.value >= 0) {
      e.preventDefault();
      selectCustomerSuggestion(
        customerSuggestions.value[activeCustomerSuggestionIndex.value],
      );
    } else {
      showCustomerDropdown.value = false;
      e.preventDefault();
      focusNextInput(e);
    }
  } else if (e.key === "Escape") {
    showCustomerDropdown.value = false;
    activeCustomerSuggestionIndex.value = -1;
  }
};

const handleCustomerBlur = () => {
  setTimeout(() => {
    showCustomerDropdown.value = false;
  }, 200);
};

const focusNextInput = (e) => {
  const formEl = e.target.form;
  if (!formEl) return;
  const inputs = Array.from(
    formEl.querySelectorAll(
      'input:not([type="hidden"]):not([disabled]), select:not([disabled])',
    ),
  );
  const index = inputs.indexOf(e.target);
  if (index > -1 && index < inputs.length - 1) {
    inputs[index + 1].focus();
    if (typeof inputs[index + 1].select === "function") {
      inputs[index + 1].select();
    }
  } else if (index === inputs.length - 1) {
    savePhone();
  }
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
    const res = await axios.get(
      `/api/phones/suggestions?search=${encodeURIComponent(query)}`,
    );
    searchSuggestions.value = res.data.suggestions;
    suggestionCache[cacheKey] = res.data.suggestions;
  } catch (error) {
    console.error("Failed to fetch suggestions:", error);
  }
};

let suggestTimeout;
const handleProductInput = (e) => {
  const query = e.target.value;
  activeSuggestionIndex.value = -1;
  showSuggestionsDropdown.value = true;
  clearTimeout(suggestTimeout);

  suggestTimeout = setTimeout(() => {
    fetchSuggestions(query);
  }, 300);
};

const selectSuggestion = (item) => {
  form.model = item.productName;
  if (!form.purchasePrice || form.purchasePrice === 0) {
    form.purchasePrice = item.lastPurchasePrice;
  }
  if (!form.sellingPrice || form.sellingPrice === 0) {
    form.sellingPrice = item.lastSellingPrice || form.purchasePrice;
  }
  selectedSuggestion.value = item;
  showSuggestionsDropdown.value = false;
  activeSuggestionIndex.value = -1;
};

const handleSuggestionKeydown = (e) => {
  if (!showSuggestionsDropdown.value || searchSuggestions.value.length === 0) {
    if (e.key === "Enter") {
      e.preventDefault();
      focusNextInput(e);
    }
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeSuggestionIndex.value =
      (activeSuggestionIndex.value + 1) % searchSuggestions.value.length;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeSuggestionIndex.value =
      (activeSuggestionIndex.value - 1 + searchSuggestions.value.length) %
      searchSuggestions.value.length;
  } else if (e.key === "Enter") {
    if (activeSuggestionIndex.value >= 0) {
      e.preventDefault();
      selectSuggestion(searchSuggestions.value[activeSuggestionIndex.value]);
    } else {
      showSuggestionsDropdown.value = false;
      e.preventDefault();
      focusNextInput(e);
    }
  } else if (e.key === "Escape") {
    showSuggestionsDropdown.value = false;
    activeSuggestionIndex.value = -1;
  }
};

const handleBlur = () => {
  setTimeout(() => {
    showSuggestionsDropdown.value = false;
  }, 200);
};

const highlightMatch = (text, query) => {
  if (!query) return text;
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  return text.replace(
    regex,
    '<mark class="bg-primary-500/20 text-primary-600 dark:text-primary-400 font-bold">$1</mark>',
  );
};

const filters = reactive({
  search: "",
  status: "",
  page: 1,
  limit: 10,
});

const form = reactive({
  imei1: "",
  model: "",
  purchasePrice: 0,
  sellingPrice: 0,
  status: "In Stock",
  clientName: "",
  clientPhone: "",
});

const translateStatus = (status) => {
  switch (status) {
    case "In Stock":
      return "Omborda";
    case "Sold":
      return "Sotilgan";
    case "Reserved":
      return "Band qilingan";
    default:
      return status;
  }
};

const getStatusClasses = (status) => {
  switch (status) {
    case "In Stock":
      return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10";
    case "Sold":
      return "bg-slate-100 dark:bg-slate-900/60 text-slate-500 border border-slate-500/10";
    case "Reserved":
      return "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-500/10";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const fetchData = () => {
  inventoryStore.fetchPhones(filters);
};

let debounceTimeout;
const handleSearch = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    filters.page = 1;
    fetchData();
  }, 300);
};

const changePage = (page) => {
  filters.page = page;
  fetchData();
};

const openModal = (phone = null) => {
  selectedSuggestion.value = null;
  showSuggestionsDropdown.value = false;
  activeSuggestionIndex.value = -1;
  searchSuggestions.value = [];
  if (phone) {
    editingPhone.value = phone;
    Object.assign(form, {
      imei1: phone.imei1,
      model: phone.model || "",
      purchasePrice: phone.purchasePrice,
      sellingPrice: phone.sellingPrice,
      status: phone.status,
      clientName: phone.clientName || "",
      clientPhone: phone.clientPhone || "",
    });
  } else {
    editingPhone.value = null;
    Object.assign(form, {
      imei1: "",
      model: "",
      purchasePrice: 0,
      sellingPrice: 0,
      status: "In Stock",
      clientName: "",
      clientPhone: "",
    });
  }
  showModal.value = true;
};

const savePhone = async () => {
  if (!form.sellingPrice || form.sellingPrice === 0) {
    form.sellingPrice = form.purchasePrice;
  }

  let success;
  if (editingPhone.value) {
    success = await inventoryStore.updatePhone(editingPhone.value._id, form);
  } else {
    success = await inventoryStore.createPhone(form);
  }
  if (success) {
    showModal.value = false;
    fetchData();
  }
};

const confirmDelete = (phone) => {
  phoneToDelete.value = phone;
  showConfirm.value = true;
};

const handleDelete = async () => {
  if (phoneToDelete.value) {
    const success = await inventoryStore.deletePhone(phoneToDelete.value._id);
    if (success) {
      showConfirm.value = false;
      phoneToDelete.value = null;
      fetchData();
    }
  }
};

const printLabels = (phone) => {
  labelPhone.value = phone;
};

const triggerPrint = () => {
  window.print();
};

onMounted(() => {
  fetchData();

  gsap.from(viewRef.value.children, {
    duration: 0.5,
    opacity: 0,
    y: 10,
    stagger: 0.1,
    ease: "power1.out",
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
