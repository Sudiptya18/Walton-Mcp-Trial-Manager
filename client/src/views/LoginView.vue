<template>
  <div class="login-page">
    <div class="card login-card p-4">
      <div class="text-center mb-4">
        <h4 class="text-primary fw-bold">WALTON MCP Trial Manager</h4>
        <p class="text-muted small mb-0">Metal Casting Plant — Secure Login</p>
      </div>
      <form @submit.prevent="submit">
        <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
        <div class="mb-3">
          <label class="form-label">Username</label>
          <input v-model="username" type="text" class="form-control" required autocomplete="username" />
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <div class="input-group">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              required
              autocomplete="current-password"
            />
            <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="form-check">
            <input id="remember" v-model="remember" class="form-check-input" type="checkbox" />
            <label class="form-check-label" for="remember">Remember Me</label>
          </div>
          <button type="button" class="btn btn-link btn-sm p-0" @click="showForgot = true">Forgot Password?</button>
        </div>
        <button class="btn btn-primary w-100" type="submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Login' }}
        </button>
      </form>
    </div>
    <div v-if="showForgot" class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Forgot Password</h5>
            <button type="button" class="btn-close" @click="showForgot = false"></button>
          </div>
          <div class="modal-body">
            <p class="small text-muted">Contact your system administrator to reset your password.</p>
            <input v-model="forgotEmail" type="email" class="form-control" placeholder="Your email (optional)" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showForgot = false">Close</button>
            <button class="btn btn-primary" @click="submitForgot">Submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

const auth = useAuthStore();
const router = useRouter();
const username = ref('');
const password = ref('');
const remember = ref(true);
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');
const showForgot = ref(false);
const forgotEmail = ref('');

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(username.value, password.value, remember.value);
    router.push({ name: auth.isAdmin ? 'dashboard' : 'trial-sheet' });
  } catch (e) {
    error.value = e.response?.data?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
}

async function submitForgot() {
  try {
    await api.post('/api/auth/forgot-password', { email: forgotEmail.value });
    alert('Request submitted. Contact your administrator.');
    showForgot.value = false;
  } catch {
    alert('Could not submit request.');
  }
}
</script>
