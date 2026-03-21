<template>
  <div>
    <div v-if="loading">
      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-lg-3" v-for="n in 4" :key="n">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="skeleton mb-2" style="width: 110px; height: 13px; border-radius: 4px"></div>
              <div class="skeleton mb-2" style="width: 56px; height: 32px; border-radius: 4px"></div>
              <div v-if="n === 2" class="skeleton" style="width: 80px; height: 13px; border-radius: 4px"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="skeleton mb-2" style="width: 180px; height: 18px; border-radius: 4px"></div>
          <div class="skeleton" style="width: 220px; height: 13px; border-radius: 4px"></div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-lg-3" v-for="card in statCards" :key="card.label">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">{{ card.label }}</div>
              <div class="fs-4 fw-bold">
                <span v-if="loading">—</span>
                <span v-else>{{ card.value }}</span>
              </div>
              <div v-if="card.sub" class="text-muted small mt-1">
                {{ card.sub }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert alert-warning small py-2">
        {{ error }}
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h6 class="fw-semibold mb-1">Welcome back, {{ auth.user?.name }}</h6>
          <p class="text-muted small mb-0">
            {{ currentSchoolYear() }} · Admin Dashboard
          </p>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-sm-6 col-lg-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Current Quarter</div>
              <div class="fs-4 fw-bold">
                <span v-if="loading">—</span>
                <span v-else>{{ quarterLabels[currentQuarter] }}</span>
              </div>
              <button v-for="q in 4" :key="q" class="btn btn-sm me-2" :disabled="updatingQuarter" :value="q"
                :class="currentQuarter == q ? 'btn-primary' : 'btn-secondary'" @click="updateQuarter">
                {{ quarterLabels[q] }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { studentService } from "@/services/student";
import { sectionService } from "@/services/grade";
import { subjectService } from "@/services/subject";
import { userService } from "@/services/user";
import { gradingQuarterService } from "@/services/grading";

const auth = useAuthStore();
const loading = ref(true);
const error = ref("");

const totalStudents = ref(null);
const totalTeachers = ref(null);
const totalSections = ref(null);
const totalSubjects = ref(null);
const currentQuarter = ref(null);
const updatingQuarter = ref(false);

const quarterLabels = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
};

const statCards = computed(() => [
  { label: "Total Students", value: totalStudents.value ?? "—" },
  {
    label: "Total Teachers",
    value: totalTeachers.value ?? "—",
    sub: "Faculty role",
  },
  { label: "Sections", value: totalSections.value ?? "—" },
  { label: "Subjects", value: totalSubjects.value ?? "—" },
]);

onMounted(async () => {
  try {
    const [studentsRes, usersRes, sectionsRes, subjectsRes, quarter] =
      await Promise.allSettled([
        studentService.getAll(1),
        userService.getAll(1),
        sectionService.getAll(),
        subjectService.getAll(1),
        gradingQuarterService.getQuarter(),
      ]);

    if (studentsRes.status === "fulfilled") {
      totalStudents.value = studentsRes.value.data.meta.total;
    }

    if (usersRes.status === "fulfilled") {
      const users = usersRes.value.data.data ?? [];
      totalTeachers.value = users.filter((u) =>
        u.roles?.some(
          (r) => (typeof r === "string" ? r : r.name) === "faculty",
        ),
      ).length;
    }

    if (sectionsRes.status === "fulfilled") {
      totalSections.value = sectionsRes.value.data.length;
    }

    if (subjectsRes.status === "fulfilled") {
      totalSubjects.value = subjectsRes.value.data.meta.total;
    }

    if (quarter.status === "fulfilled") {
      currentQuarter.value = quarter.value.data.current_quarter;
    }
  } catch {
    error.value = "Some stats could not be loaded.";
  } finally {
    loading.value = false;
  }
});

function currentSchoolYear() {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 7 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

async function updateQuarter(event) {
  if (updatingQuarter.value) return;

  const quarterValue = String(event.target.value);

  if (!Object.keys(quarterLabels).includes(String(quarterValue))) {
    console.error("Invalid quarter value:", quarterValue);
    return;
  }

  updatingQuarter.value = true;

  currentQuarter.value = quarterValue;

  try {
    await gradingQuarterService.updateQuarter({
      current_quarter: quarterValue,
    });
  } catch (error) {
    console.error(error);
  } finally {
    updatingQuarter.value = false;
  }
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
