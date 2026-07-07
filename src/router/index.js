import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/inventory',
    name: 'PhoneInventory',
    component: () => import('../views/PhoneInventory.vue')
  },
  {
    path: '/accessories',
    name: 'Accessories',
    component: () => import('../views/Accessories.vue')
  },
  {
    path: '/receive-phones',
    name: 'PhoneBuyback',
    component: () => import('../views/ReceivePhones.vue')
  },
  {
    path: '/sell-phones',
    name: 'SellPhones',
    component: () => import('../views/SellPhones.vue')
  },
  {
    path: '/receive-money',
    name: 'ReceiveMoney',
    component: () => import('../views/ReceiveMoney.vue')
  },
  {
    path: '/pay-money',
    name: 'PayMoney',
    component: () => import('../views/PayMoney.vue')
  },
  {
    path: '/expenses',
    name: 'Expenses',
    component: () => import('../views/Expenses.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue')
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Reports.vue'),
    meta: { permission: 'reports' }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/Users.vue'),
    meta: { adminOnly: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { permission: 'settings' }
  },
  {
    path: '/installments',
    name: 'Installments',
    component: () => import('../views/Installments.vue'),
    meta: { permission: 'sales' }
  },
  {
    path: '/installments/new',
    name: 'CreateInstallment',
    component: () => import('../views/CreateInstallment.vue'),
    meta: { permission: 'sales' }
  },
  {
    path: '/installments/:id',
    name: 'InstallmentDetail',
    component: () => import('../views/InstallmentDetail.vue'),
    meta: { permission: 'sales' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard checks
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Ensure default axios authorization headers are initialized
  authStore.initAuth();

  const isAuth = authStore.isAuthenticated;

  if (!to.meta.public && !isAuth) {
    next('/login');
  } else if (to.meta.public && isAuth) {
    next('/');
  } else {
    // Check role or permission
    if (to.meta.adminOnly && !authStore.isAdmin) {
      next('/');
    } else if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
      next('/');
    } else {
      next();
    }
  }
});

export default router;
