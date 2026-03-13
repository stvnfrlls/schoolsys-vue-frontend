<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="fw-bold mb-0">Scheduling</h5>
      <button class="btn btn-primary btn-sm" @click="openCreate">
        + Add Schedule
      </button>
    </div>

    <!-- Filters -->
    <div class="row g-2 mb-3">
      <div class="col-sm-3">
        <select v-model="filterSectionId" class="form-select form-select-sm">
          <option value="">All Sections</option>
          <option v-for="s in sections" :key="s.id" :value="s.id">
            {{ s.grade_level?.name }} — {{ s.name }}
          </option>
        </select>
      </div>
      <div class="col-sm-2">
        <select v-model="filterDay" class="form-select form-select-sm">
          <option value="">All Days</option>
          <option v-for="d in days" :key="d.value" :value="d.value">
            {{ d.label }}
          </option>
        </select>
      </div>
      <div class="col-sm-2">
        <select v-model="filterSemester" class="form-select form-select-sm">
          <option value="">All Semesters</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="summer">Summer</option>
        </select>
      </div>
      <div class="col-sm-2">
        <input
          v-model="filterSchoolYear"
          type="text"
          class="form-control form-control-sm"
          placeholder="School Year (e.g. 2025-2026)" />
      </div>
      <div class="col-sm-auto">
        <button class="btn btn-sm btn-outline-secondary" @click="applyFilters">
          Filter
        </button>
        <button
          class="btn btn-sm btn-link text-muted ms-1"
          @click="clearFilters">
          Clear
        </button>
      </div>
    </div>

    <!-- ── Skeleton loading ───────────────────────────────────────────────── -->
    <div v-if="loading">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 40px">
                  <div
                    class="skeleton"
                    style="width: 14px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div
                    class="skeleton"
                    style="width: 28px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div
                    class="skeleton"
                    style="width: 36px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div
                    class="skeleton"
                    style="width: 52px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div
                    class="skeleton"
                    style="width: 52px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div
                    class="skeleton"
                    style="width: 52px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div
                    class="skeleton"
                    style="width: 68px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div
                    class="skeleton"
                    style="width: 56px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div
                    class="skeleton"
                    style="width: 52px; height: 14px; border-radius: 3px"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in 8" :key="r">
                <td>
                  <div
                    class="skeleton"
                    style="width: 22px; height: 13px; border-radius: 3px"></div>
                </td>
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${50 + ((r * 7) % 26)}px;height:20px;border-radius:4px`"></div>
                </td>
                <td>
                  <div
                    class="skeleton"
                    style="
                      width: 120px;
                      height: 13px;
                      border-radius: 3px;
                    "></div>
                </td>
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${70 + ((r * 19) % 50)}px;height:14px;border-radius:3px`"></div>
                </td>
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${56 + ((r * 11) % 28)}px;height:14px;border-radius:3px`"></div>
                </td>
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${90 + ((r * 21) % 50)}px;height:14px;border-radius:3px`"></div>
                </td>
                <td>
                  <div
                    class="skeleton"
                    style="width: 68px; height: 13px; border-radius: 3px"></div>
                </td>
                <td>
                  <div
                    class="skeleton"
                    style="width: 28px; height: 13px; border-radius: 3px"></div>
                </td>
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
                <th>Day</th>
                <th>Time</th>
                <th>Subject</th>
                <th>Section</th>
                <th>Teacher</th>
                <th>School Year</th>
                <th>Semester</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="schedules.length === 0">
                <td colspan="9" class="text-center text-muted py-5">
                  No schedules found.
                </td>
              </tr>
              <tr v-for="schedule in schedules" :key="schedule.id">
                <td class="text-muted small">{{ schedule.id }}</td>
                <td>
                  <span class="badge bg-light text-dark border text-capitalize">
                    {{ schedule.day }}
                  </span>
                </td>
                <td class="text-muted small">
                  {{ formatTime(schedule.start_time) }} –
                  {{ formatTime(schedule.end_time) }}
                </td>
                <td>{{ schedule.subject?.name ?? "—" }}</td>
                <td>{{ schedule.section?.name ?? "—" }}</td>
                <td>
                  {{
                    schedule.teacher ? teacherFullName(schedule.teacher) : "—"
                  }}
                </td>
                <td class="text-muted small">{{ schedule.school_year }}</td>
                <td class="text-capitalize text-muted small">
                  {{ schedule.semester }}
                </td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="openEdit(schedule)">
                    Edit
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(schedule)">
                    Delete
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
            @click="fetchSchedules(pagination.current_page - 1)">
            Prev
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="pagination.current_page === pagination.last_page"
            @click="fetchSchedules(pagination.current_page + 1)">
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modals: outside v-if/v-else so they are never destroyed ───────── -->

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="scheduleModal" tabindex="-1" ref="modalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">
              {{ isEditing ? "Edit Schedule" : "Add Schedule" }}
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

            <div class="mb-3">
              <label class="form-label">Section</label>
              <select
                v-model="form.section_id"
                class="form-select"
                @change="onSectionChange">
                <option disabled value="">Select section</option>
                <option v-for="s in sections" :key="s.id" :value="s.id">
                  {{ s.grade_level?.name }} — {{ s.name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">
                Subject
                <span v-if="!form.section_id" class="text-muted small"
                  >(select a section first)</span
                >
              </label>
              <select
                v-model="form.subject_id"
                class="form-select"
                :disabled="!form.section_id">
                <option disabled value="">Select subject</option>
                <option v-for="s in filteredSubjects" :key="s.id" :value="s.id">
                  {{ s.name }}<template v-if="s.code"> ({{ s.code }})</template>
                </option>
              </select>
              <div
                v-if="form.section_id && !subjectFilterActive"
                class="form-text text-warning">
                ⚠ Subjects haven't been assigned to grade levels yet — showing
                all subjects. Go to <strong>Subjects → Assign</strong> to set
                this up.
              </div>
              <div
                v-if="
                  form.section_id &&
                  subjectFilterActive &&
                  filteredSubjects.length === 0
                "
                class="form-text text-danger">
                No subjects are assigned to this section's grade level.
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Teacher</label>
              <select v-model="form.teacher_id" class="form-select">
                <option disabled value="">Select teacher</option>
                <option v-for="t in faculty" :key="t.id" :value="t.user_id">
                  {{ teacherFullName(t) }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Day</label>
              <select v-model="form.day" class="form-select">
                <option disabled value="">Select day</option>
                <option v-for="d in days" :key="d.value" :value="d.value">
                  {{ d.label }}
                </option>
              </select>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label">Start Time</label>
                <input
                  v-model="form.start_time"
                  type="time"
                  class="form-control" />
              </div>
              <div class="col">
                <label class="form-label">End Time</label>
                <input
                  v-model="form.end_time"
                  type="time"
                  class="form-control" />
              </div>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label">School Year</label>
                <input
                  v-model="form.school_year"
                  type="text"
                  class="form-control"
                  placeholder="e.g. 2025-2026" />
              </div>
              <div class="col">
                <label class="form-label">Semester</label>
                <select v-model="form.semester" class="form-select">
                  <option disabled value="">Select semester</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="summer">Summer</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeModal">
              Cancel
            </button>
            <button
              class="btn btn-primary btn-sm"
              :disabled="saving"
              @click="saveSchedule">
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? "Update" : "Create" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div
      class="modal fade"
      id="deleteScheduleModal"
      tabindex="-1"
      ref="deleteModalEl">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <p class="mb-1 fw-semibold">Delete schedule?</p>
            <p class="text-muted small mb-1">
              {{ selectedSchedule?.subject?.name }}
            </p>
            <p class="text-muted small mb-3 text-capitalize">
              {{ selectedSchedule?.day }} ·
              {{ formatTime(selectedSchedule?.start_time) }} –
              {{ formatTime(selectedSchedule?.end_time) }}
            </p>
            <button
              class="btn btn-danger btn-sm me-2"
              :disabled="saving"
              @click="deleteSchedule">
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
import { ref, computed, onMounted, nextTick } from "vue";
import { Modal } from "bootstrap";
import { scheduleService, facultyService } from "@/services/schedule";
import { sectionService } from "@/services/grade";
import { subjectService } from "@/services/subject";

const schedules = ref([]);
const sections = ref([]);
const subjects = ref([]);
const faculty = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const formError = ref("");
const isEditing = ref(false);
const selectedSchedule = ref(null);
const pagination = ref({});

const filterSectionId = ref("");
const filterDay = ref("");
const filterSemester = ref("");
const filterSchoolYear = ref("");

const form = ref({
  section_id: "",
  subject_id: "",
  teacher_id: "",
  day: "",
  start_time: "",
  end_time: "",
  school_year: currentSchoolYear(),
  semester: "",
});

const modalEl = ref(null);
const deleteModalEl = ref(null);
let modalInstance = null;
let deleteModalInstance = null;

const days = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
];

onMounted(async () => {
  modalInstance = new Modal(modalEl.value);
  deleteModalInstance = new Modal(deleteModalEl.value);
  await Promise.all([
    fetchSchedules(),
    fetchSections(),
    fetchSubjects(),
    fetchFaculty(),
  ]);
});

const subjectFilterActive = computed(() => {
  if (!form.value.section_id) return false;
  const section = sections.value.find((s) => s.id === form.value.section_id);
  if (!section?.grade_level?.id) return false;
  return subjects.value.some((sub) => sub.grade_levels?.length > 0);
});

const filteredSubjects = computed(() => {
  if (!subjectFilterActive.value) return subjects.value;
  const section = sections.value.find((s) => s.id === form.value.section_id);
  return subjects.value.filter((sub) =>
    sub.grade_levels?.some((gl) => gl.id === section.grade_level.id),
  );
});

async function fetchSchedules(page = 1) {
  loading.value = true;
  error.value = "";
  try {
    const filters = {
      section_id: filterSectionId.value || undefined,
      day: filterDay.value || undefined,
      semester: filterSemester.value || undefined,
      school_year: filterSchoolYear.value || undefined,
    };
    const res = await scheduleService.getAll(page, filters);
    schedules.value = res.data.data;
    pagination.value = {
      current_page: res.data.current_page,
      last_page: res.data.last_page,
      from: res.data.from,
      to: res.data.to,
      total: res.data.total,
    };
  } catch {
    error.value = "Failed to load schedules.";
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

function applyFilters() {
  fetchSchedules(1);
}

function clearFilters() {
  filterSectionId.value = "";
  filterDay.value = "";
  filterSemester.value = "";
  filterSchoolYear.value = "";
  fetchSchedules(1);
}

async function openCreate() {
  isEditing.value = false;
  form.value = {
    section_id: "",
    subject_id: "",
    teacher_id: "",
    day: "",
    start_time: "",
    end_time: "",
    school_year: currentSchoolYear(),
    semester: "",
  };
  formError.value = "";
  await nextTick();
  modalInstance.show();
}

async function openEdit(schedule) {
  isEditing.value = true;
  selectedSchedule.value = schedule;
  form.value = {
    section_id: schedule.section_id,
    subject_id: schedule.subject_id,
    teacher_id: schedule.teacher_id,
    day: schedule.day,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    school_year: schedule.school_year,
    semester: schedule.semester,
  };
  formError.value = "";
  await nextTick();
  modalInstance.show();
}

function closeModal() {
  modalInstance.hide();
}

function confirmDelete(schedule) {
  selectedSchedule.value = schedule;
  deleteModalInstance.show();
}

function closeDeleteModal() {
  deleteModalInstance.hide();
}

function onSectionChange() {
  form.value.subject_id = "";
}

async function saveSchedule() {
  formError.value = "";
  const required = [
    "section_id",
    "subject_id",
    "teacher_id",
    "day",
    "start_time",
    "end_time",
    "school_year",
    "semester",
  ];
  const missing = required.filter((f) => !form.value[f]);
  if (missing.length) {
    formError.value = "Please fill in all required fields.";
    return;
  }
  if (form.value.start_time >= form.value.end_time) {
    formError.value = "End time must be after start time.";
    return;
  }
  saving.value = true;
  try {
    if (isEditing.value) {
      await scheduleService.update(selectedSchedule.value.id, form.value);
    } else {
      await scheduleService.create(form.value);
    }
    closeModal();
    await fetchSchedules(pagination.value.current_page || 1);
  } catch (err) {
    formError.value = err.response?.data?.message ?? "Something went wrong.";
  } finally {
    saving.value = false;
  }
}

async function deleteSchedule() {
  saving.value = true;
  try {
    await scheduleService.delete(selectedSchedule.value.id);
    closeDeleteModal();
    await fetchSchedules(pagination.value.current_page || 1);
  } catch (err) {
    alert(err.response?.data?.message ?? "Failed to delete schedule.");
  } finally {
    saving.value = false;
  }
}

function currentSchoolYear() {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 7 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
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

function formatTime(time) {
  if (!time) return "—";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
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
