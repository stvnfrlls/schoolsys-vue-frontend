<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="fw-bold mb-0">Assignments</h5>
      <button class="btn btn-sm btn-primary mb-3" @click="openAddModal">
        Add Assignment
      </button>
    </div>

    <!-- ── Skeleton loading ───────────────────────────────────────────────── -->
    <div v-if="loading">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 40px">
                  <div class="skeleton" style="width: 14px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div class="skeleton" style="width: 40px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div class="skeleton" style="width: 36px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div class="skeleton" style="width: 74px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div class="skeleton" style="width: 80px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div class="skeleton" style="width: 44px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div class="skeleton" style="width: 52px; height: 14px; border-radius: 3px"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in 7" :key="r">
                <td>
                  <div class="skeleton" style="width: 22px; height: 13px; border-radius: 3px"></div>
                </td>
                <td>
                  <div class="skeleton" :style="`width:${80 + ((r * 23) % 60)}px;height:14px;border-radius:3px`"></div>
                </td>
                <td>
                  <div class="skeleton" style="
                      width: 38px;
                      height: 20px;
                      border-radius: 12px;
                    "></div>
                </td>
                <td>
                  <div v-if="r % 3 !== 0" class="skeleton"
                    :style="`width:${100 + ((r * 17) % 80)}px;height:13px;border-radius:3px`"></div>
                  <div v-else class="skeleton" style="width: 16px; height: 13px; border-radius: 3px"></div>
                </td>
                <td>
                  <div class="d-flex gap-1 flex-wrap">
                    <div class="skeleton" :style="`width:${44 + ((r * 11) % 24)}px;height:20px;border-radius:4px`">
                    </div>
                    <div v-if="r % 2 === 0" class="skeleton" style="
                        width: 52px;
                        height: 20px;
                        border-radius: 4px;
                      "></div>
                  </div>
                </td>
                <td>
                  <div class="skeleton" style="
                      width: 52px;
                      height: 20px;
                      border-radius: 12px;
                    "></div>
                </td>
                <td>
                  <div class="d-flex gap-1 flex-wrap">
                    <div class="skeleton" style="
                        width: 38px;
                        height: 26px;
                        border-radius: 4px;
                      "></div>
                    <div class="skeleton" style="
                        width: 50px;
                        height: 26px;
                        border-radius: 4px;
                      "></div>
                    <div class="skeleton" style="
                        width: 74px;
                        height: 26px;
                        border-radius: 4px;
                      "></div>
                    <div class="skeleton" style="
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

    <!-- ── Table ─────────────────────────────────────────────────────────── -->
    <div v-else>
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div v-if="error" class="text-center py-5 text-danger">
            {{ error }}
          </div>
          <table v-else class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Subject</th>
                <th>Title</th>
                <th>Points</th>
                <th>Due Date</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="assignments.length === 0">
                <td colspan="7" class="text-center text-muted py-5">
                  No Assignments yet.
                </td>
              </tr>
              <tr v-for="assignment in assignments" :key="assignment.id">
                <td class="text-muted small">{{ assignment.id }}</td>
                <td>{{ assignment.subject.name }} <span class="badge bg-secondary">{{ assignment.subject.code }}</span>
                </td>
                <td>
                  {{ assignment.title }}
                </td>
                <td class="text-muted small">
                  {{ assignment.total_points }}
                </td>
                <td>
                  {{ formatDateTime(assignment.due_date) }}
                </td>
                <td>
                  {{ assignment.is_published }}
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="openViewModal(assignment)">
                    View
                  </button>
                  <button class="btn btn-sm btn-outline-primary me-1" @click="openEditModal(assignment)">
                    Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteAssignment(assignment)"
                    :disabled="deletingId === assignment.id">
                    <span v-if="deletingId === assignment.id" class="spinner-border spinner-border-sm me-1"></span>
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3 small text-muted"
        v-if="pagination.last_page > 1">
        <span>Showing {{ pagination.from }}–{{ pagination.to }} of
          {{ pagination.total }}</span>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-secondary" :disabled="pagination.current_page === 1" @click="prevPage">
            Prev
          </button>
          <button class="btn btn-sm btn-outline-secondary" :disabled="pagination.current_page === pagination.last_page"
            @click="nextPage">
            Next
          </button>
        </div>
      </div>
    </div>

    <div class="modal fade" tabindex="-1" ref="addModalEl">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">

          <!-- Header -->
          <div class="modal-header">
            <h6 class="modal-title fw-bold">Add Assignment</h6>
            <button type="button" class="btn-close" @click="closeAddModal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body">

            <!-- Basic Info -->
            <div class="mb-3">
              <label class="form-label">Title</label>
              <input v-model="addForm.title" class="form-control" placeholder="Enter title" />
            </div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label">Points</label>
                <input v-model="addForm.total_points" type="number" class="form-control" placeholder="0" />
              </div>
              <div class="col">
                <label class="form-label">Due Date</label>
                <input v-model="addForm.due_date" type="datetime-local" class="form-control" />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label">Grade Section</label>
                <select v-model="addForm.gradelevel_id" class="form-select" @change="onSectionChange">
                  <option disabled value="">Select section</option>
                  <option v-for="s in sections" :key="s.id" :value="s.id">
                    {{ s.grade_level?.name }} — {{ s.name }}
                  </option>
                </select>
              </div>
              <div class="col">
                <label class="form-label">Subject <span class="text-danger">*</span> <span v-if="!addForm.gradelevel_id"
                    class="text-muted small">(select a section first)</span></label>
                <select v-model="addForm.subject_id" class="form-select" :disabled="!addForm.gradelevel_id" required>
                  <option disabled value="">Select subject</option>
                  <option v-for="s in filteredSubjects" :key="s.id" :value="s.id">
                    {{ s.name }}<template v-if="s.code"> ({{ s.code }})</template>
                  </option>
                </select>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label">Status</label>
                <select v-model="addForm.is_published" class="form-select">
                  <option :value="1">Published</option>
                  <option :value="0">Draft</option>
                </select>
              </div>
              <div class="col">
                <label class="form-label">Teacher</label>
                <select v-model="addForm.teacher_id" class="form-select">
                  <option disabled value="">Select teacher</option>
                  <option v-for="t in faculty" :key="t.id" :value="t.id">
                    {{ teacherFullName(t) }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea v-model="addForm.description" class="form-control" rows="3"
                placeholder="Enter description"></textarea>
            </div>

            <!-- Instructions -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label mb-0">Instructions</label>
                <button class="btn btn-sm btn-outline-primary" @click="addInstruction">+ Add</button>
              </div>

              <div v-if="addForm.instructions.length === 0" class="text-muted small">
                No instructions yet.
              </div>

              <div v-for="(inst, index) in addForm.instructions" :key="index" class="border rounded p-2 mb-2">
                <div class="row g-2 align-items-center">

                  <!-- Type -->
                  <div class="col-3">
                    <select v-model="inst.type" class="form-select form-select-sm">
                      <option value="text">Text</option>
                      <option value="bullet">Bullet</option>
                    </select>
                  </div>

                  <!-- Content -->
                  <div class="col">
                    <input v-model="inst.content" class="form-control form-control-sm"
                      placeholder="Enter instruction..." />
                  </div>

                  <!-- Remove -->
                  <div class="col-auto">
                    <button class="btn btn-sm btn-outline-danger" @click="removeInstruction(index)">✕</button>
                  </div>

                </div>
              </div>

            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeAddModal">Cancel</button>
            <button class="btn btn-primary btn-sm" @click="saveAdd" :disabled="savingAdd">
              <span v-if="savingAdd" class="spinner-border spinner-border-sm me-1"></span>
              Create Assignment
            </button>
          </div>

        </div>
      </div>
    </div>

    <div class="modal fade" id="viewAssignmentModal" tabindex="-1" ref="viewModalEl">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">

          <!-- Header -->
          <div class="modal-header">
            <h6 class="modal-title fw-bold">
              Assignment Details
            </h6>
            <button type="button" class="btn-close" @click="closeViewModal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <div v-if="!selectedAssignment" class="text-muted text-center py-4">
              No assignment selected.
            </div>

            <div v-else>
              <!-- Title -->
              <h5 class="fw-bold mb-2">
                {{ selectedAssignment.title }}
              </h5>

              <!-- Subject -->
              <div class="mb-2 text-muted small">
                {{ selectedAssignment.subject?.name }}
                <span class="badge bg-secondary">
                  {{ selectedAssignment.subject?.code }}
                </span>
              </div>

              <!-- Meta Info -->
              <div class="row mb-3 small">
                <div class="col-md-4">
                  <strong>Points:</strong><br />
                  {{ selectedAssignment.total_points }}
                </div>
                <div class="col-md-4">
                  <strong>Due Date:</strong><br />
                  {{ formatDateTime(selectedAssignment.due_date) }}
                </div>
                <div class="col-md-4">
                  <strong>Status:</strong><br />
                  <span class="badge" :class="selectedAssignment.is_published ? 'bg-success' : 'bg-secondary'">
                    {{ selectedAssignment.is_published ? 'Published' : 'Draft' }}
                  </span>
                </div>
              </div>

              <!-- Description -->
              <div>
                <strong>Description</strong>
                <div class="border rounded p-3 mt-2 bg-light mb-3">
                  <div v-if="selectedAssignment.details?.description">
                    {{ selectedAssignment.details.description }}
                  </div>
                  <div v-else class="text-muted">
                    No description provided.
                  </div>
                </div>

                <strong>Instructions</strong>
                <div class="border rounded p-3 mt-2 bg-light">

                  <div v-if="parsedInstructions.length === 0" class="text-muted">
                    No instructions provided.
                  </div>

                  <div v-else>
                    <template v-for="(item, index) in parsedInstructions" :key="index">

                      <!-- Text -->
                      <p v-if="item.type === 'text'" class="mb-2">
                        {{ item.content }}
                      </p>

                      <!-- Bullet -->
                      <ul v-else-if="item.type === 'bullet'" class="mb-2 ps-3">
                        <li>{{ item.content }}</li>
                      </ul>

                    </template>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeViewModal">
              Close
            </button>
          </div>

        </div>
      </div>
    </div>

    <div class="modal fade" tabindex="-1" ref="editModalEl">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">

          <!-- Header -->
          <div class="modal-header">
            <h6 class="modal-title fw-bold">Edit Assignment</h6>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>

          <!-- Body -->
          <div class="modal-body">

            <!-- Basic Info -->
            <div class="mb-3">
              <label class="form-label">Title</label>
              <input v-model="editForm.title" class="form-control" placeholder="Enter title" />
            </div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label">Points</label>
                <input v-model="editForm.total_points" type="number" class="form-control" placeholder="0" />
              </div>
              <div class="col">
                <label class="form-label">Due Date</label>
                <input v-model="editForm.due_date" type="datetime-local" class="form-control" />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label">Grade Section</label>
                <select v-model="editForm.gradelevel_id" class="form-select" @change="onSectionChange">
                  <option disabled value="">Select section</option>
                  <option v-for="s in sections" :key="s.id" :value="s.grade_level.id">
                    {{ s.grade_level?.name }} — {{ s.name }}
                  </option>
                </select>
              </div>
              <div class="col">
                <label class="form-label">Subject <span class="text-danger">*</span> <span
                    v-if="!editForm.grade_level_id" class="text-muted small">(select a grade level first)</span></label>
                <select v-model="editForm.subject_id" class="form-select" required>
                  <option disabled value="">Select subject</option>
                  <option v-for="s in filteredSubjectsEdit" :key="s.id" :value="s.id">
                    {{ s.name }}<template v-if="s.code"> ({{ s.code }})</template>
                  </option>
                </select>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label">Status</label>
                <select v-model="editForm.is_published" class="form-select">
                  <option :value="1">Published</option>
                  <option :value="0">Draft</option>
                </select>
              </div>
              <div class="col">
                <label class="form-label">Teacher</label>
                <select v-model="editForm.teacher_id" class="form-select">
                  <option disabled value="">Select teacher</option>
                  <option v-for="t in faculty" :key="t.id" :value="t.id">
                    {{ teacherFullName(t) }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea v-model="editForm.description" class="form-control" rows="3"
                placeholder="Enter description"></textarea>
            </div>

            <!-- Instructions (unchanged) -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label mb-0">Instructions</label>
                <button class="btn btn-sm btn-outline-primary" @click="addInstruction">+ Add</button>
              </div>

              <div v-if="editForm.instructions.length === 0" class="text-muted small">
                No instructions yet.
              </div>

              <div v-for="(inst, index) in editForm.instructions" :key="index" class="border rounded p-2 mb-2">
                <div class="row g-2 align-items-center">
                  <div class="col-3">
                    <select v-model="inst.type" class="form-select form-select-sm">
                      <option value="text">Text</option>
                      <option value="bullet">Bullet</option>
                    </select>
                  </div>
                  <div class="col">
                    <input v-model="inst.content" class="form-control form-control-sm"
                      placeholder="Enter instruction..." />
                  </div>
                  <div class="col-auto">
                    <button class="btn btn-sm btn-outline-danger" @click="removeInstruction(index)">✕</button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeEditModal">
              Cancel
            </button>
            <button class="btn btn-primary btn-sm" @click="saveEdit" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { Modal } from "bootstrap";
import { assignmentService } from "@/services/assignment";
import { sectionService } from "@/services/grade";
import { subjectService } from "@/services/subject";
import { facultyService } from "@/services/schedule";

// ---------- Refs ----------
const assignments = ref([]);
const sections = ref([]);
const subjects = ref([]);
const faculty = ref([]);
const loading = ref(false);
const error = ref("");
const saving = ref(false);
const savingAdd = ref(false);
const pagination = ref({});
const selectedAssignment = ref(null);
const deletingId = ref(null);

const addModalEl = ref(null);
const viewModalEl = ref(null);
const editModalEl = ref(null);

let addModalInstance = null;
let viewModalInstance = null;
let editModalInstance = null;

// Track which modal is open
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);

// ---------- Forms ----------
const addForm = ref({
  title: "",
  gradelevel_id: "",
  section_id: "",
  subject_id: "",
  teacher_id: "",
  total_points: "",
  due_date: "",
  is_published: 0,
  description: "",
  instructions: [],
});

const editForm = ref({
  id: null,
  gradelevel_id: "",
  section_id: "",
  subject_id: "",
  teacher_id: "",
  title: "",
  total_points: "",
  due_date: "",
  is_published: 0,
  description: "",
  instructions: [],
});

// ---------- Computed ----------
const parsedInstructions = computed(() => {
  try {
    const raw = selectedAssignment.value?.details?.instructions;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
});

const subjectFilterActive = computed(() => {
  if (!addForm.value.gradelevel_id) return false;
  const section = sections.value.find((s) => s.id === addForm.value.gradelevel_id);
  if (!section?.grade_level?.id) return false;
  return subjects.value.some((sub) => sub.grade_levels?.length > 0);
});

const filteredSubjects = computed(() => {
  if (!subjectFilterActive.value) return subjects.value;
  return subjects.value.filter((sub) =>
    sub.grade_levels?.some((gl) => gl.id === addForm.value.gradelevel_id),
  );
});

const filteredSubjectsEdit = computed(() => {
  if (!editForm.value.gradelevel_id) return subjects.value;
  return subjects.value.filter((sub) =>
    sub.grade_levels?.some((gl) => gl.id === editForm.value.gradelevel_id),
  );
});

// ---------- Lifecycle ----------
onMounted(async () => {
  await Promise.all([
    fetchAssignments(),
    fetchSections(),
    fetchSubjects(),
    fetchFaculty(),
  ]);
});

// ---------- Fetch Assignments ----------
async function fetchAssignments(page = 1) {
  loading.value = true;
  error.value = "";

  try {
    const res = await assignmentService.getAll({ page });
    assignments.value = res.data.data;

    pagination.value = {
      current_page: res.data.current_page,
      last_page: res.data.last_page,
      from: res.data.from,
      to: res.data.to,
      total: res.data.total,
    };
  } catch {
    error.value = "Failed to load assignments.";
  } finally {
    loading.value = false;
  }
}

async function fetchSections() {
  const res = await sectionService.getAll();
  sections.value = res.data;
}

async function fetchSubjects() {
  const res = await subjectService.getAll(1);
  subjects.value = res.data?.data ?? res.data;
}

async function fetchFaculty() {
  const res = await facultyService.getAll();
  faculty.value = res.data?.data ?? res.data;
}

// ---------- Save Assignment ----------
async function saveAssignment(isEdit = false) {
  const form = isEdit ? editForm.value : addForm.value;
  const setSaving = isEdit ? saving : savingAdd;
  setSaving.value = true;

  const formatDate = (datetime) => {
    if (!datetime) return "";
    return datetime.replace('T', ' ') + ':00';
  };

  const instructionsJson = form.instructions?.length > 0
    ? JSON.stringify(form.instructions)
    : null;

  const payload = {
    gradelevel_id: form.gradelevel_id,
    section_id: form.section_id,
    subject_id: form.subject_id,
    teacher_id: form.teacher_id,
    title: form.title,
    total_points: form.total_points,
    due_date: formatDate(form.due_date),
    is_published: form.is_published ?? false,
    description: form.description || null,
    instructions: instructionsJson,
  };

  try {
    if (isEdit) {
      await assignmentService.update(form.id, payload);
      closeEditModal();
    } else {
      await assignmentService.create(payload);
      closeAddModal();
    }
    await fetchAssignments();
  } catch {
    alert(`Failed to ${isEdit ? "update" : "create"} assignment.`);
  } finally {
    setSaving.value = false;
  }
}

const saveAdd = () => saveAssignment(false);
const saveEdit = () => saveAssignment(true);

// ---------- Delete ----------
async function deleteAssignment(assignment) {
  if (!confirm(`Are you sure you want to delete "${assignment.title}"?`)) return;

  deletingId.value = assignment.id;

  try {
    await assignmentService.delete(assignment.id);
    await fetchAssignments();
  } catch {
    alert("Failed to delete assignment.");
  } finally {
    deletingId.value = null;
  }
}

// ---------- Modals ----------
function openAddModal() {
  addForm.value = {
    title: "",
    section_id: "",
    subject_id: "",
    teacher_id: "",
    total_points: "",
    due_date: "",
    is_published: 0,
    description: "",
    instructions: []
  };
  if (!addModalInstance) addModalInstance = new Modal(addModalEl.value);
  addModalInstance.show();
  isAddModalOpen.value = true;
}

function closeAddModal() {
  addModalInstance?.hide();
  isAddModalOpen.value = false;
}

function openViewModal(assignment) {
  selectedAssignment.value = assignment;
  if (!viewModalInstance) viewModalInstance = new Modal(viewModalEl.value);
  viewModalInstance.show();
}

function closeViewModal() {
  viewModalInstance?.hide();
}

function openEditModal(assignment) {
  const details = assignment.details || {};
  let instructions = [];
  try {
    instructions = details.instructions ? JSON.parse(details.instructions) : [];
  } catch {
    instructions = [];
  }

  // Keep as number to match the sections data type
  const sectionId = assignment.section_id || "";
  const subjectId = assignment.subject_id || "";
  const teacherId = assignment.teacher_id || "";

  editForm.value = {
    id: assignment.id,
    gradelevel_id: assignment.gradelevel_id,
    section_id: sectionId,
    subject_id: subjectId,
    teacher_id: teacherId,
    title: assignment.title,
    total_points: assignment.total_points,
    due_date: formatForInput(assignment.due_date),
    is_published: assignment.is_published ? 1 : 0,
    description: details.description || "",
    instructions,
  };

  if (!editModalInstance) editModalInstance = new Modal(editModalEl.value);
  editModalInstance.show();
  isEditModalOpen.value = true;
}

function closeEditModal() {
  editModalInstance?.hide();
  isEditModalOpen.value = false;
}

function onSectionChange() {
  addForm.value.subject_id = "";
  editForm.value.subject_id = "";
}

// ---------- Instructions ----------
function addInstruction() {
  if (isAddModalOpen.value) addForm.value.instructions.push({ type: "text", content: "" });
  else if (isEditModalOpen.value) editForm.value.instructions.push({ type: "text", content: "" });
}

function removeInstruction(index) {
  if (isAddModalOpen.value) addForm.value.instructions.splice(index, 1);
  else if (isEditModalOpen.value) editForm.value.instructions.splice(index, 1);
}

// ---------- Pagination ----------
function goToPage(page) {
  if (page >= 1 && page <= pagination.value.last_page) fetchAssignments(page);
}

const nextPage = () => goToPage(pagination.value.current_page + 1);
const prevPage = () => goToPage(pagination.value.current_page - 1);

// ---------- Date Formatting ----------
function formatForInput(datetime) {
  if (!datetime) return "";
  const d = new Date(datetime);
  return !isNaN(d) ? d.toISOString().slice(0, 16) : "";
}

function formatDateTime(datetime) {
  if (!datetime) return "—";
  const date = new Date(datetime);
  if (isNaN(date)) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function teacherFullName(teacher) {
  return [
    teacher.first_name,
    teacher.middle_name,
    teacher.last_name,
    teacher.suffix,
  ]
    .filter(Boolean)
    .join(" ");
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
