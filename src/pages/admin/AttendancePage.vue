<template>
  <div>
    <!-- Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: tab === 'take' }"
          @click="tab = 'take'">
          Take Attendance
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: tab === 'flagged' }"
          @click="
            tab = 'flagged';
            fetchFlagged();
          ">
          Flagged Students
          <span v-if="flaggedCount > 0" class="badge bg-danger ms-1">
            {{ flaggedCount }}
          </span>
        </button>
      </li>
    </ul>

    <!-- ── Tab: Take Attendance ──────────────────────────────────────────── -->
    <div v-if="tab === 'take'">
      <!-- Filters -->
      <div class="row g-2 mb-3">
        <div class="col-sm-3">
          <select
            v-model="filterSectionId"
            class="form-select form-select-sm"
            @change="onSectionChange">
            <option value="">Select Section</option>
            <option v-for="s in sections" :key="s.id" :value="s.id">
              {{ s.grade_level?.name }} — {{ s.name }}
            </option>
          </select>
        </div>
        <div class="col-sm-3">
          <select
            v-model="filterSubjectId"
            class="form-select form-select-sm"
            :disabled="!filterSectionId">
            <option value="">Daily (no subject)</option>
            <option v-for="s in subjects" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>
        </div>
        <div class="col-sm-2">
          <input
            v-model="filterDate"
            type="date"
            class="form-control form-control-sm" />
        </div>
        <div class="col-sm-auto">
          <button
            class="btn btn-sm btn-outline-secondary"
            :disabled="!filterSectionId || !filterDate"
            @click="loadAttendanceSheet">
            Load
          </button>
        </div>
      </div>

      <!-- Sheet not loaded yet -->
      <div v-if="!sheetLoaded" class="text-center text-muted py-5">
        Select a section and date, then click Load.
      </div>

      <div v-else>
        <div v-if="sheetLoading" class="text-center py-5 text-muted">
          Loading...
        </div>
        <div v-else-if="sheetError" class="text-center py-5 text-danger">
          {{ sheetError }}
        </div>

        <div v-else>
          <!-- Bulk actions -->
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="small text-muted">Mark all as:</span>
            <button
              class="btn btn-sm btn-outline-success"
              @click="markAll('present')">
              Present
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              @click="markAll('absent')">
              Absent
            </button>
            <button
              class="btn btn-sm btn-outline-warning"
              @click="markAll('late')">
              Late
            </button>
            <div class="ms-auto small text-muted">
              {{ enrollments.length }} student(s) ·
              <span class="text-success"
                >{{ statusCount("present") }} present</span
              >
              ·
              <span class="text-danger"
                >{{ statusCount("absent") }} absent</span
              >
              ·
              <span class="text-warning">{{ statusCount("late") }} late</span>
            </div>
          </div>

          <!-- Attendance table -->
          <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Student</th>
                    <th>LRN</th>
                    <th>Status</th>
                    <th>
                      Remarks
                      <span class="text-muted fw-normal small">(optional)</span>
                    </th>
                    <th class="text-center">Save</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in attendanceSheet"
                    :key="row.enrollment.id"
                    :class="rowClass(row.status)">
                    <td>{{ fullName(row.enrollment.student) }}</td>
                    <td class="text-muted small">
                      {{ row.enrollment.student?.student_number ?? "—" }}
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        <button
                          v-for="s in statuses"
                          :key="s.value"
                          class="btn btn-sm"
                          :class="
                            row.status === s.value
                              ? row.attendanceId
                                ? s.activeClass
                                : s.outlineClass
                              : 'btn-outline-secondary'
                          "
                          @click="row.status = s.value">
                          {{ s.label }}
                        </button>
                      </div>
                    </td>
                    <td>
                      <input
                        v-model="row.remarks"
                        type="text"
                        class="form-control form-control-sm"
                        placeholder="e.g. Sick leave"
                        style="max-width: 200px" />
                    </td>
                    <td class="text-center">
                      <button
                        class="btn btn-sm btn-primary"
                        :disabled="savingRow === row.enrollment.id"
                        @click="saveRow(row)">
                        <span
                          v-if="savingRow === row.enrollment.id"
                          class="spinner-border spinner-border-sm"></span>
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

          <!-- Save all button -->
          <div
            class="d-flex justify-content-end mt-3"
            v-if="attendanceSheet.length > 0">
            <button
              class="btn btn-primary btn-sm"
              :disabled="savingAll"
              @click="saveAll">
              <span
                v-if="savingAll"
                class="spinner-border spinner-border-sm me-1"></span>
              Save All
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tab: Flagged Students ─────────────────────────────────────────── -->
    <div v-if="tab === 'flagged'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 class="fw-bold mb-0">Flagged Students</h6>
          <p class="text-muted small mb-0">
            Students with {{ absenceThreshold }} or more absences.
          </p>
        </div>
        <button class="btn btn-sm btn-outline-secondary" @click="fetchFlagged">
          Refresh
        </button>
      </div>

      <div v-if="flaggedLoading" class="text-center py-5 text-muted">
        Loading...
      </div>
      <div v-else-if="flaggedError" class="text-center py-5 text-danger">
        {{ flaggedError }}
      </div>
      <div v-else>
        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Student</th>
                  <th>LRN</th>
                  <th>Section</th>
                  <th class="text-center">Absences</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in flaggedStudents"
                  :key="item.id"
                  class="table-warning">
                  <td>{{ fullName(item.student) }}</td>
                  <td class="text-muted small">
                    {{ item.student?.student_number ?? "—" }}
                  </td>
                  <td>
                    {{ item.section?.grade_level?.name ?? "—" }} —
                    {{ item.section?.name ?? "—" }}
                  </td>
                  <td class="text-center">
                    <span class="badge bg-danger">
                      {{ item.absence_count }}
                    </span>
                  </td>
                </tr>
                <tr v-if="flaggedStudents.length === 0">
                  <td colspan="4" class="text-center text-muted py-4">
                    No flagged students.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { attendanceService } from "@/services/attendance";
import { sectionService } from "@/services/grade";
import { subjectService } from "@/services/subject";
import { enrollmentService } from "@/services/enrollment";

// ── Tab ───────────────────────────────────────────────────────────────────
const tab = ref("take");

// ── Shared data ───────────────────────────────────────────────────────────
const sections = ref([]);
const subjects = ref([]);

// ── Take Attendance ───────────────────────────────────────────────────────
const filterSectionId = ref("");
const filterSubjectId = ref("");
const filterDate = ref(todayDate());

const enrollments = ref([]);
const attendanceSheet = ref([]); // [{ enrollment, status, remarks }]
const sheetLoaded = ref(false);
const sheetLoading = ref(false);
const sheetError = ref("");
const savingRow = ref(null);
const savingAll = ref(false);

// ── Flagged ───────────────────────────────────────────────────────────────
const flaggedStudents = ref([]);
const flaggedLoading = ref(false);
const flaggedError = ref("");
const absenceThreshold = 5; // mirrors Attendance::ABSENCE_THRESHOLD

const flaggedCount = computed(() => flaggedStudents.value.length);

// ── Constants ─────────────────────────────────────────────────────────────
const statuses = [
  {
    value: "present",
    label: "Present",
    activeClass: "btn-success",
    outlineClass: "btn-outline-success",
  },
  {
    value: "absent",
    label: "Absent",
    activeClass: "btn-danger",
    outlineClass: "btn-outline-danger",
  },
  {
    value: "late",
    label: "Late",
    activeClass: "btn-warning text-dark",
    outlineClass: "btn-outline-warning",
  },
];

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([fetchSections(), fetchSubjects()]);
});

// ── Fetch ─────────────────────────────────────────────────────────────────
async function fetchSections() {
  const res = await sectionService.getAll();
  sections.value = res.data;
}

async function fetchSubjects() {
  const res = await subjectService.getAll(1);
  subjects.value = res.data?.data ?? res.data;
}

async function loadAttendanceSheet() {
  if (!filterSectionId.value || !filterDate.value) return;

  sheetLoaded.value = true;
  sheetLoading.value = true;
  sheetError.value = "";

  try {
    // 1. Load active enrollments for this section
    const res = await enrollmentService.getAll(1, {});
    const all = res.data?.data ?? res.data;
    enrollments.value = all.filter(
      (e) =>
        String(e.section_id) === String(filterSectionId.value) &&
        e.status === "active",
    );

    // 2. Load existing attendance records for this date (+ optional subject)
    const filters = { date: filterDate.value };
    if (filterSubjectId.value) filters.subject_id = filterSubjectId.value;
    const attRes = await attendanceService.getAll(filters);
    const existing = attRes.data;

    // 3. Build sheet rows — merge enrollments with any existing records
    attendanceSheet.value = enrollments.value.map((enrollment) => {
      const record = existing.find((a) => a.enrollment_id === enrollment.id);
      return {
        enrollment,
        attendanceId: record?.id ?? null,
        status: record?.status ?? "present", // default to present
        remarks: record?.remarks ?? "",
      };
    });
  } catch {
    sheetError.value = "Failed to load attendance sheet.";
  } finally {
    sheetLoading.value = false;
  }
}

async function fetchFlagged() {
  flaggedLoading.value = true;
  flaggedError.value = "";
  try {
    const res = await attendanceService.flagged();
    flaggedStudents.value = res.data;
  } catch (err) {
    // Surface a helpful message if the route isn't registered yet
    if (err.response?.status === 404) {
      flaggedError.value =
        "The /attendance/flagged route is not registered. Add it to routes/api.php.";
    } else {
      flaggedError.value = "Failed to load flagged students.";
    }
  } finally {
    flaggedLoading.value = false;
  }
}

// ── Section change ─────────────────────────────────────────────────────────
function onSectionChange() {
  filterSubjectId.value = "";
  sheetLoaded.value = false;
  attendanceSheet.value = [];
}

// ── Attendance actions ────────────────────────────────────────────────────
function markAll(status) {
  attendanceSheet.value.forEach((row) => (row.status = status));
}

async function saveRow(row) {
  savingRow.value = row.enrollment.id;
  try {
    const res = await attendanceService.save({
      enrollment_id: row.enrollment.id,
      subject_id: filterSubjectId.value || null,
      date: filterDate.value,
      status: row.status,
      remarks: row.remarks || null,
    });
    // Mark row as saved so buttons switch to filled color
    row.attendanceId = res.data.id;
  } catch (err) {
    alert(err.response?.data?.message ?? "Failed to save attendance.");
  } finally {
    savingRow.value = null;
  }
}

async function saveAll() {
  savingAll.value = true;
  try {
    await Promise.all(
      attendanceSheet.value.map(async (row) => {
        const res = await attendanceService.save({
          enrollment_id: row.enrollment.id,
          subject_id: filterSubjectId.value || null,
          date: filterDate.value,
          status: row.status,
          remarks: row.remarks || null,
        });
        // Mark each row as saved so buttons switch to filled color
        row.attendanceId = res.data.id;
      }),
    );
  } catch (err) {
    alert(
      err.response?.data?.message ?? "Failed to save some attendance records.",
    );
  } finally {
    savingAll.value = false;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function todayDate() {
  return new Date().toISOString().split("T")[0];
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

function statusCount(status) {
  return attendanceSheet.value.filter((r) => r.status === status).length;
}

function rowClass(status) {
  if (status === "absent") return "table-danger";
  if (status === "late") return "table-warning";
  return "";
}
</script>
