<template>
  <div>
    <h5 class="fw-bold mb-4">Attendance</h5>

    <div class="row g-2 mb-3">
      <div class="col-sm-3">
        <select v-model="filterSectionId" class="form-select form-select-sm" @change="onSectionChange">
          <option value="">Select Section</option>
          <option v-for="s in mySections" :key="s.id" :value="s.id">
            {{ s.grade_level?.name }} — {{ s.name }}
          </option>
        </select>
      </div>
      <div class="col-sm-3">
        <select v-model="filterSubjectId" class="form-select form-select-sm" :disabled="!filterSectionId">
          <option value="">Daily (no subject)</option>
          <option v-for="s in subjectsForSection" :key="s.id" :value="s.id">
            {{ s.name }}
          </option>
        </select>
      </div>
      <div class="col-sm-2">
        <input v-model="filterDate" type="date" class="form-control form-control-sm" />
      </div>
      <div class="col-sm-auto">
        <button class="btn btn-sm btn-outline-secondary" :disabled="!filterSectionId || !filterDate" @click="loadSheet">
          Load
        </button>
      </div>
    </div>

    <div v-if="!sheetLoaded" class="text-center text-muted py-5">
      Select a section and date, then click Load.
    </div>

    <div v-else>
      <div v-if="sheetLoading" class="text-center py-5 text-muted">Loading...</div>
      <div v-else-if="sheetError" class="text-center py-5 text-danger">{{ sheetError }}</div>

      <div v-else>
        <div class="d-flex align-items-center gap-2 mb-3">
          <span class="small text-muted">Mark all as:</span>
          <button class="btn btn-sm btn-outline-success" @click="markAll('present')">Present</button>
          <button class="btn btn-sm btn-outline-danger" @click="markAll('absent')">Absent</button>
          <button class="btn btn-sm btn-outline-warning" @click="markAll('late')">Late</button>
          <div class="ms-auto small text-muted">
            {{ attendanceSheet.length }} student(s) ·
            <span class="text-success">{{ statusCount('present') }} present</span> ·
            <span class="text-danger">{{ statusCount('absent') }} absent</span> ·
            <span class="text-warning">{{ statusCount('late') }} late</span>
          </div>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Student</th>
                  <th>LRN</th>
                  <th>Status</th>
                  <th>Remarks <span class="text-muted fw-normal small">(optional)</span></th>
                  <th class="text-center">Save</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in attendanceSheet" :key="row.enrollment.id" :class="rowClass(row.status)">
                  <td>{{ fullName(row.enrollment.student) }}</td>
                  <td class="text-muted small">{{ row.enrollment.student?.student_number ?? '—' }}</td>
                  <td>
                    <div class="d-flex gap-1">
                      <button v-for="s in statuses" :key="s.value" class="btn btn-sm" :class="row.status === s.value
                          ? (row.attendanceId ? s.activeClass : s.outlineClass)
                          : 'btn-outline-secondary'
                        " @click="row.status = s.value">
                        {{ s.label }}
                      </button>
                    </div>
                  </td>
                  <td>
                    <input v-model="row.remarks" type="text" class="form-control form-control-sm"
                      placeholder="e.g. Sick leave" style="max-width: 200px" />
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-primary" :disabled="savingRow === row.enrollment.id"
                      @click="saveRow(row)">
                      <span v-if="savingRow === row.enrollment.id" class="spinner-border spinner-border-sm"></span>
                      <span v-else>Save</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="attendanceSheet.length === 0">
                  <td colspan="5" class="text-center text-muted py-4">
                    No enrolled students found for this section.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="d-flex justify-content-end mt-3" v-if="attendanceSheet.length > 0">
          <button class="btn btn-primary btn-sm" :disabled="savingAll" @click="saveAll">
            <span v-if="savingAll" class="spinner-border spinner-border-sm me-1"></span>
            Save All
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { teacherService } from '@/services/teacher'
import { attendanceService } from '@/services/attendance'
import { enrollmentService } from '@/services/enrollment'

const schedules = ref([])
const filterSectionId = ref('')
const filterSubjectId = ref('')
const filterDate = ref(todayDate())
const attendanceSheet = ref([])
const sheetLoaded = ref(false)
const sheetLoading = ref(false)
const sheetError = ref('')
const savingRow = ref(null)
const savingAll = ref(false)

const statuses = [
  { value: 'present', label: 'Present', activeClass: 'btn-success', outlineClass: 'btn-outline-success' },
  { value: 'absent', label: 'Absent', activeClass: 'btn-danger', outlineClass: 'btn-outline-danger' },
  { value: 'late', label: 'Late', activeClass: 'btn-warning text-dark', outlineClass: 'btn-outline-warning' },
]

const mySections = computed(() => {
  const seen = new Set()
  const result = []
  schedules.value.forEach((s) => {
    if (s.section && !seen.has(s.section.id)) {
      seen.add(s.section.id)
      result.push(s.section)
    }
  })
  return result
})

const subjectsForSection = computed(() => {
  if (!filterSectionId.value) return []
  const seen = new Set()
  const result = []
  schedules.value
    .filter((s) => String(s.section.id) === String(filterSectionId.value))
    .forEach((s) => {
      if (s.subject && !seen.has(s.subject.id)) {
        seen.add(s.subject.id)
        result.push(s.subject)
      }
    })
  return result
})

onMounted(async () => {
  const res = await teacherService.mySchedule()
  schedules.value = res.data
})

function onSectionChange() {
  filterSubjectId.value = ''
  sheetLoaded.value = false
  attendanceSheet.value = []
}

async function loadSheet() {
  if (!filterSectionId.value || !filterDate.value) return
  sheetLoaded.value = true
  sheetLoading.value = true
  sheetError.value = ''
  try {
    const enrRes = await enrollmentService.getAll(1, {})
    const all = enrRes.data?.data ?? enrRes.data
    const enrollments = all.filter(
      (e) =>
        String(e.section?.id) === String(filterSectionId.value) &&
        e.status === 'active'
    )

    const filters = { date: filterDate.value }
    if (filterSubjectId.value) filters.subject_id = filterSubjectId.value
    const attRes = await attendanceService.getAll(filters)
    const existing = attRes.data

    attendanceSheet.value = enrollments.map((enrollment) => {
      const record = existing.find((a) => a.enrollment?.id === enrollment.id)
      return {
        enrollment,
        attendanceId: record?.id ?? null,
        status: record?.status ?? 'present',
        remarks: record?.remarks ?? '',
      }
    })
  } catch {
    sheetError.value = 'Failed to load attendance sheet.'
  } finally {
    sheetLoading.value = false
  }
}

function markAll(status) {
  attendanceSheet.value.forEach((row) => (row.status = status))
}

async function saveRow(row) {
  savingRow.value = row.enrollment.id
  try {
    const res = await attendanceService.save({
      enrollment_id: row.enrollment.id,
      subject_id: filterSubjectId.value || null,
      date: filterDate.value,
      status: row.status,
      remarks: row.remarks || null,
    })
    row.attendanceId = res.data.id
  } catch (err) {
    alert(err.response?.data?.message ?? 'Failed to save attendance.')
  } finally {
    savingRow.value = null
  }
}

async function saveAll() {
  savingAll.value = true
  try {
    await Promise.all(
      attendanceSheet.value.map(async (row) => {
        const res = await attendanceService.save({
          enrollment_id: row.enrollment.id,
          subject_id: filterSubjectId.value || null,
          date: filterDate.value,
          status: row.status,
          remarks: row.remarks || null,
        })
        row.attendanceId = res.data.id
      })
    )
  } catch (err) {
    alert(err.response?.data?.message ?? 'Failed to save some records.')
  } finally {
    savingAll.value = false
  }
}

function statusCount(status) {
  return attendanceSheet.value.filter((r) => r.status === status).length
}

function rowClass(status) {
  if (status === 'absent') return 'table-danger'
  if (status === 'late') return 'table-warning'
  return ''
}

function fullName(student) {
  if (!student) return '—'
  return [student.first_name, student.middle_name, student.last_name, student.suffix]
    .filter(Boolean)
    .join(' ')
}

function todayDate() {
  return new Date().toISOString().split('T')[0]
}
</script>
