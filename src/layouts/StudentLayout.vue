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
        <span class="badge bg-success mt-1">Student</span>
      </div>

      <ul class="nav nav-pills flex-column gap-1">
        <li class="nav-item">
          <RouterLink to="/student/dashboard" class="nav-link text-white">
            My Profile
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/student/schedule" class="nav-link text-white">
            My Schedule
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/student/grades" class="nav-link text-white">
            My Grades
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/student/attendance" class="nav-link text-white">
            My Attendance
          </RouterLink>
        </li>
      </ul>

      <div class="mt-auto pt-3 border-top border-secondary">
        <div class="small text-secondary mb-2">{{ studentName }}</div>
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
        <span class="badge bg-success text-capitalize">Student</span>
      </header>

      <main class="p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { studentService } from "@/services/student";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const studentName = ref(auth.user?.name ?? "");

onMounted(async () => {
  try {
    const res = await studentService.myProfile();
    const p = res.data;
    studentName.value = [p.first_name, p.middle_name, p.last_name, p.suffix]
      .filter(Boolean)
      .join(" ");
  } catch {
    // fallback to user account name if profile fetch fails
    studentName.value = auth.user?.name ?? "";
  }
});

const pageTitle = computed(() => route.name ?? "Dashboard");

async function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>
