<template>
  <div>
    <div v-if="loading" class="text-center py-5 text-muted">Loading...</div>
    <div v-else-if="error" class="alert alert-warning">
      {{ error }}
    </div>

    <div v-else-if="profile">
      <!-- Profile card -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h6 class="fw-semibold mb-3">My Profile</h6>
          <div class="row">
            <div class="col-md-6">
              <p class="text-muted small mb-1">Student Number (LRN)</p>
              <p class="fw-semibold">{{ profile.student_number }}</p>
            </div>
            <div class="col-md-6">
              <p class="text-muted small mb-1">Full Name</p>
              <p class="fw-semibold">{{ fullName(profile) }}</p>
            </div>
            <div class="col-md-6">
              <p class="text-muted small mb-1">Gender</p>
              <p class="text-capitalize">{{ profile.gender ?? '—' }}</p>
            </div>
            <div class="col-md-6">
              <p class="text-muted small mb-1">Date of Birth</p>
              <p>{{ formatDate(profile.date_of_birth) }}</p>
            </div>
            <div class="col-md-6">
              <p class="text-muted small mb-1">Email</p>
              <p>{{ profile.user?.email ?? '—' }}</p>
            </div>
            <div class="col-md-6">
              <p class="text-muted small mb-1">Account Status</p>
              <span :class="profile.user?.is_active ? 'badge bg-success' : 'badge bg-danger'">
                {{ profile.user?.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Active enrollment card -->
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <h6 class="fw-semibold mb-3">Current Enrollment</h6>
          <div v-if="!profile.active_enrollment" class="text-muted small">
            No active enrollment found.
          </div>
          <div v-else class="row">
            <div class="col-md-6">
              <p class="text-muted small mb-1">Grade Level</p>
              <p class="fw-semibold">
                {{ profile.active_enrollment.grade_level?.name ?? '—' }}
              </p>
            </div>
            <div class="col-md-6">
              <p class="text-muted small mb-1">Section</p>
              <p class="fw-semibold">
                {{ profile.active_enrollment.section?.name ?? '—' }}
              </p>
            </div>
            <div class="col-md-6">
              <p class="text-muted small mb-1">School Year</p>
              <p>{{ profile.active_enrollment.school_year }}</p>
            </div>
            <div class="col-md-6">
              <p class="text-muted small mb-1">Semester</p>
              <p>{{ profile.active_enrollment.semester }}</p>
            </div>
            <div class="col-md-6">
              <p class="text-muted small mb-1">Status</p>
              <span :class="enrollmentBadge(profile.active_enrollment.status)">
                {{ profile.active_enrollment.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { studentService } from '@/services/student'

const profile = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const res = await studentService.myProfile()
    profile.value = res.data
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = err.response.data?.message ?? 'Student profile not found.'
    } else {
      error.value = 'Failed to load profile.'
    }
  } finally {
    loading.value = false
  }
})

function fullName(student) {
  if (!student) return '—'
  return [student.first_name, student.middle_name, student.last_name, student.suffix]
    .filter(Boolean)
    .join(' ')
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function enrollmentBadge(status) {
  return {
    'badge bg-success': status === 'active',
    'badge bg-secondary': status === 'completed',
    'badge bg-danger': status === 'dropped',
  }
}
</script>
