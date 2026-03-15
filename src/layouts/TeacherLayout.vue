<template>
  <div class="d-flex min-vh-100">
    <!-- Sidebar -->
    <nav
      class="d-flex flex-column bg-dark text-white p-3"
      style="width: 250px; min-height: 100vh">
      <div class="mb-4">
        <h6 class="fw-bold text-uppercase text-secondary small mb-0">
          School System
        </h6>
        <span class="badge bg-info text-dark mt-1">Teacher</span>
      </div>

      <ul class="nav nav-pills flex-column gap-2">
        <li class="nav-item">
          <RouterLink to="/teacher/dashboard" class="nav-link text-white">
            <i class="bi bi-speedometer2 me-2"></i>Dashboard
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/teacher/schedule" class="nav-link text-white">
            <i class="bi bi-calendar-week me-2"></i>My Schedule
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/teacher/subjects" class="nav-link text-white">
            <i class="bi bi-book me-2"></i>My Subjects
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/teacher/attendance" class="nav-link text-white">
            <i class="bi bi-check-circle me-2"></i>Attendance
          </RouterLink>
        </li>
      </ul>

      <div class="mt-auto pt-3 border-top border-secondary">
        <div class="small text-secondary mb-2">{{ auth.user?.name }}</div>
        <button
          class="btn btn-sm btn-outline-secondary w-100"
          @click="handleLogout">
          Sign Out
        </button>
      </div>
    </nav>

    <!-- Main content -->
    <div class="flex-grow-1 bg-light">
      <header
        class="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
        <h6 class="mb-0 fw-semibold">{{ pageTitle }}</h6>
        <span class="badge bg-info text-dark text-capitalize">Faculty</span>
      </header>

      <main class="p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const pageTitle = computed(() => route.name ?? "Dashboard");

async function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>

<style scoped>
/* Hover effect for nav links */
.nav-link {
  transition: all 0.2s ease;
  border-radius: 0.375rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}
</style>
