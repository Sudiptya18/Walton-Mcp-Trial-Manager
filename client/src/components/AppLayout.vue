<template>
  <div>
    <nav class="navbar navbar-dark app-navbar px-3">
      <span class="navbar-brand mb-0 h1">WALTON MCP Trial Manager</span>
      <div class="d-flex align-items-center gap-3 text-white">
        <router-link v-if="auth.isAdmin" class="nav-link text-white" to="/dashboard">Dashboard</router-link>
        <router-link class="nav-link text-white" to="/trial-sheet">Trial Sheet</router-link>
        <template v-if="auth.isAdmin">
          <router-link class="nav-link text-white" to="/admin/users">Users</router-link>
          <router-link class="nav-link text-white" to="/admin/activity">Activity</router-link>
        </template>
        <span class="small opacity-75">{{ auth.user?.name }}</span>
        <button class="btn btn-sm btn-outline-light" @click="onLogout">Logout</button>
      </div>
    </nav>
    <main class="p-0">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

async function onLogout() {
  await auth.logout();
  router.push({ name: 'login' });
}
</script>
