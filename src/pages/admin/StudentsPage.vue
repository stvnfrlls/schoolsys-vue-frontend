<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="fw-bold mb-0">Students</h5>
    </div>

    <!-- Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center py-5 text-muted">Loading...</div>
        <div v-else-if="error" class="text-center py-5 text-danger">
          {{ error }}
        </div>
        <table v-else class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>LRN</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Date of Birth</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td class="text-muted small">{{ student.student_number }}</td>
              <td>{{ fullName(student) }}</td>
              <td class="text-capitalize">{{ student.gender }}</td>
              <td>{{ formatDate(student.date_of_birth) }}</td>
              <td class="text-muted small">{{ student.user.email }}</td>
              <td>
                <span
                  :class="
                    student.user.is_active
                      ? 'badge bg-success'
                      : 'badge bg-danger'
                  ">
                  {{ student.user.is_active ? "Active" : "Inactive" }}
                </span>
              </td>
              <td>
                <button
                  class="btn btn-sm btn-outline-primary me-1"
                  @click="openEdit(student)">
                  Edit
                </button>
                <button
                  class="btn btn-sm btn-outline-secondary"
                  @click="openView(student)">
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
          @click="fetchStudents(pagination.current_page - 1)">
          Prev
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          :disabled="pagination.current_page === pagination.last_page"
          @click="fetchStudents(pagination.current_page + 1)">
          Next
        </button>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      class="modal fade"
      id="editStudentModal"
      tabindex="-1"
      ref="editModalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">Edit Student</h6>
            <button
              type="button"
              class="btn-close"
              @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2 small">
              {{ formError }}
            </div>
            <div class="row mb-3">
              <div class="col">
                <label class="form-label">First Name</label>
                <input
                  v-model="form.first_name"
                  type="text"
                  class="form-control" />
              </div>
              <div class="col">
                <label class="form-label">Last Name</label>
                <input
                  v-model="form.last_name"
                  type="text"
                  class="form-control" />
              </div>
            </div>
            <div class="row mb-3">
              <div class="col">
                <label class="form-label"
                  >Middle Name
                  <span class="text-muted small">(optional)</span></label
                >
                <input
                  v-model="form.middle_name"
                  type="text"
                  class="form-control" />
              </div>
              <div class="col">
                <label class="form-label"
                  >Suffix
                  <span class="text-muted small">(optional)</span></label
                >
                <input
                  v-model="form.suffix"
                  type="text"
                  class="form-control"
                  placeholder="e.g. Jr." />
              </div>
            </div>
            <div class="row mb-3">
              <div class="col">
                <label class="form-label">Date of Birth</label>
                <input
                  v-model="form.date_of_birth"
                  type="date"
                  class="form-control" />
              </div>
              <div class="col">
                <label class="form-label">Gender</label>
                <select v-model="form.gender" class="form-select">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeEditModal">
              Cancel
            </button>
            <button
              class="btn btn-primary btn-sm"
              :disabled="saving"
              @click="saveStudent">
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-1"></span>
              Update
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Modal -->
    <div
      class="modal fade"
      id="viewStudentModal"
      tabindex="-1"
      ref="viewModalEl">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">Student Profile</h6>
            <button
              type="button"
              class="btn-close"
              @click="closeViewModal"></button>
          </div>
          <div class="modal-body" v-if="viewStudent">
            <div class="row mb-3">
              <div class="col-md-6">
                <p class="text-muted small mb-1">Student Number</p>
                <p class="fw-semibold">{{ viewStudent.student_number }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Full Name</p>
                <p class="fw-semibold">{{ fullName(viewStudent) }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Gender</p>
                <p class="text-capitalize">{{ viewStudent.gender }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Date of Birth</p>
                <p>{{ formatDate(viewStudent.date_of_birth) }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Email</p>
                <p>{{ viewStudent.user.email }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Account Status</p>
                <span
                  :class="
                    viewStudent.user.is_active
                      ? 'badge bg-success'
                      : 'badge bg-danger'
                  ">
                  {{ viewStudent.user.is_active ? "Active" : "Inactive" }}
                </span>
              </div>
            </div>

            <hr />

            <p class="fw-semibold small mb-2">Enrollments</p>
            <div
              v-if="viewStudent.enrollments?.length === 0"
              class="text-muted small">
              No enrollment records found.
            </div>
            <table v-else class="table table-sm table-bordered">
              <thead class="table-light">
                <tr>
                  <th>School Year</th>
                  <th>Grade</th>
                  <th>Section</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="enrollment in viewStudent.enrollments"
                  :key="enrollment.id">
                  <td>{{ enrollment.school_year }}</td>
                  <td>{{ enrollment.section?.grade_level?.name ?? "—" }}</td>
                  <td>{{ enrollment.section?.name ?? "—" }}</td>
                  <td>{{ enrollment.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeViewModal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Modal } from "bootstrap";
import { studentService } from "@/services/student";

const students = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const formError = ref("");
const pagination = ref({});
const selectedStudent = ref(null);
const viewStudent = ref(null);

const form = ref({
  first_name: "",
  last_name: "",
  middle_name: "",
  suffix: "",
  date_of_birth: "",
  gender: "",
});

const editModalEl = ref(null);
const viewModalEl = ref(null);
let editModal = null;
let viewModal = null;

onMounted(async () => {
  editModal = new Modal(editModalEl.value);
  viewModal = new Modal(viewModalEl.value);
  await fetchStudents();
});

async function fetchStudents(page = 1) {
  loading.value = true;
  error.value = "";
  try {
    const res = await studentService.getAll(page);
    students.value = res.data.data;
    pagination.value = {
      current_page: res.data.current_page,
      last_page: res.data.last_page,
      from: res.data.from,
      to: res.data.to,
      total: res.data.total,
    };
  } catch {
    error.value = "Failed to load students.";
  } finally {
    loading.value = false;
  }
}

function fullName(student) {
  const parts = [
    student.first_name,
    student.middle_name,
    student.last_name,
    student.suffix,
  ];
  return parts.filter(Boolean).join(" ");
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function openEdit(student) {
  selectedStudent.value = student;
  form.value = {
    first_name: student.first_name,
    last_name: student.last_name,
    middle_name: student.middle_name ?? "",
    suffix: student.suffix ?? "",
    date_of_birth: student.date_of_birth,
    gender: student.gender,
  };
  formError.value = "";
  editModal.show();
}

function closeEditModal() {
  editModal.hide();
}

async function saveStudent() {
  formError.value = "";
  if (!form.value.first_name || !form.value.last_name) {
    formError.value = "First name and last name are required.";
    return;
  }
  saving.value = true;
  try {
    await studentService.update(selectedStudent.value.id, form.value);
    closeEditModal();
    await fetchStudents(pagination.value.current_page);
  } catch (err) {
    formError.value = err.response?.data?.message ?? "Something went wrong.";
  } finally {
    saving.value = false;
  }
}

async function openView(student) {
  const res = await studentService.getOne(student.id);
  viewStudent.value = res.data;
  viewModal.show();
}

function closeViewModal() {
  viewModal.hide();
}
</script>
