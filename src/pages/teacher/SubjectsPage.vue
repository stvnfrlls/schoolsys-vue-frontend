<template>
  <div>
    <h5 class="fw-bold mb-4">My Subjects</h5>

    <!-- ── Skeleton: subjects list ────────────────────────────────────────── -->
    <div v-if="loading">
      <div v-for="g in 3" :key="g" class="card border-0 shadow-sm mb-4">
        <!-- card-header -->
        <div
          class="card-header bg-white d-flex align-items-center justify-content-between py-3">
          <div class="d-flex align-items-center gap-2">
            <div
              class="skeleton"
              :style="`width:${90 + ((g * 23) % 60)}px;height:16px;border-radius:3px`"></div>
            <div
              class="skeleton"
              style="width: 36px; height: 20px; border-radius: 12px"></div>
          </div>
          <div
            class="skeleton"
            style="width: 68px; height: 13px; border-radius: 3px"></div>
        </div>
        <!-- card-body table -->
        <div class="card-body p-0">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr>
                <th>
                  <div
                    class="skeleton"
                    style="width: 52px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div
                    class="skeleton"
                    style="width: 72px; height: 14px; border-radius: 3px"></div>
                </th>
                <th>
                  <div
                    class="skeleton"
                    style="width: 52px; height: 14px; border-radius: 3px"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in 3" :key="r">
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${56 + ((r * 11) % 28)}px;height:13px;border-radius:3px`"></div>
                </td>
                <td>
                  <div
                    class="skeleton"
                    :style="`width:${52 + ((r * 7) % 24)}px;height:13px;border-radius:3px`"></div>
                </td>
                <td>
                  <div
                    class="skeleton"
                    style="width: 90px; height: 26px; border-radius: 4px"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-5 text-danger">
      {{ error }}
    </div>

    <div v-else>
      <div v-if="subjects.length === 0" class="text-center text-muted py-5">
        No subjects assigned to you yet.
      </div>

      <!-- Subject cards -->
      <div
        v-for="item in subjects"
        :key="item.subject.id"
        class="card border-0 shadow-sm mb-4">
        <div
          class="card-header bg-white d-flex align-items-center justify-content-between py-3">
          <div>
            <span class="fw-semibold">{{ item.subject.name }}</span>
            <span class="badge bg-secondary ms-2">{{ item.subject.code }}</span>
          </div>
          <span class="text-muted small"
            >{{ item.sections.length }} section(s)</span
          >
        </div>
        <div class="card-body p-0">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Section</th>
                <th>Grade Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="section in item.sections" :key="section.id">
                <td>{{ section.name }}</td>
                <td>{{ section.grade_level?.name ?? "—" }}</td>
                <td>
                  <button
                    class="btn btn-sm btn-outline-primary me-1"
                    @click="openGrades(item.subject, section)">
                    Input Grades
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Grade Input Modal -->
    <div class="modal fade" id="gradeModal" tabindex="-1" ref="gradeModalEl">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <h6 class="modal-title fw-bold mb-0">
                Input Grades — {{ activeSubject?.name }}
              </h6>
              <div class="text-muted small">{{ activeSection?.name }}</div>
            </div>
            <button
              type="button"
              class="btn-close"
              @click="closeGradeModal"></button>
          </div>
          <div class="modal-body">
            <!-- Quarter selector -->
            <div class="d-flex align-items-center gap-3 mb-3">
              <label class="form-label mb-0">Quarter</label>
              <div class="d-flex gap-1">
                <button
                  v-for="q in [1, 2, 3, 4]"
                  :key="q"
                  class="btn btn-sm"
                  :class="
                    activeQuarter === q
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  "
                  @click="
                    activeQuarter = q;
                    loadGrades();
                  ">
                  Q{{ q }}
                </button>
              </div>
            </div>

            <!-- ── Skeleton: grade sheet ──────────────────────────────────── -->
            <div v-if="gradeLoading">
              <div class="table-responsive">
                <table class="table table-bordered table-sm small mb-0">
                  <thead class="table-light">
                    <tr>
                      <!-- Student col -->
                      <th>
                        <div
                          class="skeleton"
                          style="
                            width: 56px;
                            height: 14px;
                            border-radius: 3px;
                          "></div>
                      </th>
                      <!-- 3 placeholder component cols -->
                      <th v-for="c in 3" :key="c" class="text-center">
                        <div
                          class="skeleton mx-auto"
                          style="
                            width: 70px;
                            height: 14px;
                            border-radius: 3px;
                          "></div>
                        <div
                          class="skeleton mx-auto mt-1"
                          style="
                            width: 28px;
                            height: 11px;
                            border-radius: 3px;
                          "></div>
                      </th>
                      <!-- Final + Status -->
                      <th>
                        <div
                          class="skeleton mx-auto"
                          style="
                            width: 32px;
                            height: 14px;
                            border-radius: 3px;
                          "></div>
                      </th>
                      <th>
                        <div
                          class="skeleton mx-auto"
                          style="
                            width: 44px;
                            height: 14px;
                            border-radius: 3px;
                          "></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="r in 6" :key="r">
                      <td>
                        <div
                          class="skeleton"
                          :style="`width:${100 + ((r * 21) % 60)}px;height:13px;border-radius:3px`"></div>
                      </td>
                      <td v-for="c in 3" :key="c" class="text-center">
                        <div
                          class="skeleton mx-auto"
                          style="
                            width: 64px;
                            height: 28px;
                            border-radius: 3px;
                          "></div>
                      </td>
                      <td class="text-center">
                        <div
                          class="skeleton mx-auto"
                          style="
                            width: 32px;
                            height: 13px;
                            border-radius: 3px;
                          "></div>
                      </td>
                      <td class="text-center">
                        <div
                          class="skeleton mx-auto"
                          style="
                            width: 52px;
                            height: 20px;
                            border-radius: 12px;
                          "></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="gradeError" class="text-center py-4 text-danger">
              {{ gradeError }}
            </div>

            <div v-else>
              <div
                v-if="gradeComponents.length === 0"
                class="alert alert-warning small">
                No active grading components found for this subject. Ask your
                administrator to set them up.
              </div>

              <div v-else class="table-responsive">
                <table class="table table-bordered table-hover small mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="text-nowrap">Student</th>
                      <th
                        v-for="comp in gradeComponents"
                        :key="comp.id"
                        class="text-center text-nowrap">
                        {{ comp.name }}
                        <div
                          class="text-muted fw-normal"
                          style="font-size: 0.7rem">
                          {{ comp.weight }}%
                        </div>
                      </th>
                      <th class="text-center">Final</th>
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
                        v-for="comp in gradeComponents"
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
                        :colspan="gradeComponents.length + 3"
                        class="text-center text-muted py-4">
                        No enrolled students found.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="mt-2 small text-muted">
                Scores save automatically. Final grade computed by server.
                Failing threshold: below 75.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeGradeModal">
              Close
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
import { teacherService } from "@/services/teacher";
import {
  gradingComponentService,
  studentGradeService,
} from "@/services/grading";
import { enrollmentService } from "@/services/enrollment";

const subjects = ref([]);
const loading = ref(false);
const error = ref("");

// Grade modal state
const activeSubject = ref(null);
const activeSection = ref(null);
const activeQuarter = ref(1);
const gradeComponents = ref([]);
const enrollments = ref([]);
const existingGrades = ref([]);
const gradeLoading = ref(false);
const gradeError = ref("");
const savingCell = ref("");

const gradeModalEl = ref(null);
let gradeModal = null;

onMounted(async () => {
  gradeModal = new Modal(gradeModalEl.value);
  await fetchSubjects();
});

async function fetchSubjects() {
  loading.value = true;
  error.value = "";
  try {
    const res = await teacherService.mySubjects();
    subjects.value = res.data;
  } catch {
    error.value = "Failed to load subjects.";
  } finally {
    loading.value = false;
  }
}

async function openGrades(subject, section) {
  activeSubject.value = subject;
  activeSection.value = section;
  activeQuarter.value = 1;
  gradeModal.show();
  await loadGrades();
}

function closeGradeModal() {
  gradeModal.hide();
}

async function loadGrades() {
  gradeLoading.value = true;
  gradeError.value = "";
  try {
    const compRes = await gradingComponentService.getAll({
      subject_id: activeSubject.value.id,
      is_active: true,
    });
    gradeComponents.value = compRes.data;

    const enrRes = await enrollmentService.getAll(1, {});
    const all = enrRes.data?.data ?? enrRes.data;
    enrollments.value = all.filter(
      (e) =>
        String(e.section_id) === String(activeSection.value.id) &&
        e.status === "active",
    );

    const results = await Promise.all(
      enrollments.value.map((e) =>
        studentGradeService.getAll({
          enrollment_id: e.id,
          subject_id: activeSubject.value.id,
          quarter: activeQuarter.value,
        }),
      ),
    );
    existingGrades.value = results.flatMap((r) => r.data);
  } catch {
    gradeError.value = "Failed to load grades.";
  } finally {
    gradeLoading.value = false;
  }
}

const gradeSheet = computed(() =>
  enrollments.value.map((enrollment) => {
    const enrollmentGrades = existingGrades.value.filter(
      (g) => g.enrollment_id === enrollment.id,
    );
    const anyGrade = enrollmentGrades.find((g) => g.final_grade !== null);
    return {
      enrollment,
      grades: enrollmentGrades,
      finalGrade: anyGrade?.final_grade ?? null,
      isFailing: anyGrade?.is_failing ?? false,
    };
  }),
);

function getScore(row, componentId) {
  const grade = row.grades.find((g) => g.grading_component_id === componentId);
  return grade?.score ?? "";
}

function cellKey(enrollmentId, componentId) {
  return `${enrollmentId}-${componentId}`;
}

async function onScoreChange(row, component, event) {
  const rawValue = event.target.value;
  if (rawValue === "") return;

  const score = parseFloat(rawValue);
  if (isNaN(score) || score < 0 || score > 100) {
    event.target.value = getScore(row, component.id);
    return;
  }

  const key = cellKey(row.enrollment.id, component.id);
  savingCell.value = key;

  try {
    await studentGradeService.save({
      enrollment_id: row.enrollment.id,
      subject_id: activeSubject.value.id,
      grading_component_id: component.id,
      quarter: activeQuarter.value,
      score,
    });
    const res = await studentGradeService.getAll({
      enrollment_id: row.enrollment.id,
      subject_id: activeSubject.value.id,
      quarter: activeQuarter.value,
    });
    existingGrades.value = [
      ...existingGrades.value.filter(
        (g) => g.enrollment_id !== row.enrollment.id,
      ),
      ...res.data,
    ];
  } catch (err) {
    alert(err.response?.data?.message ?? "Failed to save grade.");
    event.target.value = getScore(row, component.id);
  } finally {
    savingCell.value = "";
  }
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
