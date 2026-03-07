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
      </div>

      <ul class="nav nav-pills flex-column gap-1">
        <li class="nav-item">
          <RouterLink to="/admin/dashboard" class="nav-link text-white">
            Dashboard
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/admin/users" class="nav-link text-white">
            Users
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/admin/grades-sections" class="nav-link text-white">
            Grades & Sections
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
      <!-- Topbar -->
      <header
        class="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
        <h6 class="mb-0 fw-semibold">{{ pageTitle }}</h6>
        <span class="badge bg-primary text-capitalize">{{
          auth.userRole
        }}</span>
      </header>

      <!-- Page content -->
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
