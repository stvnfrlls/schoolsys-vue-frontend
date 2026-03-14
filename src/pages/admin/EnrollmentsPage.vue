<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="fw-bold mb-0">Enrollments</h5>
      <button class="btn btn-primary btn-sm" @click="openCreate">
        + Enroll Student
      </button>
    </div>

    <!-- Filters -->
    <div class="row g-2 mb-3">
      <div class="col-sm-4">
        <select v-model="filterGradeId" class="form-select form-select-sm">
          <option value="">All Grade Levels</option>
          <option v-for="g in gradeLevels" :key="g.id" :value="g.id">
            {{ g.name }}
          </option>
        </select>
      </div>
      <div class="col-sm-4">
        <select v-model="filterStatus" class="form-select form-select-sm">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="dropped">Dropped</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>

    <!-- ── Skeleton loading ───────────────────────────────────────────────── -->
    <div v-if="loading">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr>
                <!-- # -->
                <th style="width: 40px">
                  <div
                    class="skeleton"
                    style="width: 14px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- Student -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 52px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- LRN -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 32px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- Grade Level -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 72px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- Section -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 52px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- School Year -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 68px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- Semester -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 56px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- Status -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 44px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- Actions -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 52px; height: 14px; border-radius: 3px"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in 8" :key="r">
                <!-- # -->
                <td>
                  <div
                    class="skeleton"
                    style="width: 22px; height: 13px; border-radius: 3px"></div>
                </td>
                <!-- Student full name -->
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${100 + ((r * 23) % 60)}px;height:14px;border-radius:3px`"></div>
                </td>
                <!-- LRN e.g. "STU-0012" -->
                <td>
                  <div
                    class="skeleton"
                    style="width: 66px; height: 13px; border-radius: 3px"></div>
                </td>
                <!-- Grade Level e.g. "Grade 7" -->
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${52 + ((r * 9) % 24)}px;height:14px;border-radius:3px`"></div>
                </td>
                <!-- Section e.g. "Section A" -->
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${56 + ((r * 11) % 28)}px;height:14px;border-radius:3px`"></div>
                </td>
                <!-- School Year e.g. "2024-2025" -->
                <td>
                  <div
                    class="skeleton"
                    style="width: 68px; height: 13px; border-radius: 3px"></div>
                </td>
                <!-- Semester e.g. "1st" -->
                <td>
                  <div
                    class="skeleton"
                    style="width: 28px; height: 13px; border-radius: 3px"></div>
                </td>
                <!-- Status badge -->
                <td>
                  <div
                    class="skeleton"
                    style="
                      width: 58px;
                      height: 20px;
                      border-radius: 12px;
                    "></div>
                </td>
                <!-- Actions: Edit + Delete -->
                <td>
                  <div class="d-flex gap-1">
                    <div
                      class="skeleton"
                      style="
                        width: 38px;
                        height: 26px;
                        border-radius: 4px;
                      "></div>
                    <div
                      class="skeleton"
                      style="
                        width: 46px;
                        height: 26px;
                        border-radius: 4px;
                      "></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else>
      <!-- Table -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div v-if="error" class="text-center py-5 text-danger">
            {{ error }}
          </div>
          <table v-else class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>LRN</th>
                <th>Grade Level</th>
                <th>Section</th>
                <th>School Year</th>
                <th>Semester</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="enrollment in filteredEnrollments"
                :key="enrollment.id">
                <td class="text-muted small">{{ enrollment.id }}</td>
                <td>{{ fullName(enrollment.student) }}</td>
                <td class="text-muted small">
                  {{ enrollment.student.student_number }}
                </td>
                <td>{{ enrollment.grade_level.name }}</td>
                <td>{{ enrollment.section.name }}</td>
                <td>{{ enrollment.school_year }}</td>
                <td>{{ enrollment.semester }}</td>
                <td>
                  <span :class="statusBadge(enrollment.status)">
                    {{ enrollment.status }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="openEdit(enrollment)">
                    Edit
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(enrollment)">
                    Delete
                  </button>
                </td>
              </tr>
              <tr v-if="filteredEnrollments.length === 0">
                <td colspan="9" class="text-center text-muted py-5">
                  No enrollments found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      class="d-flex justify-content-between align-items-center mt-3 small text-muted"
      v-if="pagination.last_page > 1">
      <span
        >Showing {{ pagination.from }}–{{ pagination.to }} of
        {{ pagination.total }}</span
      >
      <div class="d-flex gap-1">
        <button
          class="btn btn-sm btn-outline-secondary"
          :disabled="pagination.current_page === 1"
          @click="fetchEnrollments(pagination.current_page - 1)">
          Prev
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          :disabled="pagination.current_page === pagination.last_page"
          @click="fetchEnrollments(pagination.current_page + 1)">
          Next
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="enrollmentModal" tabindex="-1" ref="modalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">
              {{ isEditing ? "Edit Enrollment" : "Enroll Student" }}
            </h6>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2 small">
              {{ formError }}
            </div>

            <div class="mb-3" v-if="!isEditing">
              <label class="form-label">Student</label>
              <select v-model="form.student_id" class="form-select">
                <option disabled value="">Select student</option>
                <option
                  v-for="s in availableStudents"
                  :key="s.id"
                  :value="s.id">
                  {{ fullName(s) }} — {{ s.student_number }}
                </option>
              </select>
              <div
                v-if="availableStudents.length === 0"
                class="form-text text-muted">
                All students are currently enrolled.
              </div>
            </div>

            <div class="mb-3" v-if="!isEditing">
              <label class="form-label">Grade Level</label>
              <select
                v-model="form.grade_level_id"
                class="form-select"
                @change="form.section_id = ''">
                <option disabled value="">Select grade level</option>
                <option v-for="g in gradeLevels" :key="g.id" :value="g.id">
                  {{ g.name }}
                </option>
              </select>
            </div>

            <div class="mb-3" v-if="!isEditing">
              <label class="form-label">Section</label>
              <select
                v-model="form.section_id"
                class="form-select"
                :disabled="!form.grade_level_id">
                <option disabled value="">Select section</option>
                <option v-for="s in filteredSections" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">School Year</label>
              <input
                v-model="form.school_year"
                type="text"
                class="form-control"
                placeholder="e.g. 2025-2026" />
            </div>

            <div class="mb-3">
              <label class="form-label">Semester</label>
              <select v-model="form.semester" class="form-select">
                <option disabled value="">Select semester</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="Summer">Summer</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-select">
                <option value="active">Active</option>
                <option value="dropped">Dropped</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeModal">
              Cancel
            </button>
            <button
              class="btn btn-primary btn-sm"
              :disabled="saving"
              @click="saveEnrollment">
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? "Update" : "Enroll" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div
      class="modal fade"
      id="deleteEnrollmentModal"
      tabindex="-1"
      ref="deleteModalEl">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <p class="mb-1 fw-semibold">Delete enrollment?</p>
            <p class="text-muted small mb-3">
              {{ fullName(selectedEnrollment?.student) }}
            </p>
            <button
              class="btn btn-danger btn-sm me-2"
              :disabled="saving"
              @click="deleteEnrollment">
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-1"></span>
              Delete
            </button>
            <button class="btn btn-secondary btn-sm" @click="closeDeleteModal">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Modal } from "bootstrap";
import { enrollmentService } from "@/services/enrollment";
import { gradeLevelService, sectionService } from "@/services/grade";
import { studentService } from "@/services/student";

const enrollments = ref([]);
const students = ref([]);
const gradeLevels = ref([]);
const sections = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const formError = ref("");
const isEditing = ref(false);
const selectedEnrollment = ref(null);
const pagination = ref({});
const filterGradeId = ref("");
const filterStatus = ref("");

const form = ref({
  student_id: "",
  grade_level_id: "",
  section_id: "",
  school_year: "",
  semester: "",
  status: "active",
});

const modalEl = ref(null);
const deleteModalEl = ref(null);
let modalInstance = null;
let deleteModalInstance = null;

onMounted(async () => {
  modalInstance = new Modal(modalEl.value);
  deleteModalInstance = new Modal(deleteModalEl.value);
  await Promise.all([
    fetchEnrollments(),
    fetchStudents(),
    fetchGradeLevels(),
    fetchSections(),
  ]);
});

const activelyEnrolledStudentIds = computed(
  () =>
    new Set(
      enrollments.value
        .filter((e) => e.status === "active")
        .map((e) => e.student_id),
    ),
);

const availableStudents = computed(() =>
  students.value.filter((s) => !activelyEnrolledStudentIds.value.has(s.id)),
);

const filteredEnrollments = computed(() => {
  return enrollments.value.filter((e) => {
    const gradeMatch =
      !filterGradeId.value || e.grade_level_id == filterGradeId.value;
    const statusMatch = !filterStatus.value || e.status === filterStatus.value;
    return gradeMatch && statusMatch;
  });
});

const filteredSections = computed(() => {
  if (!form.value.grade_level_id) return [];
  return sections.value.filter(
    (s) => s.grade_level_id === form.value.grade_level_id,
  );
});

async function fetchEnrollments(page = 1) {
  loading.value = true;
  error.value = "";
  try {
    const res = await enrollmentService.getAll(page);
    enrollments.value = res.data.data;
    pagination.value = {
      current_page: res.data.current_page,
      last_page: res.data.last_page,
      from: res.data.from,
      to: res.data.to,
      total: res.data.total,
    };
  } catch {
    error.value = "Failed to load enrollments.";
  } finally {
    loading.value = false;
  }
}

async function fetchStudents() {
  const res = await studentService.getAll();
  students.value = res.data.data;
}

async function fetchGradeLevels() {
  const res = await gradeLevelService.getAll();
  gradeLevels.value = res.data;
}

async function fetchSections() {
  const res = await sectionService.getAll();
  sections.value = res.data;
}

function fullName(student) {
  if (!student) return "—";
  return [
    student.first_name,
    student.middle_name,
    student.last_name,
    student.suffix,
  ]
    .filter(Boolean)
    .join(" ");
}

function statusBadge(status) {
  return {
    "badge bg-success": status === "active",
    "badge bg-secondary": status === "completed",
    "badge bg-danger": status === "dropped",
  };
}

function currentSchoolYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startYear = month >= 6 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

function openCreate() {
  isEditing.value = false;
  form.value = {
    student_id: "",
    grade_level_id: "",
    section_id: "",
    school_year: currentSchoolYear(),
    semester: "",
    status: "active",
  };
  formError.value = "";
  modalInstance.show();
}

function openEdit(enrollment) {
  isEditing.value = true;
  selectedEnrollment.value = enrollment;
  form.value = {
    student_id: enrollment.student_id,
    grade_level_id: enrollment.grade_level_id,
    section_id: enrollment.section_id,
    school_year: enrollment.school_year,
    semester: enrollment.semester,
    status: enrollment.status,
  };
  formError.value = "";
  modalInstance.show();
}

function closeModal() {
  modalInstance.hide();
}

async function saveEnrollment() {
  formError.value = "";
  if (!isEditing.value && (!form.value.student_id || !form.value.section_id)) {
    formError.value = "Student and section are required.";
    return;
  }
  if (!form.value.school_year || !form.value.semester) {
    formError.value = "School year and semester are required.";
    return;
  }
  saving.value = true;
  try {
    if (isEditing.value) {
      await enrollmentService.update(selectedEnrollment.value.id, {
        school_year: form.value.school_year,
        semester: form.value.semester,
        status: form.value.status,
      });
    } else {
      await enrollmentService.create({
        student_id: form.value.student_id,
        section_id: form.value.section_id,
        grade_level_id: form.value.grade_level_id,
        school_year: form.value.school_year,
        semester: form.value.semester,
        status: form.value.status,
      });
    }
    closeModal();
    await fetchEnrollments(pagination.value.current_page);
  } catch (err) {
    formError.value = err.response?.data?.message ?? "Something went wrong.";
  } finally {
    saving.value = false;
  }
}

function confirmDelete(enrollment) {
  selectedEnrollment.value = enrollment;
  deleteModalInstance.show();
}

function closeDeleteModal() {
  deleteModalInstance.hide();
}

async function deleteEnrollment() {
  saving.value = true;
  try {
    await enrollmentService.delete(selectedEnrollment.value.id);
    closeDeleteModal();
    await fetchEnrollments(pagination.value.current_page);
  } catch (err) {
    alert(err.response?.data?.message ?? "Failed to delete enrollment.");
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -600px 0;
  }
  100% {
    background-position: 600px 0;
  }
}
.skeleton {
  background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
  background-size: 600px 100%;
  animation: shimmer 1.4s infinite linear;
}
</style>
