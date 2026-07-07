<template>
  <div class="space-y-6" ref="viewRef">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="flex flex-wrap gap-2 items-center w-full sm:w-auto">
        <div class="relative w-full sm:w-64">
          <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="filters.search"
            @input="handleSearch"
            type="text"
            placeholder="Nom yoki shtrix-kod bo'yicha qidirish..."
            class="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
          />
        </div>

        <select
          v-model="filters.category"
          @change="fetchData"
          class="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
        >
          <option value="">Barcha kategoriyalar</option>
          <option value="Chargers">Zaryadlovchilar (Chargers)</option>
          <option value="Adapters">Adapterlar (Adapters)</option>
          <option value="Cases">Chexollar (Cases)</option>
          <option value="Glass">Himoya oynalari (Glass)</option>
          <option value="Headphones">Quloqchinlar (Headphones)</option>
          <option value="Power Bank">Power Bank</option>
          <option value="USB Cable">USB kabellar (USB Cable)</option>
          <option value="Memory Card">Xotira kartalari (Memory Card)</option>
          <option value="Smart Watch">Smart soatlar (Smart Watch)</option>
          <option value="Bluetooth Devices">Bluetooth qurilmalar</option>
        </select>

        <label class="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer text-slate-600 dark:text-slate-300">
          <input
            v-model="filters.lowStock"
            type="checkbox"
            @change="handleLowStockChange"
            class="w-4 h-4 rounded text-rose-600 border-slate-300 bg-slate-900 focus:ring-rose-500 cursor-pointer"
          />
          Kam qolganlarigina
        </label>
      </div>

      <button
        v-if="authStore.hasPermission('inventory:write')"
        @click="openModal()"
        class="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-600/15"
      >
        <PlusIcon class="w-4 h-4" />
        Aksessuar qo'shish
      </button>
    </div>

    <!-- Accessories Table -->
    <div class="glass-card border rounded-2xl overflow-hidden">
      <SkeletonTable v-if="accStore.loading" :rows="5" />
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/40 text-slate-500">
              <th class="p-4">Nomi / Kategoriya</th>
              <th class="p-4">Shtrix-kod</th>
              <th class="p-4">Tavsif</th>
              <th class="p-4 text-right">Kirim / Sotuv</th>
              <th class="p-4 text-center">Omborda</th>
              <th class="p-4 text-center">Ogohlantirish chegarasi</th>
              <th class="p-4 text-center">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/40">
            <tr v-if="accessories.length === 0">
              <td colspan="7" class="p-8 text-center text-slate-400">
                Filtrga mos keladigan aksessuarlar topilmadi
              </td>
            </tr>
            <tr
              v-for="acc in accessories"
              :key="acc._id"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
            >
              <td class="p-4">
                <div class="font-bold text-slate-800 dark:text-white">{{ acc.name }}</div>
                <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{{ translateCategory(acc.category) }}</div>
              </td>
              <td class="p-4 font-mono text-[10px] text-slate-500">
                {{ acc.barcode || 'Shtrix-kod yo\'q' }}
              </td>
              <td class="p-4 text-slate-500 max-w-xs truncate" :title="acc.description">
                {{ acc.description || '-' }}
              </td>
              <td class="p-4 text-right">
                <div class="font-semibold text-slate-600 dark:text-slate-400">C: ${{ acc.purchasePrice }}</div>
                <div class="font-bold text-primary-600 dark:text-primary-400">S: ${{ acc.sellingPrice }}</div>
              </td>
              <td class="p-4 text-center">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  :class="[
                    acc.quantity <= 0
                      ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/10'
                      : acc.quantity <= acc.stockAlert
                      ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-500/10'
                      : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10'
                  ]"
                >
                  {{ acc.quantity }} ta omborda
                </span>
              </td>
              <td class="p-4 text-center text-slate-400 font-mono text-[10px]">
                {{ acc.stockAlert }}
              </td>
              <td class="p-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    v-if="authStore.hasPermission('inventory:write')"
                    @click="openModal(acc)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    title="Aksessuarni tahrirlash"
                  >
                    <EditIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="authStore.hasPermission('inventory:write')"
                    @click="confirmDelete(acc)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                    title="Aksessuarni o'chirish"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Accessory Modal -->
    <Transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      >
        <div class="w-full max-w-lg p-6 rounded-2xl glass-card border shadow-2xl overflow-y-auto max-h-[90vh]">
          <div class="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">
              {{ editingAccessory ? 'Aksessuar ma\'lumotlarini tahrirlash' : 'Yangi aksessuar qo\'shish' }}
            </h3>
            <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">
              <XIcon class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="saveAccessory" class="space-y-4 mt-4">
            <!-- Name & Category -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Aksessuar nomi *</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">Kategoriya *</label>
                <select
                  v-model="form.category"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                  required
                >
                  <option value="Chargers">Zaryadlovchilar (Chargers)</option>
                  <option value="Adapters">Adapterlar (Adapters)</option>
                  <option value="Cases">Chexollar (Cases)</option>
                  <option value="Glass">Himoya oynalari (Glass)</option>
                  <option value="Headphones">Quloqchinlar (Headphones)</option>
                  <option value="Power Bank">Power Bank</option>
                  <option value="USB Cable">USB kabellar (USB Cable)</option>
                  <option value="Memory Card">Xotira kartalari (Memory Card)</option>
                  <option value="Smart Watch">Smart soatlar (Smart Watch)</option>
                  <option value="Bluetooth Devices">Bluetooth qurilmalar</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">Barcode</label>
                <input
                  v-model="form.barcode"
                  type="text"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none font-mono"
                />
              </div>
            </div>

            <!-- Cost / Sell / Quantity -->
            <div class="grid grid-cols-3 gap-3">
              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">Kirim narxi ($) *</label>
                <input
                  v-model.number="form.purchasePrice"
                  type="number"
                  step="0.01"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                  required
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">Sotish narxi ($) *</label>
                <input
                  v-model.number="form.sellingPrice"
                  type="number"
                  step="0.01"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                  required
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">Ombardagi soni *</label>
                <input
                  v-model.number="form.quantity"
                  type="number"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                  required
                />
              </div>
            </div>

            <!-- Stock Alert & Supplier -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">Ogohlantirish chegarasi *</label>
                <input
                  v-model.number="form.stockAlert"
                  type="number"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-slate-400">Yetkazib beruvchi</label>
                <select
                  v-model="form.supplier"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                >
                  <option :value="null">Yo'q</option>
                  <option
                    v-for="sup in inventoryStore.suppliers"
                    :key="sup._id"
                    :value="sup._id"
                  >
                    {{ sup.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-slate-400">Description</label>
              <textarea
                v-model="form.description"
                rows="2"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none resize-none"
              ></textarea>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
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
      title="Aksessuarni o'chirish"
      :message="`Haqiqatan ham ${itemToDelete?.name} aksessuarini o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`"
      @confirm="handleDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useAccessoriesStore } from '../stores/accessories';
import { useInventoryStore } from '../stores/inventory';
import SkeletonTable from '../components/SkeletonTable.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import {
  Search as SearchIcon,
  Plus as PlusIcon,
  Edit2 as EditIcon,
  Trash2 as TrashIcon,
  X as XIcon
} from 'lucide-vue-next';
import gsap from 'gsap';

const route = useRoute();
const authStore = useAuthStore();
const accStore = useAccessoriesStore();
const inventoryStore = useInventoryStore();

const viewRef = ref(null);
const showModal = ref(false);
const editingAccessory = ref(null);
const showConfirm = ref(false);
const itemToDelete = ref(null);

const accessories = computed(() => accStore.accessories);

const translateCategory = (cat) => {
  switch (cat) {
    case 'Chargers': return 'Zaryadlovchilar';
    case 'Adapters': return 'Adapterlar';
    case 'Cases': return 'Chexollar';
    case 'Glass': return 'Himoya oynalari';
    case 'Headphones': return 'Quloqchinlar';
    case 'Power Bank': return 'Power Bank';
    case 'USB Cable': return 'USB kabellar';
    case 'Memory Card': return 'Xotira kartalari';
    case 'Smart Watch': return 'Smart soatlar';
    case 'Bluetooth Devices': return 'Bluetooth qurilmalar';
    default: return cat;
  }
};

const filters = reactive({
  search: '',
  category: '',
  lowStock: route.query.lowStock === 'true',
  page: 1,
  limit: 100
});

const form = reactive({
  name: '',
  category: 'Chargers',
  purchasePrice: 0,
  sellingPrice: 0,
  quantity: 0,
  supplier: null,
  barcode: '',
  description: '',
  stockAlert: 5
});

const fetchData = () => {
  accStore.fetchAccessories(filters);
};

let debounceTimeout;
const handleSearch = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchData();
  }, 300);
};

const handleLowStockChange = () => {
  fetchData();
};

const openModal = (acc = null) => {
  inventoryStore.fetchSuppliers();
  if (acc) {
    editingAccessory.value = acc;
    Object.assign(form, {
      name: acc.name,
      category: acc.category,
      purchasePrice: acc.purchasePrice,
      sellingPrice: acc.sellingPrice,
      quantity: acc.quantity,
      supplier: acc.supplier?._id || acc.supplier || null,
      barcode: acc.barcode || '',
      description: acc.description || '',
      stockAlert: acc.stockAlert
    });
  } else {
    editingAccessory.value = null;
    Object.assign(form, {
      name: '',
      category: 'Chargers',
      purchasePrice: 0,
      sellingPrice: 0,
      quantity: 0,
      supplier: null,
      barcode: '',
      description: '',
      stockAlert: 5
    });
  }
  showModal.value = true;
};

const saveAccessory = async () => {
  let success;
  if (editingAccessory.value) {
    success = await accStore.updateAccessory(editingAccessory.value._id, form);
  } else {
    success = await accStore.createAccessory(form);
  }
  if (success) {
    showModal.value = false;
    fetchData();
  }
};

const confirmDelete = (acc) => {
  itemToDelete.value = acc;
  showConfirm.value = true;
};

const handleDelete = async () => {
  if (itemToDelete.value) {
    const success = await accStore.deleteAccessory(itemToDelete.value._id);
    if (success) {
      showConfirm.value = false;
      itemToDelete.value = null;
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
    ease: 'power1.out'
  });
});
</script>
