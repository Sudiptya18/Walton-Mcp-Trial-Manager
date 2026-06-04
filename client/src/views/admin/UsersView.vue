<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>User Management</h2>
      <button class="btn btn-primary" @click="openCreate">Create User</button>
    </div>
    <div v-if="message" class="alert alert-success">{{ message }}</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div class="table-responsive card card-stat">
      <table class="table table-hover mb-0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Employee ID</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.name }}</td>
            <td>{{ u.username }}</td>
            <td>{{ u.employee_id || '—' }}</td>
            <td>{{ u.email || '—' }}</td>
            <td>{{ u.phone || '—' }}</td>
            <td><span class="badge" :class="u.role === 'admin' ? 'bg-danger' : 'bg-secondary'">{{ u.role }}</span></td>
            <td>{{ u.status }}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(u)">Edit</button>
              <button class="btn btn-sm btn-outline-warning me-1" @click="openReset(u)">Reset PW</button>
              <button
                v-if="u.status === 'active'"
                class="btn btn-sm btn-outline-danger"
                :disabled="u.id === currentUserId"
                @click="disableUser(u)"
              >
                Disable
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="modalOpen" class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.45)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editing ? 'Edit User' : 'Create User' }}</h5>
            <button type="button" class="btn-close" @click="modalOpen = false"></button>
          </div>
          <form @submit.prevent="saveUser">
            <div class="modal-body">
              <div class="mb-2">
                <label class="form-label">Full Name</label>
                <input v-model="form.name" class="form-control" required />
              </div>
              <div class="mb-2">
                <label class="form-label">Username</label>
                <input v-model="form.username" class="form-control" required :disabled="editing" />
              </div>
              <div class="mb-2">
                <label class="form-label">Employee ID</label>
                <input v-model="form.employee_id" class="form-control" placeholder="e.g. EMP-1024" />
              </div>
              <div class="mb-2">
                <label class="form-label">Phone</label>
                <input v-model="form.phone" class="form-control" />
              </div>
              <div class="mb-2">
                <label class="form-label">Email</label>
                <input v-model="form.email" type="email" class="form-control" />
              </div>
              <div class="mb-2" v-if="!editing || resetMode">
                <label class="form-label">Password</label>
                <input v-model="form.password" type="password" class="form-control" :required="!editing" />
              </div>
              <div class="mb-2">
                <label class="form-label">Role</label>
                <select v-model="form.role" class="form-select">
                  <option value="user">Standard User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div v-if="editing" class="mb-2">
                <label class="form-label">Status</label>
                <select v-model="form.status" class="form-select">
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="modalOpen = false">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const currentUserId = auth.user?.id;
const users = ref([]);
const modalOpen = ref(false);
const editing = ref(false);
const resetMode = ref(false);
const saving = ref(false);
const message = ref('');
const error = ref('');
const editId = ref(null);
const form = ref(emptyForm());

function emptyForm() {
  return {
    name: '',
    username: '',
    employee_id: '',
    phone: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
  };
}

async function load() {
  const { data } = await api.get('/api/users');
  users.value = data.users;
}

function openCreate() {
  editing.value = false;
  resetMode.value = false;
  editId.value = null;
  form.value = emptyForm();
  modalOpen.value = true;
}

function openEdit(u) {
  editing.value = true;
  resetMode.value = false;
  editId.value = u.id;
  form.value = { ...u, password: '' };
  modalOpen.value = true;
}

function openReset(u) {
  editing.value = true;
  resetMode.value = true;
  editId.value = u.id;
  form.value = { ...u, password: '' };
  modalOpen.value = true;
}

async function saveUser() {
  saving.value = true;
  message.value = '';
  error.value = '';
  try {
    if (resetMode.value) {
      await api.post(`/api/users/${editId.value}/reset-password`, { password: form.value.password });
      message.value = 'Password reset';
    } else if (editing.value) {
      const payload = { ...form.value };
      delete payload.password;
      if (!payload.password) delete payload.password;
      await api.put(`/api/users/${editId.value}`, payload);
      message.value = 'User updated';
    } else {
      await api.post('/api/users', form.value);
      message.value = 'User created';
    }
    modalOpen.value = false;
    await load();
  } catch (e) {
    error.value = e.response?.data?.message || 'Save failed';
  } finally {
    saving.value = false;
  }
}

async function disableUser(u) {
  if (!confirm(`Disable user ${u.username}?`)) return;
  await api.delete(`/api/users/${u.id}`);
  message.value = 'User disabled';
  await load();
}

onMounted(load);
</script>
