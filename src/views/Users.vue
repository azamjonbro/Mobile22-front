<template>
  <div class="space-y-6" ref="viewRef">
    <!-- Header Actions -->
    <div class="flex items-center justify-between">
      <span class="text-xs text-slate-400">Manage employee login profiles and system scope access</span>
      <button
        @click="openModal()"
        class="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow shadow-primary-600/15"
      >
        <PlusIcon class="w-4 h-4" />
        Create User Account
      </button>
    </div>

    <!-- Users Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SkeletonTable v-if="usersStore.loading" class="md:col-span-3" :rows="3" />
      
      <template v-else>
        <div
          v-for="user in users"
          :key="user._id"
          class="p-6 rounded-2xl border glass-card space-y-4 flex flex-col justify-between"
        >
          <!-- User header -->
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                {{ getInitials(user.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-slate-800 dark:text-white truncate">{{ user.name }}</h4>
                <p class="text-[10px] text-slate-400 font-mono truncate">@{{ user.username }}</p>
              </div>
              <span
                class="px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0"
                :class="[
                  user.isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10'
                    : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-500/10'
                ]"
              >
                {{ user.isActive ? 'Active' : 'Suspended' }}
              </span>
            </div>

            <!-- Role & permissions -->
            <div class="space-y-1">
              <span class="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Scope Role: {{ user.role }}</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="perm in user.permissions"
                  :key="perm"
                  class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px]"
                >
                  {{ perm }}
                </span>
                <span v-if="user.role === 'Admin'" class="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[9px] font-bold">
                  All scopes allowed
                </span>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="pt-4 border-t border-slate-200/50 dark:border-slate-800/40 flex items-center justify-end gap-2 text-xs">
            <button
              @click="openResetModal(user)"
              class="px-2.5 py-1.5 rounded-lg border dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              title="Reset Credentials"
            >
              Reset PW
            </button>
            <button
              @click="openModal(user)"
              class="px-2.5 py-1.5 rounded-lg border dark:border-slate-800 text-slate-500 hover:text-primary-600 cursor-pointer"
            >
              Edit
            </button>
            <button
              v-if="user._id !== authStore.user?.id"
              @click="confirmDelete(user)"
              class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Create/Edit User Modal -->
    <Transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      >
        <div class="w-full max-w-md p-6 rounded-2xl glass-card border shadow-2xl">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white">
              {{ editingUser ? 'Edit User Details' : 'Create User profile' }}
            </h4>
            <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">
              <XIcon class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="saveUser" class="space-y-4 mt-4">
            <!-- Full Name -->
            <div class="space-y-1">
              <label class="text-[10px] text-slate-400">Full Name *</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                required
              />
            </div>

            <!-- Username -->
            <div class="space-y-1">
              <label class="text-[10px] text-slate-400">Username *</label>
              <input
                v-model="form.username"
                type="text"
                :disabled="!!editingUser"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none disabled:opacity-50"
                required
              />
            </div>

            <!-- Password (Only shown on create) -->
            <div v-if="!editingUser" class="space-y-1">
              <label class="text-[10px] text-slate-400">Password *</label>
              <input
                v-model="form.password"
                type="password"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                required
              />
            </div>

            <!-- Role & Status -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] text-slate-400">Role *</label>
                <select
                  v-model="form.role"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                  required
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="text-[10px] text-slate-400">Active State</label>
                <select
                  v-model="form.isActive"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                >
                  <option :value="true">Active</option>
                  <option :value="false">Suspended</option>
                </select>
              </div>
            </div>

            <!-- Permissions Checklist -->
            <div v-if="form.role === 'Employee'" class="space-y-2">
              <label class="text-[10px] font-bold text-slate-400">Select Allowed Permissions</label>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <label
                  v-for="perm in availablePermissions"
                  :key="perm"
                  class="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10"
                >
                  <input
                    v-model="form.permissions"
                    :value="perm"
                    type="checkbox"
                    class="rounded border-slate-300 dark:border-slate-800 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <span>{{ perm }}</span>
                </label>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                @click="showModal = false"
                class="px-4 py-2 text-xs border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-xs text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Reset Password Modal -->
    <Transition name="fade">
      <div
        v-if="showResetModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      >
        <div class="w-full max-w-sm p-6 rounded-2xl glass-card border shadow-2xl">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
            Reset Password for @{{ userToReset?.username }}
          </h4>
          <form @submit.prevent="handleReset" class="space-y-4 mt-4">
            <div class="space-y-1">
              <label class="text-[10px] text-slate-400">New Password *</label>
              <input
                v-model="newPassword"
                type="password"
                class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border rounded-lg focus:outline-none"
                required
              />
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                @click="showResetModal = false"
                class="px-3 py-1.5 text-xs border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-3 py-1.5 text-xs text-white bg-primary-600 rounded-lg hover:bg-primary-700 cursor-pointer"
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Confirm dialog -->
    <ConfirmDialog
      :show="showConfirm"
      title="Delete User profile"
      :message="`Are you sure you want to permanently remove user profile '${userToDelete?.name}' from CRM database? This operator will no longer be able to log in.`"
      @confirm="handleDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUsersStore } from '../stores/users';
import SkeletonTable from '../components/SkeletonTable.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import { Plus as PlusIcon, Trash as TrashIcon, X as XIcon } from 'lucide-vue-next';
import gsap from 'gsap';

const authStore = useAuthStore();
const usersStore = useUsersStore();

const viewRef = ref(null);
const showModal = ref(false);
const editingUser = ref(null);
const showResetModal = ref(false);
const userToReset = ref(null);
const newPassword = ref('');
const showConfirm = ref(false);
const userToDelete = ref(null);

const users = computed(() => usersStore.users);

const availablePermissions = ['inventory:read', 'inventory:write', 'sales', 'expenses', 'reports', 'settings'];

const form = reactive({
  name: '',
  username: '',
  password: '',
  role: 'Employee',
  permissions: [],
  isActive: true
});

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const openModal = (user = null) => {
  if (user) {
    editingUser.value = user;
    Object.assign(form, {
      name: user.name,
      username: user.username,
      password: '',
      role: user.role,
      permissions: user.permissions || [],
      isActive: user.isActive
    });
  } else {
    editingUser.value = null;
    Object.assign(form, {
      name: '',
      username: '',
      password: '',
      role: 'Employee',
      permissions: [],
      isActive: true
    });
  }
  showModal.value = true;
};

const saveUser = async () => {
  let success;
  if (editingUser.value) {
    success = await usersStore.updateUser(editingUser.value._id, form);
  } else {
    success = await usersStore.createUser(form);
  }
  if (success) {
    showModal.value = false;
  }
};

const openResetModal = (user) => {
  userToReset.value = user;
  newPassword.value = '';
  showResetModal.value = true;
};

const handleReset = async () => {
  if (userToReset.value && newPassword.value) {
    const success = await usersStore.resetPassword(userToReset.value._id, newPassword.value);
    if (success) {
      showResetModal.value = false;
      userToReset.value = null;
    }
  }
};

const confirmDelete = (user) => {
  userToDelete.value = user;
  showConfirm.value = true;
};

const handleDelete = async () => {
  if (userToDelete.value) {
    const success = await usersStore.deleteUser(userToDelete.value._id);
    if (success) {
      showConfirm.value = false;
      userToDelete.value = null;
    }
  }
};

onMounted(() => {
  usersStore.fetchUsers();

  gsap.from(viewRef.value.children, {
    duration: 0.5,
    opacity: 0,
    y: 10,
    stagger: 0.08,
    ease: 'power1.out'
  });
});
</script>
