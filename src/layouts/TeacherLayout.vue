<template>
  <div class="d-flex min-vh-100 teacher-layout">
    <!-- Sidebar -->
    <nav class="sidebar d-flex flex-column p-3">
      <div class="sidebar-brand mb-4">
        <span class="brand-name">SchoolSys</span>
        <span class="brand-sub">Faculty Portal</span>
      </div>

      <ul class="nav nav-pills flex-column gap-1">
        <li class="nav-item">
          <RouterLink to="/teacher/dashboard" class="sidebar-link">
            <i class="bi bi-speedometer2 me-2"></i>Dashboard
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/teacher/schedule" class="sidebar-link">
            <i class="bi bi-calendar-week me-2"></i>My Schedule
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/teacher/subjects" class="sidebar-link">
            <i class="bi bi-book me-2"></i>My Subjects
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/teacher/attendance" class="sidebar-link">
            <i class="bi bi-check-circle me-2"></i>Attendance
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/teacher/assignment" class="sidebar-link">
            <i class="bi bi-journal-text me-2"></i>Assignment
          </RouterLink>
        </li>
      </ul>

      <div class="sidebar-footer mt-auto pt-3">
        <div class="sidebar-user-name">{{ auth.user?.name }}</div>
        <button class="sidebar-logout w-100" @click="handleLogout">Sign Out</button>
      </div>
    </nav>

    <!-- Main content -->
    <div class="flex-grow-1 main-area">
      <header class="topbar d-flex align-items-center justify-content-between px-4">
        <h6 class="topbar-title mb-0">{{ pageTitle }}</h6>
        <span class="role-badge">Faculty</span>
      </header>

      <main class="page-content p-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const pageTitle = computed(() => route.name ?? 'Dashboard')

async function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────── */
.teacher-layout {
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
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.07);
  color: var(--ss-white);
}

.sidebar-link.router-link-active {
  background: rgba(37, 99, 235, 0.25);
  color: #93c5fd;
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
</style>