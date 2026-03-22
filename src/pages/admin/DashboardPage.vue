<template>
  <div class="dashboard">

    <!-- ── Skeleton ─────────────────────────────────────── -->
    <div v-if="loading">
      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-lg-3" v-for="n in 4" :key="n">
          <div class="dash-card h-100">
            <div class="skel mb-2" style="width: 110px; height: 12px"></div>
            <div class="skel mb-2" style="width: 60px; height: 30px"></div>
            <div class="skel" style="width: 80px; height: 12px"></div>
          </div>
        </div>
      </div>
      <div class="row g-3 mb-4">
        <div class="col-lg-8">
          <div class="dash-card" style="height: 280px">
            <div class="skel mb-2" style="width: 160px; height: 14px"></div>
            <div class="skel mt-3" style="width: 100%; height: 200px"></div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="dash-card" style="height: 280px">
            <div class="skel mb-2" style="width: 140px; height: 14px"></div>
            <div class="skel mt-3" style="width: 100%; height: 200px; border-radius: 50%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Content ──────────────────────────────────────── -->
    <div v-else>

      <!-- Welcome row -->
      <div class="welcome-bar mb-4">
        <div>
          <div class="welcome-heading">Welcome back, {{ auth.user?.name }}</div>
          <div class="welcome-sub">{{ currentSchoolYear() }} · Admin Dashboard</div>
        </div>
        <div class="quarter-selector">
          <span class="quarter-label">Active Quarter</span>
          <div class="quarter-tabs">
            <button v-for="q in 4" :key="q" class="q-tab" :class="{ active: String(currentQuarter) === String(q) }"
              :disabled="updatingQuarter" :value="q" @click="updateQuarter">{{ quarterLabels[q] }}</button>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert-soft-warning mb-4">{{ error }}</div>

      <!-- Stat cards -->
      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-lg-3" v-for="card in statCards" :key="card.label">
          <div class="dash-card stat-card h-100">
            <div class="stat-icon-wrap" :style="{ background: card.iconBg }">
              <i :class="['bi', card.icon]" :style="{ color: card.iconColor }"></i>
            </div>
            <div class="stat-value">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
            <div v-if="card.sub" class="stat-sub">{{ card.sub }}</div>
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="row g-3 mb-4">

        <!-- Enrollment by grade (bar chart) -->
        <div class="col-lg-8">
          <div class="dash-card h-100">
            <div class="card-header-row mb-4">
              <div>
                <div class="card-title">Enrollment by Grade Level</div>
                <div class="card-sub">Current school year — dummy data for reference</div>
              </div>
              <span class="data-badge">SY {{ currentSchoolYear() }}</span>
            </div>
            <div class="bar-chart">
              <div v-for="bar in enrollmentData" :key="bar.label" class="bar-col">
                <div class="bar-value">{{ bar.value }}</div>
                <div class="bar-fill" :style="{ height: barHeight(bar.value) + '%' }"></div>
                <div class="bar-label">{{ bar.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Attendance donut -->
        <div class="col-lg-4">
          <div class="dash-card h-100">
            <div class="card-header-row mb-4">
              <div>
                <div class="card-title">Attendance Rate</div>
                <div class="card-sub">Quarter {{ currentQuarter }} — dummy data</div>
              </div>
            </div>
            <div class="donut-wrap">
              <svg viewBox="0 0 120 120" class="donut-svg">
                <circle cx="60" cy="60" r="48" fill="none" stroke="var(--ss-border)" stroke-width="14" />
                <!-- Present: 87% -->
                <circle cx="60" cy="60" r="48" fill="none" stroke="var(--ss-accent)" stroke-width="14"
                  stroke-dasharray="261.9 301.6" stroke-dashoffset="75.4" stroke-linecap="round"
                  transform="rotate(-90 60 60)" />
                <!-- Late: 5% -->
                <circle cx="60" cy="60" r="48" fill="none" stroke="#f59e0b" stroke-width="14"
                  stroke-dasharray="15.1 301.6" stroke-dashoffset="-186.5" stroke-linecap="round"
                  transform="rotate(-90 60 60)" />
                <!-- Absent: 8% -->
                <circle cx="60" cy="60" r="48" fill="none" stroke="var(--ss-danger)" stroke-width="14"
                  stroke-dasharray="24.1 301.6" stroke-dashoffset="-201.6" stroke-linecap="round"
                  transform="rotate(-90 60 60)" />
                <text x="60" y="56" text-anchor="middle" class="donut-pct">87%</text>
                <text x="60" y="68" text-anchor="middle" class="donut-lbl">Present</text>
              </svg>
            </div>
            <div class="donut-legend">
              <div class="legend-item">
                <span class="legend-dot" style="background: var(--ss-accent)"></span>
                <span>Present <strong>87%</strong></span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: #f59e0b"></span>
                <span>Late <strong>5%</strong></span>
              </div>
              <div class="legend-item">
                <span class="legend-dot" style="background: var(--ss-danger)"></span>
                <span>Absent <strong>8%</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick links -->
      <div class="row g-3">
        <div class="col-12">
          <div class="dash-card">
            <div class="card-title mb-3">Quick Actions</div>
            <div class="quick-links">
              <RouterLink v-for="link in quickLinks" :key="link.to" :to="link.to" class="quick-link">
                <i :class="['bi', link.icon]"></i>
                <span>{{ link.label }}</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { studentService } from '@/services/student'
import { sectionService } from '@/services/grade'
import { subjectService } from '@/services/subject'
import { userService } from '@/services/user'
import { gradingQuarterService } from '@/services/grading'

const auth = useAuthStore()
const loading = ref(true)
const error = ref('')

const totalStudents = ref(null)
const totalTeachers = ref(null)
const totalSections = ref(null)
const totalSubjects = ref(null)
const currentQuarter = ref(null)
const updatingQuarter = ref(false)

const quarterLabels = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' }

const statCards = computed(() => [
  {
    label: 'Total Students',
    value: totalStudents.value ?? '—',
    icon: 'bi-people-fill',
    iconBg: 'var(--ss-accent-light)',
    iconColor: 'var(--ss-accent)',
  },
  {
    label: 'Faculty Members',
    value: totalTeachers.value ?? '—',
    sub: 'Active teachers',
    icon: 'bi-person-workspace',
    iconBg: '#f0fdf4',
    iconColor: 'var(--ss-success)',
  },
  {
    label: 'Sections',
    value: totalSections.value ?? '—',
    icon: 'bi-grid-3x3-gap-fill',
    iconBg: '#fff7ed',
    iconColor: '#ea580c',
  },
  {
    label: 'Subjects',
    value: totalSubjects.value ?? '—',
    icon: 'bi-book-fill',
    iconBg: '#fdf4ff',
    iconColor: '#9333ea',
  },
])

// Dummy enrollment data for chart
const enrollmentData = [
  { label: 'Gr. 7', value: 145 },
  { label: 'Gr. 8', value: 132 },
  { label: 'Gr. 9', value: 128 },
  { label: 'Gr. 10', value: 119 },
  { label: 'Gr. 11', value: 98 },
  { label: 'Gr. 12', value: 87 },
]

const maxEnrollment = Math.max(...enrollmentData.map(d => d.value))

function barHeight(value) {
  return Math.round((value / maxEnrollment) * 100)
}

const quickLinks = [
  { to: '/admin/students', icon: 'bi-person-plus', label: 'Add Student' },
  { to: '/admin/enrollments', icon: 'bi-clipboard-plus', label: 'Enroll Student' },
  { to: '/admin/scheduling', icon: 'bi-calendar-plus', label: 'Set Schedule' },
  { to: '/admin/users', icon: 'bi-person-gear', label: 'Manage Users' },
  { to: '/admin/grades-sections', icon: 'bi-diagram-3', label: 'Grade & Sections' },
  { to: '/admin/attendance', icon: 'bi-check2-square', label: 'View Attendance' },
]

onMounted(async () => {
  try {
    const [studentsRes, usersRes, sectionsRes, subjectsRes, quarterRes] =
      await Promise.allSettled([
        studentService.getAll(1),
        userService.getAll(1),
        sectionService.getAll(),
        subjectService.getAll(1),
        gradingQuarterService.getQuarter(),
      ])

    if (studentsRes.status === 'fulfilled')
      totalStudents.value = studentsRes.value.data.meta.total

    if (usersRes.status === 'fulfilled') {
      const users = usersRes.value.data.data ?? []
      totalTeachers.value = users.filter(u =>
        u.roles?.some(r => (typeof r === 'string' ? r : r.name) === 'faculty')
      ).length
    }

    if (sectionsRes.status === 'fulfilled')
      totalSections.value = sectionsRes.value.data.length

    if (subjectsRes.status === 'fulfilled')
      totalSubjects.value = subjectsRes.value.data.meta.total

    if (quarterRes.status === 'fulfilled')
      currentQuarter.value = quarterRes.value.data.current_quarter

  } catch {
    error.value = 'Some stats could not be loaded.'
  } finally {
    loading.value = false
  }
})

function currentSchoolYear() {
  const now = new Date()
  const year = now.getFullYear()
  const start = now.getMonth() >= 7 ? year : year - 1
  return `${start}-${start + 1}`
}

async function updateQuarter(event) {
  if (updatingQuarter.value) return
  const quarterValue = String(event.target.value)
  if (!Object.keys(quarterLabels).includes(quarterValue)) return
  updatingQuarter.value = true
  currentQuarter.value = quarterValue
  try {
    await gradingQuarterService.updateQuarter({ current_quarter: quarterValue })
  } catch (e) {
    console.error(e)
  } finally {
    updatingQuarter.value = false
  }
}
</script>

<style scoped>
/* ── Base ────────────────────────────────────────────── */
.dashboard {
  font-family: var(--ss-font-ui);
  color: var(--ss-text);
}

/* ── Card ────────────────────────────────────────────── */
.dash-card {
  background: var(--ss-white);
  border: 1px solid var(--ss-border);
  border-radius: var(--ss-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--ss-shadow-sm);
}

.card-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ss-text);
  letter-spacing: -0.01em;
}

.card-sub {
  font-size: 0.75rem;
  color: var(--ss-muted);
  margin-top: 0.15rem;
}

.data-badge {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--ss-accent-light);
  color: var(--ss-accent);
  border: 1px solid var(--ss-accent-border);
  padding: 0.25rem 0.65rem;
  border-radius: var(--ss-radius);
  white-space: nowrap;
}

/* ── Welcome bar ─────────────────────────────────────── */
.welcome-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.welcome-heading {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--ss-text);
  letter-spacing: -0.01em;
}

.welcome-sub {
  font-size: 0.8rem;
  color: var(--ss-muted);
  margin-top: 0.15rem;
}

/* ── Quarter selector ────────────────────────────────── */
.quarter-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.quarter-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ss-muted);
  white-space: nowrap;
}

.quarter-tabs {
  display: flex;
  gap: 0.25rem;
  background: var(--ss-light);
  border: 1px solid var(--ss-border);
  border-radius: var(--ss-radius);
  padding: 3px;
}

.q-tab {
  background: none;
  border: none;
  font-family: var(--ss-font-ui);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--ss-muted);
  padding: 0.3rem 0.75rem;
  border-radius: 3px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.q-tab:hover:not(:disabled) {
  background: var(--ss-white);
  color: var(--ss-text);
}

.q-tab.active {
  background: var(--ss-white);
  color: var(--ss-accent);
  font-weight: 600;
  box-shadow: var(--ss-shadow-sm);
}

.q-tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Stat cards ──────────────────────────────────────── */
.stat-card {
  display: flex;
  flex-direction: column;
}

.stat-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--ss-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.stat-value {
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--ss-text);
  line-height: 1;
  letter-spacing: -0.03em;
  margin-bottom: 0.35rem;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--ss-muted);
}

.stat-sub {
  font-size: 0.72rem;
  color: var(--ss-subtle);
  margin-top: 0.2rem;
}

/* ── Bar chart ───────────────────────────────────────── */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  height: 180px;
  padding-top: 1.5rem;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.bar-value {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--ss-muted);
  margin-bottom: 0.3rem;
}

.bar-fill {
  width: 100%;
  max-width: 40px;
  background: var(--ss-accent);
  border-radius: 3px 3px 0 0;
  transition: height 0.4s ease;
  opacity: 0.85;
}

.bar-fill:hover {
  opacity: 1;
}

.bar-label {
  font-size: 0.72rem;
  color: var(--ss-muted);
  margin-top: 0.4rem;
  white-space: nowrap;
}

/* ── Donut chart ─────────────────────────────────────── */
.donut-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.donut-svg {
  width: 140px;
  height: 140px;
}

.donut-pct {
  font-family: var(--ss-font-ui);
  font-size: 20px;
  font-weight: 700;
  fill: var(--ss-text);
}

.donut-lbl {
  font-family: var(--ss-font-ui);
  font-size: 9px;
  fill: var(--ss-muted);
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--ss-muted);
}

.legend-item strong {
  color: var(--ss-text);
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Quick links ─────────────────────────────────────── */
.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--ss-accent);
  background: var(--ss-accent-light);
  border: 1px solid var(--ss-accent-border);
  border-radius: var(--ss-radius);
  padding: 0.45rem 0.9rem;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.quick-link:hover {
  background: var(--ss-accent);
  color: var(--ss-white);
  border-color: var(--ss-accent);
}

/* ── Alert soft ──────────────────────────────────────── */
.alert-soft-warning {
  background: var(--ss-warning-light);
  border: 1px solid #fde68a;
  color: var(--ss-warning);
  border-radius: var(--ss-radius);
  padding: 0.6rem 1rem;
  font-size: 0.82rem;
}

/* ── Skeleton ────────────────────────────────────────── */
@keyframes shimmer {
  0% {
    background-position: -600px 0;
  }

  100% {
    background-position: 600px 0;
  }
}

.skel {
  border-radius: var(--ss-radius);
  background: linear-gradient(90deg, var(--ss-border) 25%, var(--ss-light) 50%, var(--ss-border) 75%);
  background-size: 600px 100%;
  animation: shimmer 1.4s infinite linear;
}
</style>