<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
    <!-- Visual background blobs -->
    <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary-600/20 blur-3xl"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl"></div>

    <!-- Login Card -->
    <div
      ref="loginCard"
      class="w-full max-w-md p-8 rounded-3xl glass-card border border-white/10 shadow-2xl relative z-10 bg-slate-950/40 text-white"
    >
      <div class="flex flex-col items-center text-center space-y-2 mb-8">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 shadow-lg shadow-primary-500/25 flex items-center justify-center">
          <SmartphoneIcon class="w-6 h-6 text-white" />
        </div>
        <h2 class="text-2xl font-extrabold tracking-tight">Access PhoneCRM</h2>
        <p class="text-xs text-slate-400">Enter your credentials to enter the workspace</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Username -->
        <div class="space-y-1.5">
          <label for="username" class="text-xs font-semibold text-slate-300">Username</label>
          <div class="relative">
            <UserIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="username"
              type="text"
              id="username"
              placeholder="e.g. admin"
              class="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all text-sm placeholder:text-slate-500 text-white"
              required
            />
          </div>
        </div>

        <!-- Password -->
        <div class="space-y-1.5">
          <label for="password" class="text-xs font-semibold text-slate-300">Password</label>
          <div class="relative">
            <LockIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              v-model="password"
              type="password"
              id="password"
              placeholder="••••••••"
              class="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-all text-sm placeholder:text-slate-500 text-white"
              required
            />
          </div>
        </div>

        <!-- Remember login & reset -->
        <div class="flex items-center justify-between text-xs">
          <label class="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="w-4 h-4 rounded border-slate-800 bg-slate-900 text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
            Remember Login
          </label>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          <LoaderIcon v-if="authStore.loading" class="w-4 h-4 animate-spin" />
          <span>{{ authStore.loading ? 'Signing in...' : 'Sign In' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  Smartphone as SmartphoneIcon,
  User as UserIcon,
  Lock as LockIcon,
  Loader as LoaderIcon
} from 'lucide-vue-next';
import gsap from 'gsap';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const loginCard = ref(null);

onMounted(() => {
  // GSAP animation entrance
  gsap.from(loginCard.value, {
    duration: 0.8,
    opacity: 0,
    y: 30,
    ease: 'power3.out'
  });
});

const handleLogin = async () => {
  const success = await authStore.login(username.value, password.value, rememberMe.value);
  if (success) {
    router.push('/');
  }
};
</script>
