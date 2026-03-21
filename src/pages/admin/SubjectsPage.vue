<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="fw-bold mb-0">Subjects</h5>
      <button class="btn btn-primary btn-sm" @click="openCreate">
        + Add Subject
      </button>
    </div>

    <div v-if="loading">
      <LoadingTable :headers="['#', 'Name', 'Code', 'Description', 'Grade Levels', 'Status', 'Actions']"
        loading-text="Loading subjects..." />
    </div>

    <div v-else>
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div v-if="error" class="text-center py-5 text-danger">
            {{ error }}
          </div>
          <table v-else class="table table-hover mb-0">
            <thead class="table-light">
              <tr class="text-center">
                <th>#</th>
                <th>Name</th>
                <th>Code</th>
                <th>Description</th>
                <th>Grade Levels</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="subjects.length === 0">
                <td colspan="7" class="text-center text-muted py-5">
                  No subjects yet.
                </td>
              </tr>
              <tr v-for="subject in subjects" :key="subject.id" class="text-center">
                <td class="text-muted small">{{ subject.id }}</td>
                <td>{{ subject.name }}</td>
                <td>
                  <span class="badge bg-secondary">{{ subject.code }}</span>
                </td>
                <td class="text-muted small">
                  {{ subject.description ?? "—" }}
                </td>
                <td>
                  <span v-for="gl in subject.grade_levels" :key="gl.id" class="badge bg-light text-dark border me-1">{{
                    gl.name }}</span>
                  <span v-if="subject.grade_levels.length === 0" class="text-muted small">None</span>
                </td>
                <td>
                  <span :class="subject.is_active ? 'badge bg-success' : 'badge bg-danger'
                    ">
                    {{ subject.is_active ? "Active" : "Inactive" }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(subject)">
                    Edit
                  </button>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="openAssign(subject)">
                    Assign
                  </button>
                  <button class="btn btn-sm me-1" :class="subject.is_active
                    ? 'btn-outline-warning'
                    : 'btn-outline-success'
                    " @click="toggleActive(subject)">
                    {{ subject.is_active ? "Deactivate" : "Activate" }}
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(subject)">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-3 small text-muted"
        v-if="pagination.last_page > 1">
        <span>Showing {{ pagination.from }}–{{ pagination.to }} of
          {{ pagination.total }}</span>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-secondary" :disabled="pagination.current_page === 1"
            @click="fetchSubjects(pagination.current_page - 1)">
            Prev
          </button>
          <button class="btn btn-sm btn-outline-secondary" :disabled="pagination.current_page === pagination.last_page"
            @click="fetchSubjects(pagination.current_page + 1)">
            Next
          </button>
        </div>
      </div>
    </div>

    <div class="modal fade" id="subjectModal" tabindex="-1" ref="modalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">
              {{ isEditing ? "Edit Subject" : "Add Subject" }}
            </h6>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2 small">
              {{ formError }}
            </div>
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input v-model="form.name" type="text" class="form-control" placeholder="e.g. Mathematics" />
            </div>
            <div class="mb-3">
              <label class="form-label">Code</label>
              <input v-model="form.code" type="text" class="form-control" placeholder="e.g. MAT" />
            </div>
            <div class="mb-3">
              <label class="form-label">
                Description <span class="text-muted small">(optional)</span>
              </label>
              <textarea v-model="form.description" class="form-control" rows="2"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeModal">
              Cancel
            </button>
            <button class="btn btn-primary btn-sm" :disabled="saving" @click="saveSubject">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? "Update" : "Create" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="assignModal" tabindex="-1" ref="assignModalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">
              Assign Grade Levels — {{ selectedSubject?.name }}
            </h6>
            <button type="button" class="btn-close" @click="closeAssignModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="assignError" class="alert alert-danger py-2 small">
              {{ assignError }}
            </div>

            <div v-if="assignLoading" class="text-center py-4 text-muted">
              <div class="spinner-border spinner-border-sm me-2"></div>
              Loading...
            </div>

            <template v-else>
              <p class="small fw-semibold mb-2">Currently Assigned</p>
              <div class="mb-3">
                <div v-if="selectedSubject?.grade_levels.length === 0" class="text-muted small">
                  None assigned yet.
                </div>
                <div v-for="gl in selectedSubject?.grade_levels" :key="gl.id"
                  class="d-flex align-items-center justify-content-between border rounded px-3 py-2 mb-2">
                  <div>
                    <span class="fw-semibold small">{{ gl.name }}</span>
                    <span class="text-muted small ms-2">
                      {{ gl.pivot.units }} units ·
                      {{ gl.pivot.hours_per_week }} hrs/week
                    </span>
                  </div>
                  <button class="btn btn-sm btn-outline-danger" @click="removeGradeLevel(gl.id)">
                    Remove
                  </button>
                </div>
              </div>

              <hr />

              <p class="small fw-semibold mb-2">Add Grade Level</p>
              <div class="mb-3">
                <label class="form-label">Grade Level</label>
                <select v-model="assignForm.grade_level_id" class="form-select">
                  <option disabled value="">Select grade level</option>
                  <option v-for="g in availableGradeLevels" :key="g.id" :value="g.id">
                    {{ g.name }}
                  </option>
                </select>
              </div>
              <div class="row">
                <div class="col">
                  <label class="form-label">Units</label>
                  <input v-model.number="assignForm.units" type="number" step="0.5" class="form-control"
                    placeholder="e.g. 1.0" />
                </div>
                <div class="col">
                  <label class="form-label">Hours/Week</label>
                  <input v-model.number="assignForm.hours_per_week" type="number" class="form-control"
                    placeholder="e.g. 3" />
                </div>
              </div>
            </template>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeAssignModal">
              Close
            </button>
            <button class="btn btn-primary btn-sm" :disabled="assignSaving || assignLoading" @click="addGradeLevel">
              <span v-if="assignSaving" class="spinner-border spinner-border-sm me-1"></span>
              Add
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="deleteSubjectModal" tabindex="-1" ref="deleteModalEl">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <p class="mb-1 fw-semibold">Delete subject?</p>
            <p class="text-muted small mb-3">{{ selectedSubject?.name }}</p>
            <button class="btn btn-danger btn-sm me-2" :disabled="saving" @click="deleteSubject">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
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
import { ref, computed, onMounted, nextTick } from "vue";
import LoadingTable from '../../components/LoadingTable.vue';
import { Modal } from "bootstrap";
import { subjectService } from "@/services/subject";
import { gradeLevelService } from "@/services/grade";

const subjects = ref([]);
const allGradeLevels = ref([]);
const loading = ref(false);
const saving = ref(false);
const assignSaving = ref(false);
const assignLoading = ref(false);
const error = ref("");
const formError = ref("");
const assignError = ref("");
const isEditing = ref(false);
const selectedSubject = ref(null);
const pagination = ref({});

const form = ref({ name: "", code: "", description: "" });
const assignForm = ref({ grade_level_id: "", units: "", hours_per_week: "" });

const modalEl = ref(null);
const assignModalEl = ref(null);
const deleteModalEl = ref(null);
let modalInstance = null;
let assignModalInstance = null;
let deleteModalInstance = null;

onMounted(async () => {
  modalInstance = new Modal(modalEl.value);
  assignModalInstance = new Modal(assignModalEl.value);
  deleteModalInstance = new Modal(deleteModalEl.value);
  await fetchSubjects();
  await fetchGradeLevels();
});

const availableGradeLevels = computed(() => {
  if (!selectedSubject.value) return allGradeLevels.value;
  const assignedIds = selectedSubject.value.grade_levels.map((gl) => gl.id);
  return allGradeLevels.value.filter((gl) => !assignedIds.includes(gl.id));
});

async function fetchSubjects(page = 1) {
  loading.value = true;
  error.value = "";
  try {
    const res = await subjectService.getAll(page);
    subjects.value = res.data.data;
    pagination.value = {
      current_page: res.data.current_page,
      last_page: res.data.last_page,
      from: res.data.from,
      to: res.data.to,
      total: res.data.total,
    };
  } catch {
    error.value = "Failed to load subjects.";
  } finally {
    loading.value = false;
  }
}

async function fetchGradeLevels() {
  const res = await gradeLevelService.getAll();
  allGradeLevels.value = res.data;
}

async function openCreate() {
  isEditing.value = false;
  form.value = { name: "", code: "", description: "" };
  formError.value = "";
  await nextTick();
  modalInstance.show();
}

async function openEdit(subject) {
  isEditing.value = true;
  selectedSubject.value = subject;
  form.value = {
    name: subject.name,
    code: subject.code,
    description: subject.description ?? "",
  };
  formError.value = "";
  await nextTick();
  modalInstance.show();
}

function closeModal() {
  modalInstance.hide();
}

async function saveSubject() {
  formError.value = "";
  if (!form.value.name || !form.value.code) {
    formError.value = "Name and code are required.";
    return;
  }
  saving.value = true;
  try {
    if (isEditing.value) {
      await subjectService.update(selectedSubject.value.id, form.value);
    } else {
      await subjectService.create(form.value);
    }
    closeModal();
    await fetchSubjects(pagination.value.current_page);
  } catch (err) {
    formError.value = err.response?.data?.message ?? "Something went wrong.";
  } finally {
    saving.value = false;
  }
}

async function openAssign(subject) {
  selectedSubject.value = null;
  assignForm.value = { grade_level_id: "", units: "", hours_per_week: "" };
  assignError.value = "";
  assignLoading.value = true;
  assignModalInstance.show();
  try {
    const res = await subjectService.getOne(subject.id);
    selectedSubject.value = res.data;
  } catch {
    assignError.value = "Failed to load subject details.";
  } finally {
    assignLoading.value = false;
  }
}

function closeAssignModal() {
  assignModalInstance.hide();
}

async function addGradeLevel() {
  assignError.value = "";
  if (!assignForm.value.grade_level_id) {
    assignError.value = "Please select a grade level.";
    return;
  }
  assignSaving.value = true;
  try {
    await subjectService.assignGradeLevel(
      selectedSubject.value.id,
      assignForm.value,
    );
    const res = await subjectService.getOne(selectedSubject.value.id);
    selectedSubject.value = res.data;
    assignForm.value = { grade_level_id: "", units: "", hours_per_week: "" };
    await fetchSubjects(pagination.value.current_page);
  } catch (err) {
    assignError.value =
      err.response?.data?.message ?? "Failed to assign grade level.";
  } finally {
    assignSaving.value = false;
  }
}

async function removeGradeLevel(gradeLevelId) {
  try {
    await subjectService.removeGradeLevel(
      selectedSubject.value.id,
      gradeLevelId,
    );
    const res = await subjectService.getOne(selectedSubject.value.id);
    selectedSubject.value = res.data;
    await fetchSubjects(pagination.value.current_page);
  } catch (err) {
    assignError.value =
      err.response?.data?.message ?? "Failed to remove grade level.";
  }
}

async function toggleActive(subject) {
  try {
    subject.is_active
      ? await subjectService.deactivate(subject.id)
      : await subjectService.activate(subject.id);
    await fetchSubjects(pagination.value.current_page);
  } catch (err) {
    alert(err.response?.data?.message ?? "Failed to update subject status.");
  }
}

function confirmDelete(subject) {
  selectedSubject.value = subject;
  deleteModalInstance.show();
}

function closeDeleteModal() {
  deleteModalInstance.hide();
}

async function deleteSubject() {
  saving.value = true;
  try {
    await subjectService.delete(selectedSubject.value.id);
    closeDeleteModal();
    await fetchSubjects(pagination.value.current_page);
  } catch (err) {
    alert(err.response?.data?.message ?? "Failed to delete subject.");
  } finally {
    saving.value = false;
  }
}
</script>