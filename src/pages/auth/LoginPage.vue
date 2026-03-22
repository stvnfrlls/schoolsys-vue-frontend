<template>
  <div class="login-layout">
    <!-- Left panel (desktop only) -->
    <div class="login-panel d-none d-lg-flex">
      <div class="panel-inner">
        <RouterLink to="/" class="panel-logo">SchoolSys</RouterLink>
        <p class="panel-tagline">
          A unified platform for administrators, teachers, and students.
        </p>
        <div class="panel-roles">
          <span v-for="role in roles" :key="role" class="role-tag">{{ role }}</span>
        </div>
      </div>
    </div>

    <!-- Right panel: form -->
    <div class="login-form-panel d-flex align-items-center justify-content-center">
      <div class="login-form-inner w-100">

        <!-- Mobile logo -->
        <div class="d-lg-none mb-4">
          <RouterLink to="/" class="mobile-logo">SchoolSys</RouterLink>
        </div>

        <h2 class="form-heading">Sign in</h2>
        <p class="form-sub">Enter your credentials to access your account.</p>

        <div v-if="errorMessage" class="alert alert-danger py-2 small mt-3">
          {{ errorMessage }}
        </div>

        <div class="mb-3 mt-4">
          <label class="form-label">Email address</label>
          <input v-model="form.email" type="email" class="form-control" placeholder="you@schoolsys.com"
            :disabled="loading" autocomplete="email" />
        </div>

        <div class="mb-4">
          <label class="form-label">Password</label>
          <input v-model="form.password" type="password" class="form-control" placeholder="••••••••" :disabled="loading"
            autocomplete="current-password" @keyup.enter="handleLogin" />
        </div>

        <button class="btn login-btn w-100" :disabled="loading" @click="handleLogin">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <div class="mt-4 text-center">
          <RouterLink to="/" class="back-link">Back to home</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const errorMessage = ref('')

const roles = ['Administrator', 'Teacher', 'Student']

function roleHomeRoute(role) {
  if (role === 'admin' || role === 'sub-admin') return '/admin/dashboard'
  if (role === 'faculty') return '/teacher/dashboard'
  if (role === 'student') return '/student/dashboard'
  return '/'
}

async function handleLogin() {
  errorMessage.value = ''

  if (!form.value.email || !form.value.password) {
    errorMessage.value = 'Email and password are required.'
    return
  }

  loading.value = true

  try {
    await auth.login(form.value)
    router.push(roleHomeRoute(auth.userRole))
  } catch (err) {
    const status = err.response?.status
    if (status === 401 || status === 422) {
      errorMessage.value = 'Invalid email or password.'
    } else {
      errorMessage.value = 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

/* ── Layout ──────────────────────────────────────────── */
.login-layout {
  display: flex;
  min-height: 100vh;
  font-family: 'Outfit', sans-serif;
}

/* ── Left panel ──────────────────────────────────────── */
.login-panel {
  width: 42%;
  flex-shrink: 0;
  background: #0d1b2a;
  flex-direction: column;
  justify-content: center;
  padding: 4rem;
  position: relative;
  overflow: hidden;
}

.login-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 64px 64px;
  pointer-events: none;
}

.panel-inner {
  position: relative;
  z-index: 1;
}

.panel-logo {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: #ffffff;
  text-decoration: none;
  letter-spacing: -0.02em;
  margin-bottom: 3.5rem;
}

.panel-tagline {
  font-family: 'DM Serif Display', serif;
  font-size: 1.9rem;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.82);
  margin-bottom: 2.5rem;
  max-width: 320px;
}

.panel-roles {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.role-tag {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.3rem 0.85rem;
  border-radius: 2px;
}

/* ── Right panel ─────────────────────────────────────── */
.login-form-panel {
  flex: 1;
  padding: 2rem;
  background: #ffffff;
}

.login-form-inner {
  max-width: 380px;
  margin: 0 auto;
}

.mobile-logo {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  color: #0d1b2a;
  text-decoration: none;
  letter-spacing: -0.02em;
}

/* ── Form ────────────────────────────────────────────── */
.form-heading {
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  color: #1e293b;
  letter-spacing: -0.01em;
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.form-sub {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.4rem;
}

.form-control {
  border: 1px solid #e2e8f0;
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  padding: 0.6rem 0.85rem;
  border-radius: 4px;
  color: #1e293b;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control::placeholder {
  color: #94a3b8;
}

.form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  outline: none;
}

.login-btn {
  background: #2563eb;
  border: 1px solid #2563eb;
  color: #ffffff;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.7rem 1rem;
  border-radius: 4px;
  transition: background 0.2s, transform 0.15s;
}

.login-btn:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.back-link {
  font-size: 0.82rem;
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: #2563eb;
}
</style>