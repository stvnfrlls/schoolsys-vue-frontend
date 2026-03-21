<template>
  <div>
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <h6 class="fw-semibold mb-1">Welcome back, {{ auth.user?.name }}</h6>
        <p class="text-muted small mb-0">Here's a summary of your teaching load.</p>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small mb-1">Subjects</div>
            <div class="fs-4 fw-bold">{{ loading ? '—' : subjectCount }}</div>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small mb-1">Sections</div>
            <div class="fs-4 fw-bold">{{ loading ? '—' : sectionCount }}</div>
          </div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-muted small mb-1">Classes Today</div>
            <div class="fs-4 fw-bold">{{ loading ? '—' : todayCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm mt-4" v-if="todaySchedules.length > 0">
      <div class="card-body">
        <h6 class="fw-semibold mb-3">Today's Classes</h6>
        <div v-for="s in todaySchedules" :key="s.id"
          class="d-flex align-items-center justify-content-between border rounded px-3 py-2 mb-2">
          <div>
            <div class="fw-semibold small">{{ s.subject?.name }}</div>
            <div class="text-muted small">
              {{ s.section?.name }} · {{ formatTime(s.start_time) }} – {{ formatTime(s.end_time) }}
            </div>
          </div>
          <span class="badge bg-light text-dark border text-capitalize">{{ s.day }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { teacherService } from '@/services/teacher'

const auth = useAuthStore()
const loading = ref(true)
const schedules = ref([])
const subjects = ref([])

const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const todayName = days[new Date().getDay()]

const subjectCount = computed(() => subjects.value.length)
const sectionCount = computed(() =>
  subjects.value.reduce((sum, s) => sum + (s.sections?.length ?? 0), 0)
)
const todaySchedules = computed(() =>
  schedules.value.filter((s) => s.day === todayName)
)
const todayCount = computed(() => todaySchedules.value.length)

onMounted(async () => {
  try {
    const [schedRes, subRes] = await Promise.all([
      teacherService.mySchedule(),
      teacherService.mySubjects(),
    ])
    schedules.value = schedRes.data
    subjects.value = subRes.data
  } finally {
    loading.value = false
  }
})

function formatTime(time) {
  if (!time) return '—'
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}
</script>
