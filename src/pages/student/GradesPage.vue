<template>
  <div>
    <h5 class="fw-bold mb-4">My Grades</h5>

    <div class="d-flex align-items-center gap-2 mb-4">
      <span class="small text-muted">Quarter:</span>
      <div class="d-flex gap-1">
        <button class="btn btn-sm" :class="filterQuarter === null ? 'btn-primary' : 'btn-outline-secondary'
          " @click="setQuarter(null)">
          All
        </button>
        <button v-for="q in [1, 2, 3, 4]" :key="q" class="btn btn-sm"
          :class="filterQuarter === q ? 'btn-primary' : 'btn-outline-secondary'" @click="setQuarter(q)">
          Q{{ q }}
        </button>
      </div>
    </div>

    <div v-if="loading">
      <div v-for="n in 1" :key="n" class="card border-0 shadow-sm mb-4 overflow-hidden">
        <div class="card-header bg-white py-3 d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <div class="skeleton" style="width: 160px; height: 16px; border-radius: 4px"></div>
            <div class="skeleton" style="width: 40px; height: 18px; border-radius: 4px"></div>
          </div>
          <div class="skeleton" style="width: 20px; height: 16px; border-radius: 4px"></div>
        </div>
        <div class="card-body p-0">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr>
                <th v-for="c in 5" :key="c">
                  <div class="skeleton" style="height: 12px; border-radius: 4px"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in 3" :key="r">
                <td v-for="c in 5" :key="c">
                  <div class="skeleton" :style="`height: 12px; border-radius: 4px; width: ${c === 1 ? '80%' : '50%'}`">
                  </div>
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
      <div v-if="grades.length === 0" class="text-center text-muted py-5">
        No grades found.
      </div>

      <div v-for="item in grades" :key="item.subject.id" class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white d-flex align-items-center justify-content-between py-3" style="cursor: pointer"
          @click="toggleSubject(item.subject.id)">
          <div class="d-flex align-items-center gap-2">
            <span class="fw-semibold">{{ item.subject.name }}</span>
            <span class="badge bg-secondary">{{ item.subject.code }}</span>
            <template v-if="isCollapsed(item.subject.id) && filterQuarter === null">
              <span v-for="q in availableQuarters(item)" :key="q" class="badge"
                :class="quarterFailing(item, q) ? 'bg-danger' : 'bg-success'">
                Q{{ q }}: {{ quarterGrade(item, q) }}
              </span>
            </template>
            <template v-if="
              isCollapsed(item.subject.id) &&
              filterQuarter !== null &&
              item.grades.length > 0
            ">
              <span class="badge" :class="item.grades[0].is_failing ? 'bg-danger' : 'bg-success'">
                {{ item.grades[0].final_grade }}
              </span>
            </template>
          </div>
          <span class="text-muted small">
            {{ isCollapsed(item.subject.id) ? "▸" : "▾" }}
          </span>
        </div>

        <div v-show="!isCollapsed(item.subject.id)" class="card-body p-0">
          <template v-if="filterQuarter === null">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr>
                  <th>Component</th>
                  <th class="text-center">Q1</th>
                  <th class="text-center">Q2</th>
                  <th class="text-center">Q3</th>
                  <th class="text-center">Q4</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="component in uniqueComponents(item)" :key="component.id">
                  <td>
                    {{ component.name }}
                    <span class="text-muted small ms-1">({{ component.weight }}%)</span>
                  </td>
                  <td v-for="q in [1, 2, 3, 4]" :key="q" class="text-center">
                    {{ weightedScoreFor(item, component.id, q) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-light fw-semibold">
                  <td>Quarter Grade</td>
                  <td v-for="q in [1, 2, 3, 4]" :key="q" class="text-center">
                    <template v-if="quarterGrade(item, q) !== null">
                      <span :class="quarterFailing(item, q)
                        ? 'text-danger'
                        : 'text-success'
                        ">
                        {{ quarterGrade(item, q) }}
                      </span>
                      <span class="badge ms-1" :class="quarterFailing(item, q) ? 'bg-danger' : 'bg-success'
                        ">
                        {{ quarterFailing(item, q) ? "F" : "P" }}
                      </span>
                    </template>
                    <span v-else class="text-muted">—</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </template>

          <template v-else>
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr>
                  <th>Component</th>
                  <th class="text-center">Weight</th>
                  <th class="text-center">Score</th>
                  <th class="text-center">Weighted Score</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="grade in item.grades" :key="grade.id">
                  <td>{{ grade.grading_component?.name ?? "—" }}</td>
                  <td class="text-center text-muted small">
                    {{ grade.grading_component?.weight }}%
                  </td>
                  <td class="text-center">{{ grade.score }}</td>
                  <td class="text-center">{{ grade.weighted_score }}</td>
                </tr>
              </tbody>
              <tfoot v-if="item.grades.length > 0">
                <tr class="table-light fw-semibold">
                  <td colspan="3">Quarter Grade</td>
                  <td class="text-center">
                    <span :class="item.grades[0].is_failing
                      ? 'text-danger'
                      : 'text-success'
                      ">
                      {{ item.grades[0].final_grade }}
                    </span>
                    <span class="badge ms-1" :class="item.grades[0].is_failing ? 'bg-danger' : 'bg-success'
                      ">
                      {{ item.grades[0].is_failing ? "Failing" : "Passing" }}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { studentService } from "@/services/student";

const grades = ref([]);
const loading = ref(false);
const error = ref("");
const filterQuarter = ref(null);

const collapsedSubjects = ref(new Set());

onMounted(fetchGrades);

async function fetchGrades() {
  loading.value = true;
  error.value = "";
  try {
    const res = await studentService.myGrades({
      quarter: filterQuarter.value ?? undefined,
    });
    grades.value = res.data;
  } catch (err) {
    error.value = err.response?.data?.message ?? "Failed to load grades.";
  } finally {
    loading.value = false;
  }
}

function setQuarter(q) {
  filterQuarter.value = q;
  fetchGrades();
}

function toggleSubject(subjectId) {
  if (collapsedSubjects.value.has(subjectId)) {
    collapsedSubjects.value.delete(subjectId);
  } else {
    collapsedSubjects.value.add(subjectId);
  }
  collapsedSubjects.value = new Set(collapsedSubjects.value);
}

function isCollapsed(subjectId) {
  return collapsedSubjects.value.has(subjectId);
}

function uniqueComponents(item) {
  const seen = new Map();
  for (const grade of item.grades) {
    const c = grade.grading_component;
    if (c && !seen.has(c.id)) seen.set(c.id, c);
  }
  return [...seen.values()];
}

function weightedScoreFor(item, componentId, quarter) {
  const grade = item.grades.find(
    (g) => g.grading_component_id === componentId && g.quarter === quarter,
  );
  return grade ? grade.weighted_score : "—";
}

function quarterGrade(item, quarter) {
  const grade = item.grades.find((g) => g.quarter === quarter);
  return grade?.final_grade ?? null;
}

function quarterFailing(item, quarter) {
  const grade = item.grades.find((g) => g.quarter === quarter);
  return grade?.is_failing ?? false;
}

function availableQuarters(item) {
  return [...new Set(item.grades.map((g) => g.quarter))].sort();
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
