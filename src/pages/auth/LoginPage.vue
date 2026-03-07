<template>
  <div
    class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="card shadow-sm" style="width: 100%; max-width: 420px">
      <div class="card-body p-4">
        <div class="text-center mb-4">
          <h4 class="fw-bold mb-1">School Management System</h4>
          <p class="text-muted small">Sign in to your account</p>
        </div>

        <div v-if="errorMessage" class="alert alert-danger py-2 small">
          {{ errorMessage }}
        </div>

        <div class="mb-3">
          <label class="form-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="form-control"
            placeholder="you@example.com"
            :disabled="loading" />
        </div>

        <div class="mb-4">
          <label class="form-label">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="form-control"
            placeholder="••••••••"
            :disabled="loading"
            @keyup.enter="handleLogin" />
        </div>

        <button
          class="btn btn-primary w-100"
          :disabled="loading"
          @click="handleLogin">
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? "Signing in..." : "Sign In" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

const form = ref({
  email: "",
  password: "",
});

const loading = ref(false);
const errorMessage = ref("");

async function handleLogin() {
  errorMessage.value = "";

  if (!form.value.email || !form.value.password) {
    errorMessage.value = "Email and password are required.";
    return;
  }

  loading.value = true;

  try {
    await auth.login(form.value);
    router.push("/admin/dashboard");
  } catch (err) {
    const status = err.response?.status;
    if (status === 401 || status === 422) {
      errorMessage.value = "Invalid email or password.";
    } else {
      errorMessage.value = "Something went wrong. Please try again.";
    }
  } finally {
    loading.value = false;
  }
}
</script>
