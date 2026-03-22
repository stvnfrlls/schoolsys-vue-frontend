<template>
  <div class="d-flex min-vh-100 admin-layout">
    <!-- Sidebar -->
    <nav class="sidebar d-flex flex-column p-3">
      <div class="sidebar-brand mb-4">
        <span class="brand-name">SchoolSys</span>
        <span class="brand-sub">Admin Portal</span>
      </div>

      <ul class="nav nav-pills flex-column gap-1">
        <!-- Dashboard -->
        <li class="nav-item">
          <RouterLink to="/admin/dashboard" class="sidebar-link">
            <i class="bi bi-speedometer2 me-2"></i>Dashboard
          </RouterLink>
        </li>

        <!-- Academic Management -->
        <li class="nav-item">
          <button class="sidebar-link sidebar-toggle w-100 text-start d-flex align-items-center justify-content-between"
            :class="{ 'is-active': isAcademicActive }" @click="toggleDropdown('academic')"
            :aria-expanded="dropdowns.academic">
            <span><i class="bi bi-book me-2"></i>Academic</span>
            <i :class="['bi', dropdowns.academic ? 'bi-chevron-up' : 'bi-chevron-down']" class="chevron"></i>
          </button>
          <Transition name="collapse">
            <ul v-show="dropdowns.academic" class="nav flex-column ms-3 gap-1 mt-1">
              <li class="nav-item">
                <RouterLink to="/admin/grades-sections" class="sidebar-sub-link">Grades &amp; Sections</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/admin/subjects" class="sidebar-sub-link">Subjects</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/admin/scheduling" class="sidebar-sub-link">Scheduling</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/admin/grading" class="sidebar-sub-link">Grading</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/admin/assignment" class="sidebar-sub-link">Assignment</RouterLink>
              </li>
            </ul>
          </Transition>
        </li>

        <!-- Student Records -->
        <li class="nav-item">
          <button class="sidebar-link sidebar-toggle w-100 text-start d-flex align-items-center justify-content-between"
            :class="{ 'is-active': isStudentsActive }" @click="toggleDropdown('students')"
            :aria-expanded="dropdowns.students">
            <span><i class="bi bi-people me-2"></i>Student Records</span>
            <i :class="['bi', dropdowns.students ? 'bi-chevron-up' : 'bi-chevron-down']" class="chevron"></i>
          </button>
          <Transition name="collapse">
            <ul v-show="dropdowns.students" class="nav flex-column ms-3 gap-1 mt-1">
              <li class="nav-item">
                <RouterLink to="/admin/students" class="sidebar-sub-link">Students</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/admin/enrollments" class="sidebar-sub-link">Enrollments</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/admin/attendance" class="sidebar-sub-link">Attendance</RouterLink>
              </li>
            </ul>
          </Transition>
        </li>

        <!-- System Admin -->
        <li class="nav-item">
          <button class="sidebar-link sidebar-toggle w-100 text-start d-flex align-items-center justify-content-between"
            :class="{ 'is-active': isAdminActive }" @click="toggleDropdown('admin')" :aria-expanded="dropdowns.admin">
            <span><i class="bi bi-gear me-2"></i>System Admin</span>
            <i :class="['bi', dropdowns.admin ? 'bi-chevron-up' : 'bi-chevron-down']" class="chevron"></i>
          </button>
          <Transition name="collapse">
            <ul v-show="dropdowns.admin" class="nav flex-column ms-3 gap-1 mt-1">
              <li class="nav-item">
                <RouterLink to="/admin/users" class="sidebar-sub-link">Users</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink to="/admin/faculty" class="sidebar-sub-link">Faculty</RouterLink>
              </li>
            </ul>
          </Transition>
        </li>
      </ul>

      <!-- Footer -->
      <div class="sidebar-footer mt-auto pt-3">
        <div class="sidebar-user-name">{{ auth.user?.name }}</div>
        <button class="sidebar-logout w-100" @click="handleLogout">Sign Out</button>
      </div>
    </nav>

    <!-- Main content -->
    <div class="flex-grow-1 main-area">
      <!-- Topbar -->
      <header class="topbar d-flex align-items-center justify-content-between px-4">
        <h6 class="topbar-title mb-0">{{ pageTitle }}</h6>
        <span class="role-badge">{{ auth.userRole }}</span>
      </header>

      <!-- Page content -->
      <main class="page-content p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const dropdowns = reactive({ academic: false, students: false, admin: false })

const pageTitle = computed(() => route.name ?? 'Dashboard')

const academicRoutes = ['grades-sections', 'subjects', 'scheduling', 'grading', 'assignment']
const studentRoutes = ['students', 'enrollments', 'attendance']
const adminRoutes = ['users', 'faculty']

const isAcademicActive = computed(() => academicRoutes.some(r => route.path.includes(r)))
const isStudentsActive = computed(() => studentRoutes.some(r => route.path.includes(r)))
const isAdminActive = computed(() => adminRoutes.some(r => route.path.includes(r)))

watch(
  [isAcademicActive, isStudentsActive, isAdminActive],
  ([academic, students, admin]) => {
    if (academic) dropdowns.academic = true
    if (students) dropdowns.students = true
    if (admin) dropdowns.admin = true
  },
  { immediate: true }
)

function toggleDropdown(name) {
  Object.keys(dropdowns).forEach(key => { if (key !== name) dropdowns[key] = false })
  dropdowns[name] = !dropdowns[name]
}

async function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────── */
.admin-layout {
  font-family: var(--ss-font-ui);
  background: var(--ss-light);
}

/* ── Sidebar ─────────────────────────────────────────── */
.sidebar {
  width: 248px;
  min-height: 100vh;
  flex-shrink: 0;
  background: var(--ss-navy);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-brand {
  display: flex;
  flex-direction: column;
  padding: 0.25rem 0.5rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  margin-bottom: 0.25rem;
}

.brand-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--ss-white);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.brand-sub {
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 0.2rem;
}

/* ── Sidebar links ───────────────────────────────────── */
.sidebar-link {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: var(--ss-radius);
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  border: none;
  background: none;
  cursor: pointer;
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.07);
  color: var(--ss-white);
}

.sidebar-link.router-link-active,
.sidebar-link.is-active {
  background: rgba(37, 99, 235, 0.25);
  color: #93c5fd;
}

.sidebar-toggle {
  justify-content: space-between;
}

.chevron {
  font-size: 0.7rem;
  opacity: 0.5;
}

/* ── Sub-links ───────────────────────────────────────── */
.sidebar-sub-link {
  display: block;
  padding: 0.375rem 0.6rem;
  border-radius: var(--ss-radius);
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.38);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.sidebar-sub-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.75);
}

.sidebar-sub-link.router-link-active {
  color: #93c5fd;
  background: rgba(37, 99, 235, 0.15);
  font-weight: 500;
}

/* ── Sidebar footer ──────────────────────────────────── */
.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  padding-top: 0.75rem;
}

.sidebar-user-name {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.35);
  padding: 0 0.5rem;
  margin-bottom: 0.6rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-logout {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.45);
  font-family: var(--ss-font-ui);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.45rem 0.75rem;
  border-radius: var(--ss-radius);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.sidebar-logout:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: var(--ss-white);
  background: rgba(255, 255, 255, 0.05);
}

/* ── Topbar ──────────────────────────────────────────── */
.topbar {
  height: 56px;
  background: var(--ss-white);
  border-bottom: 1px solid var(--ss-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ss-text);
  letter-spacing: -0.01em;
}

.role-badge {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: var(--ss-accent-light);
  color: var(--ss-accent);
  border: 1px solid var(--ss-accent-border);
  padding: 0.28rem 0.75rem;
  border-radius: var(--ss-radius);
}

/* ── Page content ────────────────────────────────────── */
.main-area {
  background: var(--ss-light);
  min-width: 0;
}

.page-content {
  min-height: calc(100vh - 56px);
}

/* ── Collapse transition ─────────────────────────────── */
.collapse-enter-active,
.collapse-leave-active {
  transition: opacity 0.25s ease, max-height 0.25s ease;
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
</style>