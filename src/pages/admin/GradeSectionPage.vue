<template>
  <div>
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tab === 'grades' }" @click="tab = 'grades'">
          Grade Levels
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tab === 'sections' }" @click="tab = 'sections'">
          Sections
        </button>
      </li>
    </ul>

    <div v-if="tab === 'grades'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="fw-bold mb-0">Grade Levels</h6>
        <button class="btn btn-primary btn-sm" @click="openCreateGrade">
          + Add Grade
        </button>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div v-if="gradesLoading">
            <LoadingTable :headers="['#', 'Name', 'Level', 'Sections', 'Status', 'Actions']"
              loading-text="Loading grade levels..." />
          </div>

          <div v-else-if="gradesError" class="text-center py-5 text-danger">
            {{ gradesError }}
          </div>
          <table v-else class="table table-hover mb-0">
            <thead class="table-light">
              <tr class="text-center">
                <th>#</th>
                <th>Name</th>
                <th>Level</th>
                <th>Sections</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="grade in grades" :key="grade.id" class="text-center">
                <td class="text-muted small">{{ grade.id }}</td>
                <td>{{ grade.name }}</td>
                <td>{{ grade.level }}</td>
                <td>{{ grade.sections_count }}</td>
                <td>
                  <span :class="grade.is_active ? 'badge bg-success' : 'badge bg-danger'
                    ">
                    {{ grade.is_active ? "Active" : "Inactive" }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" @click="openEditGrade(grade)">
                    Edit
                  </button>
                  <button class="btn btn-sm me-1" :class="grade.is_active
                    ? 'btn-outline-warning'
                    : 'btn-outline-success'
                    " @click="toggleGrade(grade)">
                    {{ grade.is_active ? "Deactivate" : "Activate" }}
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteGrade(grade)">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Sections Tab -->
    <div v-if="tab === 'sections'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="fw-bold mb-0">Sections</h6>
        <button class="btn btn-primary btn-sm" @click="openCreateSection">
          + Add Section
        </button>
      </div>

      <div class="mb-3" style="max-width: 250px">
        <select v-model="filterGradeId" class="form-select form-select-sm">
          <option value="">All Grade Levels</option>
          <option v-for="g in grades" :key="g.id" :value="g.id">
            {{ g.name }}
          </option>
        </select>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div v-if="sectionsLoading">
            <LoadingTable :headers="['#', 'Section', 'Grade Level', 'Room', 'Capacity', 'Status', 'Actions']"
              loading-text="Loading sections..." />
          </div>

          <div v-else-if="sectionsError" class="text-center py-5 text-danger">
            {{ sectionsError }}
          </div>
          <table v-else class="table table-hover mb-0">
            <thead class="table-light">
              <tr class="text-center">
                <th>#</th>
                <th>Section</th>
                <th>Grade Level</th>
                <th>Room</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="section in filteredSections" :key="section.id" class="text-center">
                <td class="text-muted small">{{ section.id }}</td>
                <td>{{ section.name }}</td>
                <td>{{ section.grade_level.name }}</td>
                <td>{{ section.room }}</td>
                <td>{{ section.capacity }}</td>
                <td>
                  <span :class="section.is_active ? 'badge bg-success' : 'badge bg-danger'
                    ">
                    {{ section.is_active ? "Active" : "Inactive" }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" @click="openEditSection(section)">
                    Edit
                  </button>
                  <button class="btn btn-sm me-1" :class="section.is_active
                    ? 'btn-outline-warning'
                    : 'btn-outline-success'
                    " @click="toggleSection(section)">
                    {{ section.is_active ? "Deactivate" : "Activate" }}
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteSection(section)">
                    Delete
                  </button>
                </td>
              </tr>
              <tr v-if="filteredSections.length === 0">
                <td colspan="7" class="text-center text-muted py-4">
                  No sections found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="gradeModal" tabindex="-1" ref="gradeModalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">
              {{ isEditingGrade ? "Edit Grade Level" : "Add Grade Level" }}
            </h6>
            <button type="button" class="btn-close" @click="closeGradeModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="gradeFormError" class="alert alert-danger py-2 small">
              {{ gradeFormError }}
            </div>
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input v-model="gradeForm.name" type="text" class="form-control" placeholder="e.g. Grade 7" />
            </div>
            <div class="mb-3">
              <label class="form-label">Level</label>
              <input v-model.number="gradeForm.level" type="number" class="form-control" placeholder="e.g. 7" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeGradeModal">
              Cancel
            </button>
            <button class="btn btn-primary btn-sm" :disabled="gradeSaving" @click="saveGrade">
              <span v-if="gradeSaving" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditingGrade ? "Update" : "Create" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="sectionModal" tabindex="-1" ref="sectionModalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">
              {{ isEditingSection ? "Edit Section" : "Add Section" }}
            </h6>
            <button type="button" class="btn-close" @click="closeSectionModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="sectionFormError" class="alert alert-danger py-2 small">
              {{ sectionFormError }}
            </div>
            <div class="mb-3">
              <label class="form-label">Grade Level</label>
              <select v-model="sectionForm.grade_level_id" class="form-select">
                <option disabled value="">Select grade level</option>
                <option v-for="g in grades" :key="g.id" :value="g.id">
                  {{ g.name }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Section Name</label>
              <input v-model="sectionForm.name" type="text" class="form-control" placeholder="e.g. Section A" />
            </div>
            <div class="mb-3">
              <label class="form-label">Room</label>
              <input v-model="sectionForm.room" type="text" class="form-control" placeholder="e.g. Room 101" />
            </div>
            <div class="mb-3">
              <label class="form-label">Capacity</label>
              <input v-model.number="sectionForm.capacity" type="number" class="form-control" placeholder="e.g. 40" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeSectionModal">
              Cancel
            </button>
            <button class="btn btn-primary btn-sm" :disabled="sectionSaving" @click="saveSection">
              <span v-if="sectionSaving" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditingSection ? "Update" : "Create" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="deletGSModal" tabindex="-1" ref="deleteModalEl">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <p class="mb-1 fw-semibold">Delete {{ deleteTarget?.type }}?</p>
            <p class="text-muted small mb-3">{{ deleteTarget?.name }}</p>
            <button class="btn btn-danger btn-sm me-2" :disabled="deleteSaving" @click="executeDelete">
              <span v-if="deleteSaving" class="spinner-border spinner-border-sm me-1"></span>
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
import LoadingTable from '../../components/LoadingTable.vue';
import { Modal } from "bootstrap";
import { gradeLevelService, sectionService } from "@/services/grade";

const tab = ref("grades");

const grades = ref([]);
const sections = ref([]);
const filterGradeId = ref("");
const gradesLoading = ref(false);
const sectionsLoading = ref(false);
const gradesError = ref("");
const sectionsError = ref("");
const isEditingGrade = ref(false);
const selectedGrade = ref(null);
const gradeForm = ref({ name: "", level: "" });
const gradeFormError = ref("");
const gradeSaving = ref(false);
const isEditingSection = ref(false);
const selectedSection = ref(null);
const sectionForm = ref({
  grade_level_id: "",
  name: "",
  room: "",
  capacity: "",
});
const sectionFormError = ref("");
const sectionSaving = ref(false);
const deleteTarget = ref(null);
const deleteSaving = ref(false);
const gradeModalEl = ref(null);
const sectionModalEl = ref(null);
const deleteModalEl = ref(null);
let gradeModal = null;
let sectionModal = null;
let deleteModal = null;

onMounted(async () => {
  gradeModal = new Modal(gradeModalEl.value);
  sectionModal = new Modal(sectionModalEl.value);
  deleteModal = new Modal(deleteModalEl.value);
  await fetchGrades();
  await fetchSections();
});

const filteredSections = computed(() => {
  if (!filterGradeId.value) return sections.value;
  return sections.value.filter((s) => s.grade_level_id === filterGradeId.value);
});

async function fetchGrades() {
  gradesLoading.value = true;
  gradesError.value = "";
  try {
    const res = await gradeLevelService.getAll();
    grades.value = res.data;
  } catch {
    gradesError.value = "Failed to load grade levels.";
  } finally {
    gradesLoading.value = false;
  }
}

async function fetchSections() {
  sectionsLoading.value = true;
  sectionsError.value = "";
  try {
    const res = await sectionService.getAll();
    sections.value = res.data;
  } catch {
    sectionsError.value = "Failed to load sections.";
  } finally {
    sectionsLoading.value = false;
  }
}

function openCreateGrade() {
  isEditingGrade.value = false;
  gradeForm.value = { name: "", level: "" };
  gradeFormError.value = "";
  gradeModal.show();
}

function openEditGrade(grade) {
  isEditingGrade.value = true;
  selectedGrade.value = grade;
  gradeForm.value = { name: grade.name, level: grade.level };
  gradeFormError.value = "";
  gradeModal.show();
}

function closeGradeModal() {
  gradeModal.hide();
}

async function saveGrade() {
  gradeFormError.value = "";
  if (!gradeForm.value.name || !gradeForm.value.level) {
    gradeFormError.value = "Name and level are required.";
    return;
  }
  gradeSaving.value = true;
  try {
    if (isEditingGrade.value) {
      await gradeLevelService.update(selectedGrade.value.id, gradeForm.value);
    } else {
      await gradeLevelService.create(gradeForm.value);
    }
    closeGradeModal();
    await fetchGrades();
  } catch (err) {
    gradeFormError.value =
      err.response?.data?.message ?? "Something went wrong.";
  } finally {
    gradeSaving.value = false;
  }
}

async function toggleGrade(grade) {
  try {
    grade.is_active
      ? await gradeLevelService.deactivate(grade.id)
      : await gradeLevelService.activate(grade.id);
    await fetchGrades();
  } catch (err) {
    alert(err.response?.data?.message ?? "Failed to update grade status.");
  }
}

function confirmDeleteGrade(grade) {
  deleteTarget.value = {
    id: grade.id,
    name: grade.name,
    type: "grade level",
    kind: "grade",
  };
  deleteModal.show();
}

function openCreateSection() {
  isEditingSection.value = false;
  sectionForm.value = { grade_level_id: "", name: "", room: "", capacity: "" };
  sectionFormError.value = "";
  sectionModal.show();
}

function openEditSection(section) {
  isEditingSection.value = true;
  selectedSection.value = section;
  sectionForm.value = {
    grade_level_id: section.id,
    name: section.name,
    room: section.room,
    capacity: section.capacity,
  };
  sectionFormError.value = "";
  sectionModal.show();
}

function closeSectionModal() {
  sectionModal.hide();
}

async function saveSection() {
  sectionFormError.value = "";
  if (!sectionForm.value.grade_level_id || !sectionForm.value.name) {
    sectionFormError.value = "Grade level and section name are required.";
    return;
  }
  sectionSaving.value = true;
  try {
    if (isEditingSection.value) {
      await sectionService.update(selectedSection.value.id, sectionForm.value);
    } else {
      await sectionService.create(sectionForm.value);
    }
    closeSectionModal();
    await fetchSections();
  } catch (err) {
    sectionFormError.value =
      err.response?.data?.message ?? "Something went wrong.";
  } finally {
    sectionSaving.value = false;
  }
}

async function toggleSection(section) {
  try {
    section.is_active
      ? await sectionService.deactivate(section.id)
      : await sectionService.activate(section.id);
    await fetchSections();
  } catch (err) {
    alert(err.response?.data?.message ?? "Failed to update section status.");
  }
}

function confirmDeleteSection(section) {
  deleteTarget.value = {
    id: section.id,
    name: `${section.grade_level.name} - ${section.name}`,
    type: "section",
    kind: "section",
  };
  deleteModal.show();
}

function closeDeleteModal() {
  deleteModal.hide();
}

async function executeDelete() {
  deleteSaving.value = true;
  try {
    if (deleteTarget.value.kind === "grade") {
      await gradeLevelService.delete(deleteTarget.value.id);
      await fetchGrades();
    } else {
      await sectionService.delete(deleteTarget.value.id);
      await fetchSections();
    }
    closeDeleteModal();
  } catch (err) {
    alert(err.response?.data?.message ?? "Failed to delete.");
  } finally {
    deleteSaving.value = false;
  }
}
</script>