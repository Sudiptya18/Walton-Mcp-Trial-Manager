import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { guest: true } },
  {
    path: '/',
    component: () => import('@/components/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: () => homeRoute() },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { admin: true },
      },
      { path: 'trial-sheet', name: 'trial-sheet', component: () => import('@/views/LegacyTrialView.vue') },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: () => import('@/views/admin/UsersView.vue'),
        meta: { admin: true },
      },
      {
        path: 'admin/activity',
        name: 'admin-activity',
        component: () => import('@/views/admin/ActivityLogsView.vue'),
        meta: { admin: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

function homeRoute() {
  const auth = useAuthStore();
  auth.hydrate();
  return auth.isAdmin ? '/dashboard' : '/trial-sheet';
}

router.beforeEach((to) => {
  const auth = useAuthStore();
  auth.hydrate();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'login' };
  if (to.meta.guest && auth.isAuthenticated) return homeRoute();
  if (to.meta.admin && !auth.isAdmin) return { name: 'trial-sheet' };
  return true;
});

export default router;
