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
            placeholder="Mahsulot nomi, brand yoki storage bo'yicha qidirish..."
            class="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <select
          v-model="filters.condition"
          @change="fetchData"
          class="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
        >
          <option value="">Barcha holatlar (Condition)</option>
          <option value="New">Yangi (New)</option>
          <option value="Used">Ishlatilgan (Used)</option>
          <option value="Refurbished">Yangilangan (Refurbished)</option>
        </select>
      </div>

      <!-- Add Product Button -->
      <button
        v-if="authStore.hasPermission('inventory:write')"
        @click="openModal()"
        class="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-600/15 animate-all"
      >
        <PlusIcon class="w-4 h-4" />
        Mahsulot qo'shish
      </button>
    </div>

    <!-- Inventory Table -->
    <div class="glass-card border rounded-2xl overflow-hidden shadow-xl">
      <SkeletonTable v-if="inventoryStore.loading" :rows="5" />
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr
              class="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/40 text-slate-500"
            >
              <th class="p-4">Mahsulot nomi</th>
              <th class="p-4">Brand</th>
              <th class="p-4">Storage</th>
              <th class="p-4">Mavjud soni</th>
              <th class="p-4 text-center">Holati</th>
              <th class="p-4 text-center">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/40">
            <tr v-if="phones.length === 0">
              <td colspan="6" class="p-12 text-center text-slate-400">
                <div class="flex flex-col items-center justify-center space-y-2">
                  <span class="text-2xl">📦</span>
                  <p>Omborda mahsulotlar topilmadi</p>
                </div>
              </td>
            </tr>
            <tr
              v-for="phone in phones"
              :key="phone._id"
              class="hover:bg-slate-50/30 dark:hover:bg-slate-900/5 transition-colors"
            >
              <td class="p-4 text-slate-800 dark:text-white font-semibold">
                {{ phone.name || "-" }}
              </td>
              <td class="p-4 text-slate-600 dark:text-slate-300">
                {{ phone.brand || "-" }}
              </td>
              <td class="p-4 font-mono text-slate-500">
                {{ phone.storage || "-" }}
              </td>
              <td class="p-4 font-mono font-bold text-slate-850 dark:text-slate-100">
                {{ phone.quantity ?? 0 }} ta
              </td>
              <td class="p-4 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="phone.quantity > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'"
                >
                  {{ phone.quantity > 0 ? "Omborda" : "Tugagan" }}
                </span>
              </td>
              <td class="p-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    v-if="authStore.hasPermission('inventory:write')"
                    @click="openModal(phone)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    title="Tahrirlash"
                  >
                    <EditIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="authStore.hasPermission('inventory:write')"
                    @click="confirmDelete(phone)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    title="O'chirish"
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

    <!-- Add/Edit Product Modal -->
    <Transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      >
        <div
          class="w-full max-w-2xl p-6 rounded-2xl glass-card border shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col space-y-4"
        >
          <div
            class="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50"
          >
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">
              {{
                editingPhone
                  ? "Mahsulot ma'lumotlarini tahrirlash"
                  : "Yangi mahsulot qo'shish"
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
            class="space-y-4"
            ref="modalForm"
          >
            <!-- Product Specs -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">Mahsulot nomi *</label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Masalan: S26 Ultra"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">Brand *</label>
                <input
                  v-model="form.brand"
                  type="text"
                  placeholder="Masalan: Samsung"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">Storage (Xotira)</label>
                <input
                  v-model="form.storage"
                  type="text"
                  placeholder="Masalan: 256GB"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">Holati *</label>
                <select
                  v-model="form.condition"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                  required
                >
                  <option value="New">Yangi (New)</option>
                  <option value="Used">Ishlatilgan (Used)</option>
                  <option value="Refurbished">Yangilangan (Refurbished)</option>
                </select>
              </div>
            </div>

            <!-- Initial Entry Details (Only shown when adding new product) -->
            <div v-if="!editingPhone" class="p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300">Dastlabki kirim ma'lumotlari</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-semibold text-slate-400">Kirim soni *</label>
                  <input
                    v-model.number="form.quantity"
                    type="number"
                    min="1"
                    class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none font-mono"
                    required
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-[10px] font-semibold text-slate-400">Kirim narxi ($) *</label>
                  <input
                    v-model.number="form.buyPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">Izoh</label>
                <input
                  v-model="form.note"
                  type="text"
                  placeholder="Kirim bo'yicha qo'shimcha izoh"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <!-- Edit Historical Inventory Entries List (Only shown when editing product) -->
            <div v-else class="space-y-3">
              <div class="flex justify-between items-center pb-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300">Kirimlar tarixi (Inventory Entries)</h4>
                <button
                  type="button"
                  @click="addNewEntryRow"
                  class="px-2 py-1 text-[10px] bg-primary-600/10 text-primary-500 rounded-lg hover:bg-primary-600/20 transition-all font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <PlusIcon class="w-3.5 h-3.5" /> Kirim qo'shish
                </button>
              </div>

              <!-- Entries table list -->
              <div class="overflow-x-auto border rounded-xl max-h-48 overflow-y-auto">
                <table class="w-full text-left text-[11px]">
                  <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-400">
                    <tr>
                      <th class="p-2">Miqdori</th>
                      <th class="p-2">Kirim narxi</th>
                      <th class="p-2">Izoh</th>
                      <th class="p-2 text-center">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Inline editable rows -->
                    <tr v-for="entry in phoneEntries" :key="entry._id" class="border-t dark:border-slate-800/50">
                      <td class="p-2">
                        <input
                          v-model.number="entry.quantity"
                          type="number"
                          min="1"
                          class="w-16 px-1.5 py-1 bg-white dark:bg-slate-900 border rounded font-mono"
                        />
                      </td>
                      <td class="p-2">
                        <input
                          v-model.number="entry.buyPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          class="w-20 px-1.5 py-1 bg-white dark:bg-slate-900 border rounded font-mono"
                        />
                      </td>
                      <td class="p-2">
                        <input
                          v-model="entry.note"
                          type="text"
                          class="w-full min-w-[120px] px-1.5 py-1 bg-white dark:bg-slate-900 border rounded"
                        />
                      </td>
                      <td class="p-2 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            @click="saveEntry(entry)"
                            class="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                            title="Saqlash"
                          >
                            <SaveIcon class="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            @click="deleteEntry(entry._id)"
                            class="p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            title="O'chirish"
                          >
                            <TrashIcon class="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="phoneEntries.length === 0">
                      <td colspan="4" class="p-4 text-center text-slate-400">
                        Kirimlar tarixi bo'sh. Qolgan zaxirani oshirish uchun zaxira qo'shing.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Actions -->
            <div
              class="flex justify-end gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50"
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

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="showConfirm"
      title="Mahsulotni o'chirish"
      message="Haqiqatan ham ushbu mahsulotni o'chirib tashlamoqchimisiz? Bu amalni faqat mahsulotning kirim va sotuv tarixi bo'lmagandagina bajarish mumkin."
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
  ChevronLeft,
  ChevronRight,
  X as XIcon,
  Save as SaveIcon
} from "lucide-vue-next";
import gsap from "gsap";
import axios from "axios";

const authStore = useAuthStore();
const inventoryStore = useInventoryStore();

const viewRef = ref(null);
const showModal = ref(false);
const editingPhone = ref(null);
const showConfirm = ref(false);
const phoneToDelete = ref(null);

const phones = computed(() => inventoryStore.phones);
const phoneEntries = ref([]);

const filters = reactive({
  search: "",
  condition: "",
  page: 1,
  limit: 10,
});

const form = reactive({
  name: "",
  brand: "",
  storage: "",
  condition: "New",
  quantity: 1,
  buyPrice: 0,
  note: "",
});

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

const openModal = async (phone = null) => {
  if (phone) {
    editingPhone.value = phone;
    Object.assign(form, {
      name: phone.name || "",
      brand: phone.brand || "",
      storage: phone.storage || "",
      condition: phone.condition || "New",
      quantity: 1,
      buyPrice: 0,
      note: "",
    });

    // Load inventory entries
    phoneEntries.value = await inventoryStore.fetchProductEntries(phone._id);
  } else {
    editingPhone.value = null;
    Object.assign(form, {
      name: "",
      brand: "",
      storage: "",
      condition: "New",
      quantity: 1,
      buyPrice: 0,
      note: "",
    });
    phoneEntries.value = [];
  }
  showModal.value = true;
};

const savePhone = async () => {
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

const addNewEntryRow = () => {
  if (!editingPhone.value) return;
  phoneEntries.value.push({
    _id: `new-${Math.random()}`,
    productId: editingPhone.value._id,
    quantity: 1,
    buyPrice: 0,
    note: "",
    isNew: true
  });
};

const saveEntry = async (entry) => {
  let success;
  if (entry.isNew) {
    success = await inventoryStore.receivePhones({
      phones: [{
        model: editingPhone.value.name,
        brand: editingPhone.value.brand,
        storage: editingPhone.value.storage,
        condition: editingPhone.value.condition,
        quantity: entry.quantity,
        purchasePrice: entry.buyPrice,
        note: entry.note
      }],
      invoiceNumber: `ENTRY-${Math.floor(1000 + Math.random() * 9000)}`
    });
  } else {
    success = await inventoryStore.updateInventoryEntry(entry._id, {
      quantity: entry.quantity,
      buyPrice: entry.buyPrice,
      note: entry.note
    });
  }

  if (success) {
    // Reload entries list
    phoneEntries.value = await inventoryStore.fetchProductEntries(editingPhone.value._id);
    fetchData();
  }
};

const deleteEntry = async (entryId) => {
  if (entryId.startsWith('new-')) {
    phoneEntries.value = phoneEntries.value.filter(e => e._id !== entryId);
    return;
  }
  const success = await inventoryStore.deleteInventoryEntry(entryId);
  if (success) {
    phoneEntries.value = phoneEntries.value.filter(e => e._id !== entryId);
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
