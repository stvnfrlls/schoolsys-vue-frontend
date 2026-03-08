<template>
  <div>
    <!-- Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: tab === 'components' }"
          @click="tab = 'components'">
          Grading Components
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: tab === 'grades' }"
          @click="tab = 'grades'">
          Student Grades
        </button>
      </li>
    </ul>

    <!-- ── Tab: Grading Components ──────────────────────────────────────── -->
    <div v-if="tab === 'components'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="fw-bold mb-0">Grading Components</h6>
        <button class="btn btn-primary btn-sm" @click="openCreateComponent">
          + Add Component
        </button>
      </div>

      <!-- Filter by subject -->
      <div class="mb-3" style="max-width: 280px">
        <select
          v-model="filterComponentSubjectId"
          class="form-select form-select-sm"
          @change="fetchComponents">
          <option value="">All Subjects</option>
          <option v-for="s in subjects" :key="s.id" :value="s.id">
            {{ s.name }}
          </option>
        </select>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div v-if="componentsLoading" class="text-center py-5 text-muted">
            Loading...
          </div>
          <div v-else-if="componentsError" class="text-center py-5 text-danger">
            {{ componentsError }}
          </div>
          <table v-else class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Code</th>
                <th>Subject</th>
                <th>Weight (%)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="comp in components" :key="comp.id">
                <td class="text-muted small">{{ comp.id }}</td>
                <td>{{ comp.name }}</td>
                <td>
                  <span class="badge bg-secondary">{{ comp.code }}</span>
                </td>
                <td>{{ comp.subject?.name ?? "—" }}</td>
                <td>
                  <span class="fw-semibold">{{ comp.weight }}%</span>
                </td>
                <td>
                  <span
                    :class="
                      comp.is_active ? 'badge bg-success' : 'badge bg-danger'
                    ">
                    {{ comp.is_active ? "Active" : "Inactive" }}
                  </span>
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="openEditComponent(comp)">
                    Edit
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDeleteComponent(comp)">
                    Delete
                  </button>
                </td>
              </tr>
              <tr v-if="components.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  No grading components found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Weight summary per subject -->
      <div
        v-if="filterComponentSubjectId && components.length > 0"
        class="mt-3">
        <div
          class="alert py-2 small mb-0"
          :class="
            totalWeight === 100
              ? 'alert-success'
              : totalWeight > 100
                ? 'alert-danger'
                : 'alert-warning'
          ">
          <strong>Total weight for this subject: {{ totalWeight }}%</strong>
          <span v-if="totalWeight === 100"> — ✓ Fully allocated</span>
          <span v-else-if="totalWeight > 100"> — ✗ Exceeds 100%</span>
          <span v-else> — {{ 100 - totalWeight }}% remaining</span>
        </div>
      </div>
    </div>

    <!-- ── Tab: Student Grades ───────────────────────────────────────────── -->
    <div v-if="tab === 'grades'">
      <h6 class="fw-bold mb-3">Student Grades</h6>

      <!-- Filters -->
      <div class="row g-2 mb-3">
        <div class="col-sm-3">
          <select
            v-model="gradeFilterSectionId"
            class="form-select form-select-sm"
            @change="onGradeSectionChange">
            <option value="">Select Section</option>
            <option v-for="s in sections" :key="s.id" :value="s.id">
              {{ s.grade_level?.name }} — {{ s.name }}
            </option>
          </select>
        </div>
        <div class="col-sm-3">
          <select
            v-model="gradeFilterSubjectId"
            class="form-select form-select-sm"
            :disabled="!gradeFilterSectionId"
            @change="onGradeSubjectChange">
            <option value="">Select Subject</option>
            <option v-for="s in subjects" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>
        </div>
        <div class="col-sm-2">
          <select
            v-model="gradeFilterQuarter"
            class="form-select form-select-sm"
            :disabled="!gradeFilterSubjectId"
            @change="loadGradeSheet">
            <option value="">Select Quarter</option>
            <option value="1">Quarter 1</option>
            <option value="2">Quarter 2</option>
            <option value="3">Quarter 3</option>
            <option value="4">Quarter 4</option>
          </select>
        </div>
      </div>

      <!-- Grade sheet -->
      <div
        v-if="
          !gradeFilterSectionId || !gradeFilterSubjectId || !gradeFilterQuarter
        ">
        <div class="text-center text-muted py-5">
          Select a section, subject, and quarter to view and input grades.
        </div>
      </div>

      <div v-else>
        <div v-if="gradesLoading" class="text-center py-5 text-muted">
          Loading...
        </div>
        <div v-else-if="gradesError" class="text-center py-5 text-danger">
          {{ gradesError }}
        </div>

        <div v-else>
          <!-- No components warning -->
          <div
            v-if="activeComponents.length === 0"
            class="alert alert-warning small">
            No active grading components found for this subject. Go to
            <strong>Grading Components</strong> tab to add them first.
          </div>

          <div v-else>
            <div class="card border-0 shadow-sm">
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover table-bordered mb-0 small">
                    <thead class="table-light">
                      <tr>
                        <th class="text-nowrap">Student</th>
                        <th
                          v-for="comp in activeComponents"
                          :key="comp.id"
                          class="text-center text-nowrap">
                          {{ comp.name }}
                          <div
                            class="text-muted fw-normal"
                            style="font-size: 0.7rem">
                            {{ comp.weight }}%
                          </div>
                        </th>
                        <th class="text-center text-nowrap">Final Grade</th>
                        <th class="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="row in gradeSheet"
                        :key="row.enrollment.id"
                        :class="{ 'table-danger': row.isFailing }">
                        <td class="text-nowrap">
                          {{ fullName(row.enrollment.student) }}
                        </td>
                        <td
                          v-for="comp in activeComponents"
                          :key="comp.id"
                          class="text-center"
                          style="min-width: 90px">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            class="form-control form-control-sm text-center"
                            style="width: 80px; margin: 0 auto"
                            :value="getScore(row, comp.id)"
                            @change="onScoreChange(row, comp, $event)"
                            :disabled="
                              savingCell === cellKey(row.enrollment.id, comp.id)
                            " />
                        </td>
                        <td class="text-center fw-semibold">
                          {{ row.finalGrade ?? "—" }}
                        </td>
                        <td class="text-center">
                          <span v-if="row.finalGrade !== null">
                            <span v-if="row.isFailing" class="badge bg-danger"
                              >Failing</span
                            >
                            <span v-else class="badge bg-success">Passing</span>
                          </span>
                          <span v-else class="text-muted">—</span>
                        </td>
                      </tr>
                      <tr v-if="gradeSheet.length === 0">
                        <td
                          :colspan="activeComponents.length + 3"
                          class="text-center text-muted py-4">
                          No enrolled students found for this section.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="mt-2 small text-muted">
              Scores are saved automatically on input. Final grade is computed
              by the server. Failing threshold: below 75.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Grading Component Modal ───────────────────────────────────────── -->
    <div
      class="modal fade"
      id="componentModal"
      tabindex="-1"
      ref="componentModalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">
              {{
                isEditingComponent ? "Edit Component" : "Add Grading Component"
              }}
            </h6>
            <button
              type="button"
              class="btn-close"
              @click="closeComponentModal"></button>
          </div>
          <div class="modal-body">
            <div
              v-if="componentFormError"
              class="alert alert-danger py-2 small">
              {{ componentFormError }}
            </div>

            <div class="mb-3">
              <label class="form-label">Subject</label>
              <select v-model="componentForm.subject_id" class="form-select">
                <option disabled value="">Select subject</option>
                <option v-for="s in subjects" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input
                v-model="componentForm.name"
                type="text"
                class="form-control"
                placeholder="e.g. Written Work" />
            </div>
            <div class="mb-3">
              <label class="form-label">Code</label>
              <input
                v-model="componentForm.code"
                type="text"
                class="form-control"
                placeholder="e.g. WW" />
            </div>
            <div class="mb-3">
              <label class="form-label">Weight (%)</label>
              <input
                v-model.number="componentForm.weight"
                type="number"
                min="0"
                max="100"
                step="0.01"
                class="form-control"
                placeholder="e.g. 30" />
              <div class="form-text text-muted" v-if="componentForm.subject_id">
                Current total for this subject:
                <strong
                  >{{ weightForSubject(componentForm.subject_id) }}%</strong
                >
                ({{ 100 - weightForSubject(componentForm.subject_id) }}%
                remaining)
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              class="btn btn-secondary btn-sm"
              @click="closeComponentModal">
              Cancel
            </button>
            <button
              class="btn btn-primary btn-sm"
              :disabled="componentSaving"
              @click="saveComponent">
              <span
                v-if="componentSaving"
                class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditingComponent ? "Update" : "Create" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Delete Component Modal ────────────────────────────────────────── -->
    <div
      class="modal fade"
      id="deleteComponentModal"
      tabindex="-1"
      ref="deleteComponentModalEl">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <p class="mb-1 fw-semibold">Delete grading component?</p>
            <p class="text-muted small mb-3">{{ selectedComponent?.name }}</p>
            <button
              class="btn btn-danger btn-sm me-2"
              :disabled="componentSaving"
              @click="deleteComponent">
              <span
                v-if="componentSaving"
                class="spinner-border spinner-border-sm me-1"></span>
              Delete
            </button>
            <button
              class="btn btn-secondary btn-sm"
              @click="closeDeleteComponentModal">
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
import {
  gradingComponentService,
  studentGradeService,
} from "@/services/grading";
import { subjectService } from "@/services/subject";
import { sectionService } from "@/services/grade";
import { enrollmentService } from "@/services/enrollment";

// ── Tab ───────────────────────────────────────────────────────────────────
const tab = ref("components");

// ── Shared data ───────────────────────────────────────────────────────────
const subjects = ref([]);
const sections = ref([]);

// ── Grading Components tab ────────────────────────────────────────────────
const components = ref([]);
const componentsLoading = ref(false);
const componentsError = ref("");
const filterComponentSubjectId = ref("");

const isEditingComponent = ref(false);
const selectedComponent = ref(null);
const componentForm = ref({ subject_id: "", name: "", code: "", weight: "" });
const componentFormError = ref("");
const componentSaving = ref(false);

const componentModalEl = ref(null);
const deleteComponentModalEl = ref(null);
let componentModal = null;
let deleteComponentModal = null;

// ── Student Grades tab ────────────────────────────────────────────────────
const gradeFilterSectionId = ref("");
const gradeFilterSubjectId = ref("");
const gradeFilterQuarter = ref("");

const enrollments = ref([]); // enrollments for selected section
const activeComponents = ref([]); // active grading components for selected subject
const existingGrades = ref([]); // raw grades from API
const gradesLoading = ref(false);
const gradesError = ref("");
const savingCell = ref(""); // tracks which cell is saving: "enrollmentId-componentId"

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  componentModal = new Modal(componentModalEl.value);
  deleteComponentModal = new Modal(deleteComponentModalEl.value);
  await Promise.all([fetchSubjects(), fetchSections(), fetchComponents()]);
});

// ── Computed ──────────────────────────────────────────────────────────────

// Total weight of currently loaded components (for selected subject filter)
const totalWeight = computed(() => {
  return components.value.reduce((sum, c) => sum + Number(c.weight), 0);
});

// Build the grade sheet rows: one row per enrolled student
const gradeSheet = computed(() => {
  return enrollments.value.map((enrollment) => {
    // Find all grades for this enrollment
    const enrollmentGrades = existingGrades.value.filter(
      (g) => g.enrollment_id === enrollment.id,
    );

    // Final grade: take from any grade record (they're all kept in sync by the API)
    const anyGrade = enrollmentGrades.find((g) => g.final_grade !== null);
    const finalGrade = anyGrade?.final_grade ?? null;
    const isFailing = anyGrade?.is_failing ?? false;

    return { enrollment, grades: enrollmentGrades, finalGrade, isFailing };
  });
});

// ── Fetch ─────────────────────────────────────────────────────────────────
async function fetchSubjects() {
  const res = await subjectService.getAll(1);
  subjects.value = res.data?.data ?? res.data;
}

async function fetchSections() {
  const res = await sectionService.getAll();
  sections.value = res.data;
}

async function fetchComponents() {
  componentsLoading.value = true;
  componentsError.value = "";
  try {
    const filters = {};
    if (filterComponentSubjectId.value)
      filters.subject_id = filterComponentSubjectId.value;
    const res = await gradingComponentService.getAll(filters);
    components.value = res.data;
  } catch {
    componentsError.value = "Failed to load grading components.";
  } finally {
    componentsLoading.value = false;
  }
}

// ── Grade sheet loaders ───────────────────────────────────────────────────
async function onGradeSectionChange() {
  gradeFilterSubjectId.value = "";
  gradeFilterQuarter.value = "";
  enrollments.value = [];
  existingGrades.value = [];
  activeComponents.value = [];

  if (!gradeFilterSectionId.value) return;

  // Load enrollments for this section (all pages — use large per_page)
  const res = await enrollmentService.getAll(1, {});
  const all = res.data?.data ?? res.data;
  enrollments.value = all.filter(
    (e) =>
      String(e.section_id) === String(gradeFilterSectionId.value) &&
      e.status === "active",
  );
}

async function onGradeSubjectChange() {
  gradeFilterQuarter.value = "";
  existingGrades.value = [];
  activeComponents.value = [];

  if (!gradeFilterSubjectId.value) return;

  // Load active components for this subject
  const res = await gradingComponentService.getAll({
    subject_id: gradeFilterSubjectId.value,
    is_active: true,
  });
  activeComponents.value = res.data;
}

async function loadGradeSheet() {
  if (
    !gradeFilterSectionId.value ||
    !gradeFilterSubjectId.value ||
    !gradeFilterQuarter.value
  )
    return;

  gradesLoading.value = true;
  gradesError.value = "";
  try {
    // Load all existing grade records for this subject + quarter
    // We'll match to enrollments client-side
    const enrollmentIds = enrollments.value.map((e) => e.id);
    const allGrades = [];

    // The API filters by enrollment_id individually — fetch for each enrollment
    // to avoid missing records. Batch with Promise.all.
    const results = await Promise.all(
      enrollmentIds.map((eid) =>
        studentGradeService.getAll({
          enrollment_id: eid,
          subject_id: gradeFilterSubjectId.value,
          quarter: gradeFilterQuarter.value,
        }),
      ),
    );
    results.forEach((res) => allGrades.push(...res.data));
    existingGrades.value = allGrades;
  } catch {
    gradesError.value = "Failed to load grades.";
  } finally {
    gradesLoading.value = false;
  }
}

// ── Grade sheet helpers ───────────────────────────────────────────────────

// Get the current score for a student + component
function getScore(row, componentId) {
  const grade = row.grades.find((g) => g.grading_component_id === componentId);
  return grade?.score ?? "";
}

function cellKey(enrollmentId, componentId) {
  return `${enrollmentId}-${componentId}`;
}

// Save score on input change
async function onScoreChange(row, component, event) {
  const rawValue = event.target.value;
  if (rawValue === "" || rawValue === null) return;

  const score = parseFloat(rawValue);
  if (isNaN(score) || score < 0 || score > 100) {
    event.target.value = getScore(row, component.id); // revert
    return;
  }

  const key = cellKey(row.enrollment.id, component.id);
  savingCell.value = key;

  try {
    await studentGradeService.save({
      enrollment_id: row.enrollment.id,
      subject_id: Number(gradeFilterSubjectId.value),
      grading_component_id: component.id,
      quarter: Number(gradeFilterQuarter.value),
      score,
    });
    // Reload grades for this enrollment to reflect updated final_grade
    const res = await studentGradeService.getAll({
      enrollment_id: row.enrollment.id,
      subject_id: gradeFilterSubjectId.value,
      quarter: gradeFilterQuarter.value,
    });
    // Replace existing grades for this enrollment
    existingGrades.value = [
      ...existingGrades.value.filter(
        (g) => g.enrollment_id !== row.enrollment.id,
      ),
      ...res.data,
    ];
  } catch (err) {
    alert(err.response?.data?.message ?? "Failed to save grade.");
    event.target.value = getScore(row, component.id); // revert on error
  } finally {
    savingCell.value = "";
  }
}

// ── Component CRUD ────────────────────────────────────────────────────────
function openCreateComponent() {
  isEditingComponent.value = false;
  componentForm.value = {
    subject_id: filterComponentSubjectId.value || "",
    name: "",
    code: "",
    weight: "",
  };
  componentFormError.value = "";
  componentModal.show();
}

function openEditComponent(comp) {
  isEditingComponent.value = true;
  selectedComponent.value = comp;
  componentForm.value = {
    subject_id: comp.subject_id,
    name: comp.name,
    code: comp.code,
    weight: comp.weight,
  };
  componentFormError.value = "";
  componentModal.show();
}

function closeComponentModal() {
  componentModal.hide();
}

async function saveComponent() {
  componentFormError.value = "";
  if (
    !componentForm.value.subject_id ||
    !componentForm.value.name ||
    !componentForm.value.code ||
    componentForm.value.weight === ""
  ) {
    componentFormError.value = "All fields are required.";
    return;
  }
  componentSaving.value = true;
  try {
    if (isEditingComponent.value) {
      await gradingComponentService.update(selectedComponent.value.id, {
        name: componentForm.value.name,
        code: componentForm.value.code,
        weight: componentForm.value.weight,
      });
    } else {
      await gradingComponentService.create(componentForm.value);
    }
    closeComponentModal();
    await fetchComponents();
  } catch (err) {
    componentFormError.value =
      err.response?.data?.message ?? "Something went wrong.";
  } finally {
    componentSaving.value = false;
  }
}

function confirmDeleteComponent(comp) {
  selectedComponent.value = comp;
  deleteComponentModal.show();
}

function closeDeleteComponentModal() {
  deleteComponentModal.hide();
}

async function deleteComponent() {
  componentSaving.value = true;
  try {
    await gradingComponentService.delete(selectedComponent.value.id);
    closeDeleteComponentModal();
    await fetchComponents();
  } catch (err) {
    alert(err.response?.data?.message ?? "Failed to delete component.");
  } finally {
    componentSaving.value = false;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
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

// Returns the current total weight for a subject (excluding the selected component when editing)
function weightForSubject(subjectId) {
  const relevant = components.value.filter((c) => {
    if (String(c.subject_id) !== String(subjectId)) return false;
    if (isEditingComponent.value && c.id === selectedComponent.value?.id)
      return false;
    return true;
  });
  return relevant.reduce((sum, c) => sum + Number(c.weight), 0);
}
</script>
