<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="fw-bold mb-0">Teachers</h5>
      <button class="btn btn-primary btn-sm" @click="addModal.open()">
        + Add Teacher
      </button>
    </div>

    <!-- ── Skeleton loading ───────────────────────────────────────────────── -->
    <div v-if="loading">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr>
                <!-- Employee No. -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 76px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- Name -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 40px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- Date of Birth -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 76px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- Gender -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 46px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- Specialization -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 84px; height: 14px; border-radius: 3px"></div>
                </th>
                <!-- Email -->
                <th>
                  <div
                    class="skeleton"
                    style="width: 36px; height: 14px; border-radius: 3px"></div>
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
              <tr v-for="r in 7" :key="r">
                <!-- Employee No. e.g. "EMP-0003" -->
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${64 + ((r * 7) % 20)}px;height:13px;border-radius:3px`"></div>
                </td>
                <!-- Full name -->
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${100 + ((r * 23) % 60)}px;height:14px;border-radius:3px`"></div>
                </td>
                <!-- Date of Birth -->
                <td>
                  <div
                    class="skeleton"
                    style="width: 80px; height: 13px; border-radius: 3px"></div>
                </td>
                <!-- Gender -->
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${28 + ((r * 5) % 16)}px;height:14px;border-radius:3px`"></div>
                </td>
                <!-- Specialization — some have "—" dash -->
                <td>
                  <div
                    v-if="r % 4 !== 0"
                    class="skeleton"
                    :style="`width:${70 + ((r * 19) % 50)}px;height:14px;border-radius:3px`"></div>
                  <div
                    v-else
                    class="skeleton"
                    style="width: 10px; height: 14px; border-radius: 3px"></div>
                </td>
                <!-- Email -->
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${120 + ((r * 17) % 50)}px;height:13px;border-radius:3px`"></div>
                </td>
                <!-- Status badge -->
                <td>
                  <div
                    class="skeleton"
                    style="
                      width: 52px;
                      height: 20px;
                      border-radius: 12px;
                    "></div>
                </td>
                <!-- Actions: Edit + View -->
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
                        width: 38px;
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
                <th>Employee No.</th>
                <th>Name</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Specialization</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="teachers.length === 0">
                <td colspan="8" class="text-center text-muted py-5">
                  No teachers yet.
                </td>
              </tr>
              <tr v-for="teacher in teachers" :key="teacher.id">
                <td class="text-muted small">{{ teacher.employee_number }}</td>
                <td>{{ fullName(teacher) }}</td>
                <td>{{ formatDate(teacher.date_of_birth) }}</td>
                <td class="text-capitalize">{{ teacher.gender }}</td>
                <td>{{ teacher.specialization ?? "—" }}</td>
                <td class="text-muted small">{{ teacher.user.email }}</td>
                <td>
                  <span
                    :class="
                      teacher.user.is_active
                        ? 'badge bg-success'
                        : 'badge bg-danger'
                    ">
                    {{ teacher.user.is_active ? "Active" : "Inactive" }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="openEdit(teacher)">
                    Edit
                  </button>
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    @click="openView(teacher)">
                    View
                  </button>
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
          @click="fetchTeachers(pagination.current_page - 1)">
          Prev
        </button>
        <button
          class="btn btn-sm btn-outline-secondary"
          :disabled="pagination.current_page === pagination.last_page"
          @click="fetchTeachers(pagination.current_page + 1)">
          Next
        </button>
      </div>
    </div>

    <!-- Add Teacher Modal -->
    <AddUserModal ref="addModal" role="faculty" @created="fetchTeachers()" />

    <!-- Edit Modal -->
    <div
      class="modal fade"
      id="editTeacherModal"
      tabindex="-1"
      ref="editModalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">Edit Teacher</h6>
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
                <label class="form-label">
                  Middle Name
                  <span class="text-muted small">(optional)</span>
                </label>
                <input
                  v-model="form.middle_name"
                  type="text"
                  class="form-control" />
              </div>
              <div class="col">
                <label class="form-label">
                  Suffix
                  <span class="text-muted small">(optional)</span>
                </label>
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
            <div class="mb-3">
              <label class="form-label">
                Specialization
                <span class="text-muted small">(optional)</span>
              </label>
              <input
                v-model="form.specialization"
                type="text"
                class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeEditModal">
              Cancel
            </button>
            <button
              class="btn btn-primary btn-sm"
              :disabled="saving"
              @click="saveTeacher">
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
      id="viewTeacherModal"
      tabindex="-1"
      ref="viewModalEl">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">Teacher Profile</h6>
            <button
              type="button"
              class="btn-close"
              @click="closeViewModal"></button>
          </div>
          <div class="modal-body" v-if="viewTeacher">
            <div class="row mb-3">
              <div class="col-md-6">
                <p class="text-muted small mb-1">Employee Number</p>
                <p class="fw-semibold">{{ viewTeacher.employee_number }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Full Name</p>
                <p class="fw-semibold">{{ fullName(viewTeacher) }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Gender</p>
                <p class="text-capitalize">{{ viewTeacher.gender }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Date of Birth</p>
                <p>{{ formatDate(viewTeacher.date_of_birth) }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Specialization</p>
                <p>{{ viewTeacher.specialization ?? "—" }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Email</p>
                <p>{{ viewTeacher.user.email }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Account Status</p>
                <span
                  :class="
                    viewTeacher.user.is_active
                      ? 'badge bg-success'
                      : 'badge bg-danger'
                  ">
                  {{ viewTeacher.user.is_active ? "Active" : "Inactive" }}
                </span>
              </div>
            </div>
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
import { teacherService } from "@/services/teacher";
import AddUserModal from "@/components/AddUserModal.vue";

const teachers = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const formError = ref("");
const pagination = ref({});
const selectedTeacher = ref(null);
const viewTeacher = ref(null);
const addModal = ref(null);

const form = ref({
  first_name: "",
  last_name: "",
  middle_name: "",
  suffix: "",
  date_of_birth: "",
  gender: "",
  specialization: "",
});

const editModalEl = ref(null);
const viewModalEl = ref(null);
let editModal = null;
let viewModal = null;

onMounted(async () => {
  editModal = new Modal(editModalEl.value);
  viewModal = new Modal(viewModalEl.value);
  await fetchTeachers();
});

async function fetchTeachers(page = 1) {
  loading.value = true;
  error.value = "";
  try {
    const res = await teacherService.getAll(page);
    teachers.value = res.data.data;
    pagination.value = {
      current_page: res.data.current_page,
      last_page: res.data.last_page,
      from: res.data.from,
      to: res.data.to,
      total: res.data.total,
    };
  } catch {
    error.value = "Failed to load teachers.";
  } finally {
    loading.value = false;
  }
}

function fullName(teacher) {
  const parts = [
    teacher.first_name,
    teacher.middle_name,
    teacher.last_name,
    teacher.suffix,
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

function openEdit(teacher) {
  selectedTeacher.value = teacher;
  form.value = {
    first_name: teacher.first_name,
    last_name: teacher.last_name,
    middle_name: teacher.middle_name ?? "",
    suffix: teacher.suffix ?? "",
    date_of_birth: teacher.date_of_birth,
    gender: teacher.gender,
    specialization: teacher.specialization ?? "",
  };
  formError.value = "";
  editModal.show();
}

function closeEditModal() {
  editModal.hide();
}

async function saveTeacher() {
  formError.value = "";
  if (!form.value.first_name || !form.value.last_name) {
    formError.value = "First name and last name are required.";
    return;
  }
  saving.value = true;
  try {
    await teacherService.update(selectedTeacher.value.id, form.value);
    closeEditModal();
    await fetchTeachers(pagination.value.current_page);
  } catch (err) {
    formError.value = err.response?.data?.message ?? "Something went wrong.";
  } finally {
    saving.value = false;
  }
}

async function openView(teacher) {
  const res = await teacherService.getOne(teacher.id);
  viewTeacher.value = res.data;
  viewModal.show();
}

function closeViewModal() {
  viewModal.hide();
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
