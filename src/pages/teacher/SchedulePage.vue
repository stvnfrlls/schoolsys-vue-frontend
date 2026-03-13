<template>
  <div>
    <h5 class="fw-bold mb-4">My Schedule</h5>

    <!-- Filters -->
    <div class="row g-2 mb-3">
      <div class="col-sm-3">
        <input
          v-model="filterSchoolYear"
          type="text"
          class="form-control form-control-sm"
          placeholder="School Year (e.g. 2025-2026)" />
      </div>
      <div class="col-sm-2">
        <select v-model="filterSemester" class="form-select form-select-sm">
          <option value="">All Semesters</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="summer">Summer</option>
        </select>
      </div>
      <div class="col-sm-auto">
        <button class="btn btn-sm btn-outline-secondary" @click="fetchSchedule">
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
      <div v-for="g in 1" :key="g" class="mb-4">
        <!-- Day heading -->
        <div
          class="skeleton mb-2"
          :style="`width:${60 + ((g * 19) % 40)}px;height:16px;border-radius:3px`"></div>
        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr>
                  <th>
                    <div
                      class="skeleton"
                      style="
                        width: 36px;
                        height: 14px;
                        border-radius: 3px;
                      "></div>
                  </th>
                  <th>
                    <div
                      class="skeleton"
                      style="
                        width: 52px;
                        height: 14px;
                        border-radius: 3px;
                      "></div>
                  </th>
                  <th>
                    <div
                      class="skeleton"
                      style="
                        width: 52px;
                        height: 14px;
                        border-radius: 3px;
                      "></div>
                  </th>
                  <th>
                    <div
                      class="skeleton"
                      style="
                        width: 72px;
                        height: 14px;
                        border-radius: 3px;
                      "></div>
                  </th>
                  <th>
                    <div
                      class="skeleton"
                      style="
                        width: 68px;
                        height: 14px;
                        border-radius: 3px;
                      "></div>
                  </th>
                  <th>
                    <div
                      class="skeleton"
                      style="
                        width: 56px;
                        height: 14px;
                        border-radius: 3px;
                      "></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in 1" :key="r">
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
                      :style="`width:${70 + ((r * 19) % 50)}px;height:13px;border-radius:3px`"></div>
                  </td>
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
                      style="
                        width: 68px;
                        height: 13px;
                        border-radius: 3px;
                      "></div>
                  </td>
                  <td>
                    <div
                      class="skeleton"
                      style="
                        width: 28px;
                        height: 13px;
                        border-radius: 3px;
                      "></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-5 text-danger">
      {{ error }}
    </div>

    <div v-else>
      <!-- Group by day -->
      <div v-if="schedules.length === 0" class="text-center text-muted py-5">
        No schedule found.
      </div>

      <div v-for="day in activeDays" :key="day" class="mb-4">
        <h6 class="fw-semibold text-capitalize mb-2">{{ day }}</h6>
        <div class="card border-0 shadow-sm">
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Grade Level</th>
                  <th>School Year</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in byDay(day)" :key="s.id">
                  <td class="text-nowrap">
                    {{ formatTime(s.start_time) }} –
                    {{ formatTime(s.end_time) }}
                  </td>
                  <td>{{ s.subject?.name ?? "—" }}</td>
                  <td>{{ s.section?.name ?? "—" }}</td>
                  <td>{{ s.section?.grade_level?.name ?? "—" }}</td>
                  <td class="text-muted small">{{ s.school_year }}</td>
                  <td class="text-muted small text-capitalize">
                    {{ s.semester }}
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
import { teacherService } from "@/services/teacher";

const schedules = ref([]);
const loading = ref(false);
const error = ref("");
const filterSchoolYear = ref("");
const filterSemester = ref("");

const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday"];

const activeDays = computed(() =>
  dayOrder.filter((d) => schedules.value.some((s) => s.day === d)),
);

function byDay(day) {
  return schedules.value.filter((s) => s.day === day);
}

onMounted(fetchSchedule);

async function fetchSchedule() {
  loading.value = true;
  error.value = "";
  try {
    const res = await teacherService.mySchedule({
      school_year: filterSchoolYear.value || undefined,
      semester: filterSemester.value || undefined,
    });
    schedules.value = res.data;
  } catch {
    error.value = "Failed to load schedule.";
  } finally {
    loading.value = false;
  }
}

function clearFilters() {
  filterSchoolYear.value = "";
  filterSemester.value = "";
  fetchSchedule();
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
