<template>
  <div class="container-fluid p-4">
    <h2 class="mb-4">Dashboard</h2>
    <div class="row g-3 mb-4">
      <div class="col-md-3" v-for="card in statCards" :key="card.label">
        <div class="card card-stat p-3">
          <div class="text-muted small">{{ card.label }}</div>
          <div class="fs-3 fw-bold text-primary">{{ card.value }}</div>
        </div>
      </div>
    </div>
    <div class="row g-4">
      <div class="col-lg-6">
        <div class="card card-stat">
          <div class="card-header bg-white fw-bold">Quick Access</div>
          <div class="card-body d-flex flex-wrap gap-2">
            <router-link class="btn btn-primary" to="/trial-sheet">Trial Sheet</router-link>
            <router-link class="btn btn-outline-primary" to="/admin/users">Manage Users</router-link>
            <router-link class="btn btn-outline-secondary" to="/admin/activity">Activity Logs</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const stats = ref({});

const statCards = computed(() => [
  { label: 'Total Users', value: stats.value.totalUsers ?? '—' },
  { label: 'Total Forms', value: stats.value.totalForms ?? '—' },
  { label: 'Logins Today', value: stats.value.loginsToday ?? '—' },
]);

onMounted(async () => {
  try {
    const { data } = await api.get('/api/dashboard/stats');
    stats.value = data.stats;
  } catch {
    /* API offline */
  }
});
</script>
