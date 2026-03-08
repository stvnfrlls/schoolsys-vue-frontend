<template>
  <div>
    <h5 class="fw-bold mb-4">My Grades</h5>

    <!-- Quarter filter -->
    <div class="d-flex align-items-center gap-2 mb-4">
      <span class="small text-muted">Quarter:</span>
      <div class="d-flex gap-1">
        <button
          v-for="q in [1, 2, 3, 4]"
          :key="q"
          class="btn btn-sm"
          :class="filterQuarter === q ? 'btn-primary' : 'btn-outline-secondary'"
          @click="filterQuarter = q; fetchGrades()">
          Q{{ q }}
        </button>
        <button
          class="btn btn-sm"
          :class="filterQuarter === null ? 'btn-primary' : 'btn-outline-secondary'"
          @click="filterQuarter = null; fetchGrades()">
          All
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5 text-muted">Loading...</div>
    <div v-else-if="error" class="text-center py-5 text-danger">{{ error }}</div>

    <div v-else>
      <div v-if="grades.length === 0" class="text-center text-muted py-5">
        No grades found.
      </div>

      <!-- One card per subject -->
      <div
        v-for="item in grades"
        :key="item.subject.id"
        class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white d-flex align-items-center justify-content-between py-3">
          <div>
            <span class="fw-semibold">{{ item.subject.name }}</span>
            <span class="badge bg-secondary ms-2">{{ item.subject.code }}</span>
          </div>
          <!-- Show final grade if only one quarter selected -->
          <div v-if="filterQuarter !== null && finalGradeFor(item) !== null">
            <span
              class="fw-bold"
              :class="isFailing(item) ? 'text-danger' : 'text-success'">
              {{ finalGradeFor(item) }}
            </span>
            <span class="ms-1">
              <span v-if="isFailing(item)" class="badge bg-danger">Failing</span>
              <span v-else class="badge bg-success">Passing</span>
            </span>
          </div>
        </div>
        <div class="card-body p-0">
          <table class="table table-hover table-sm mb-0">
            <thead class="table-light">
              <tr>
                <th>Component</th>
                <th class="text-center">Quarter</th>
                <th class="text-center">Score</th>
                <th class="text-center">Weighted Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="grade in item.grades" :key="grade.id">
                <td>{{ grade.grading_component?.name ?? '—' }}</td>
                <td class="text-center">Q{{ grade.quarter }}</td>
                <td class="text-center">{{ grade.score }}</td>
                <td class="text-center">{{ grade.weighted_score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { studentService } from '@/services/student'

const grades = ref([])
const loading = ref(false)
const error = ref('')
const filterQuarter = ref(null)

onMounted(fetchGrades)

async function fetchGrades() {
  loading.value = true
  error.value = ''
  try {
    const res = await studentService.myGrades({
      quarter: filterQuarter.value ?? undefined,
    })
    grades.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message ?? 'Failed to load grades.'
  } finally {
    loading.value = false
  }
}

function finalGradeFor(item) {
  const any = item.grades.find((g) => g.final_grade !== null)
  return any?.final_grade ?? null
}

function isFailing(item) {
  const any = item.grades.find((g) => g.is_failing !== undefined)
  return any?.is_failing ?? false
}
</script>
