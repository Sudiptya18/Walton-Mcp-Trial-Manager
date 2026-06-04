<template>
  <div class="container-fluid p-4">
    <h2 class="mb-4">Activity Logs</h2>
    <div class="table-responsive card card-stat">
      <table class="table table-sm table-hover mb-0">
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Action</th>
            <th>Entity</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ formatDate(log.created_at) }}</td>
            <td>{{ log.user_name || log.user_id || '—' }}</td>
            <td>{{ log.action }}</td>
            <td>{{ log.entity_type }} {{ log.entity_id || '' }}</td>
            <td>{{ log.ip_address || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import api from '@/services/api';

const logs = ref([]);

function formatDate(d) {
  return new Date(d).toLocaleString();
}

onMounted(async () => {
  const { data } = await api.get('/api/dashboard/activity-logs');
  logs.value = data.logs;
});
</script>
