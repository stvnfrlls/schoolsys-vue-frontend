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

      <ul class="nav nav-pills flex-column gap-2">
        <!-- Dashboard - always visible -->
        <li class="nav-item">
          <RouterLink to="/admin/dashboard" class="nav-link text-white">
            <i class="bi bi-speedometer2 me-2"></i>Dashboard
          </RouterLink>
        </li>

        <!-- Academic Management -->
        <li class="nav-item">
          <button
            class="nav-link text-white w-100 text-start d-flex align-items-center justify-content-between"
            :class="{ active: isAcademicActive }"
            @click="toggleDropdown('academic')"
            :aria-expanded="dropdowns.academic">
            <span> <i class="bi bi-book me-2"></i>Academic </span>
            <i
              :class="[
                'bi',
                dropdowns.academic ? 'bi-chevron-up' : 'bi-chevron-down',
              ]"
              style="font-size: 0.8rem"></i>
          </button>
          <Transition name="collapse">
            <ul
              v-show="dropdowns.academic"
              class="nav flex-column ms-3 gap-1 mt-1">
              <li class="nav-item">
                <RouterLink
                  to="/admin/grades-sections"
                  class="nav-link text-white-50 small">
                  Grades & Sections
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink
                  to="/admin/subjects"
                  class="nav-link text-white-50 small">
                  Subjects
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink
                  to="/admin/scheduling"
                  class="nav-link text-white-50 small">
                  Scheduling
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink
                  to="/admin/grading"
                  class="nav-link text-white-50 small">
                  Grading
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink
                  to="/admin/assignment"
                  class="nav-link text-white-50 small">
                  Assignment
                </RouterLink>
              </li>
            </ul>
          </Transition>
        </li>

        <!-- Student Records -->
        <li class="nav-item">
          <button
            class="nav-link text-white w-100 text-start d-flex align-items-center justify-content-between"
            :class="{ active: isStudentsActive }"
            @click="toggleDropdown('students')"
            :aria-expanded="dropdowns.students">
            <span> <i class="bi bi-people me-2"></i>Student Records </span>
            <i
              :class="[
                'bi',
                dropdowns.students ? 'bi-chevron-up' : 'bi-chevron-down',
              ]"
              style="font-size: 0.8rem"></i>
          </button>
          <Transition name="collapse">
            <ul
              v-show="dropdowns.students"
              class="nav flex-column ms-3 gap-1 mt-1">
              <li class="nav-item">
                <RouterLink
                  to="/admin/students"
                  class="nav-link text-white-50 small">
                  Students
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink
                  to="/admin/enrollments"
                  class="nav-link text-white-50 small">
                  Enrollments
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink
                  to="/admin/attendance"
                  class="nav-link text-white-50 small">
                  Attendance
                </RouterLink>
              </li>
            </ul>
          </Transition>
        </li>

        <!-- System Admin -->
        <li class="nav-item">
          <button
            class="nav-link text-white w-100 text-start d-flex align-items-center justify-content-between"
            :class="{ active: isAdminActive }"
            @click="toggleDropdown('admin')"
            :aria-expanded="dropdowns.admin">
            <span> <i class="bi bi-gear me-2"></i>System Admin </span>
            <i
              :class="[
                'bi',
                dropdowns.admin ? 'bi-chevron-up' : 'bi-chevron-down',
              ]"
              style="font-size: 0.8rem"></i>
          </button>
          <Transition name="collapse">
            <ul
              v-show="dropdowns.admin"
              class="nav flex-column ms-3 gap-1 mt-1">
              <li class="nav-item">
                <RouterLink
                  to="/admin/users"
                  class="nav-link text-white-50 small">
                  Users
                </RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink
                  to="/admin/faculty"
                  class="nav-link text-white-50 small">
                  Faculty
                </RouterLink>
              </li>
            </ul>
          </Transition>
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
import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const dropdowns = reactive({
  academic: false,
  students: false,
  admin: false,
});

const pageTitle = computed(() => route.name ?? "Dashboard");

const academicRoutes = ["grades-sections", "subjects", "scheduling", "grading"];
const studentRoutes = ["students", "enrollments", "attendance"];
const adminRoutes = ["users", "faculty"];

const isAcademicActive = computed(() => {
  return academicRoutes.some((r) => route.path.includes(r));
});

const isStudentsActive = computed(() => {
  return studentRoutes.some((r) => route.path.includes(r));
});

const isAdminActive = computed(() => {
  return adminRoutes.some((r) => route.path.includes(r));
});

// Auto-open dropdown when visiting a route in that category
watch(
  [isAcademicActive, isStudentsActive, isAdminActive],
  ([academic, students, admin]) => {
    if (academic) dropdowns.academic = true;
    if (students) dropdowns.students = true;
    if (admin) dropdowns.admin = true;
  },
  { immediate: true },
);

function toggleDropdown(name) {
  // Close all other dropdowns
  Object.keys(dropdowns).forEach((key) => {
    if (key !== name) {
      dropdowns[key] = false;
    }
  });
  // Toggle the clicked one
  dropdowns[name] = !dropdowns[name];
}

async function handleLogout() {
  auth.logout();
  router.push("/login");
}
</script>

<style scoped>
/* Smooth collapse transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 500px;
  overflow: hidden;
}

/* Hover effect for dropdown items */
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

/* Nested links styling */
.nav .nav-link.text-white-50 {
  padding-left: 0.5rem;
}

.nav .nav-link.text-white-50:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.05);
}

.nav .nav-link.text-white-50.router-link-active {
  color: #60a5fa;
  background-color: rgba(59, 130, 246, 0.15);
  font-weight: 500;
}

/* Button styling for dropdown toggles */
button.nav-link {
  border: none;
  cursor: pointer;
  padding: var(--bs-nav-link-padding-y) var(--bs-nav-link-padding-x);
}

button.nav-link:hover {
  color: #fff;
}

button.nav-link.active {
  background-color: rgba(59, 130, 246, 0.3);
  color: #60a5fa;
}
</style>
