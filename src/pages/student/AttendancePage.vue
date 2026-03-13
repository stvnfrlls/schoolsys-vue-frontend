<template>
  <div>
    <h5 class="fw-bold mb-4">My Attendance</h5>

    <!-- ── Skeleton loading ───────────────────────────────────────────────── -->
    <div v-if="loading">
      <!-- Summary cards skeleton -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-sm-3" v-for="n in 4" :key="n">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div
                class="skeleton mb-2"
                style="width: 70px; height: 12px; border-radius: 4px"></div>
              <div
                class="skeleton"
                style="width: 40px; height: 28px; border-radius: 4px"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table skeleton -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <table class="table table-sm mb-0">
            <thead class="table-light">
              <tr>
                <th v-for="c in 4" :key="c">
                  <div
                    class="skeleton"
                    style="height: 12px; border-radius: 4px"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in 5" :key="r">
                <td>
                  <div
                    class="skeleton"
                    style="width: 90px; height: 12px; border-radius: 4px"></div>
                </td>
                <td>
                  <div
                    class="skeleton"
                    style="
                      width: 120px;
                      height: 12px;
                      border-radius: 4px;
                    "></div>
                </td>
                <td class="text-center">
                  <div
                    class="skeleton mx-auto"
                    style="
                      width: 55px;
                      height: 20px;
                      border-radius: 12px;
                    "></div>
                </td>
                <td>
                  <div
                    class="skeleton"
                    style="width: 80px; height: 12px; border-radius: 4px"></div>
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
      <!-- Summary cards -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-sm-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Total Days</div>
              <div class="fs-4 fw-bold">{{ summary.total }}</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-sm-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Present</div>
              <div class="fs-4 fw-bold text-success">{{ summary.present }}</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-sm-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Absent</div>
              <div class="fs-4 fw-bold text-danger">{{ summary.absent }}</div>
            </div>
          </div>
        </div>
        <div class="col-6 col-sm-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="text-muted small mb-1">Late</div>
              <div class="fs-4 fw-bold text-warning">{{ summary.late }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Flagged warning -->
      <div
        v-if="summary.is_flagged"
        class="alert alert-danger d-flex align-items-center mb-4">
        <strong class="me-2">⚠ Flagged:</strong>
        You have {{ summary.absent }} absences. Excessive absences may affect
        your standing.
      </div>

      <!-- Filter by status -->
      <div class="d-flex align-items-center gap-2 mb-3">
        <span class="small text-muted">Filter:</span>
        <button
          v-for="s in statusFilters"
          :key="s.value"
          class="btn btn-sm"
          :class="
            filterStatus === s.value ? s.activeClass : 'btn-outline-secondary'
          "
          @click="filterStatus = s.value">
          {{ s.label }}
        </button>
      </div>

      <!-- Records table -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th class="text-center">Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="record in filteredRecords"
                :key="record.id"
                :class="rowClass(record.status)">
                <td>{{ formatDate(record.date) }}</td>
                <td>{{ record.subject?.name ?? "Daily" }}</td>
                <td class="text-center">
                  <span :class="statusBadge(record.status)">
                    {{ record.status }}
                  </span>
                </td>
                <td class="text-muted small">{{ record.remarks ?? "—" }}</td>
              </tr>
              <tr v-if="filteredRecords.length === 0">
                <td colspan="4" class="text-center text-muted py-4">
                  No records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { studentService } from "@/services/student";

const records = ref([]);
const summary = ref({
  total: 0,
  present: 0,
  absent: 0,
  late: 0,
  is_flagged: false,
});
const loading = ref(false);
const error = ref("");
const filterStatus = ref("");

const statusFilters = [
  { value: "", label: "All", activeClass: "btn-secondary" },
  { value: "present", label: "Present", activeClass: "btn-success" },
  { value: "absent", label: "Absent", activeClass: "btn-danger" },
  { value: "late", label: "Late", activeClass: "btn-warning text-dark" },
];

const filteredRecords = computed(() => {
  if (!filterStatus.value) return records.value;
  return records.value.filter((r) => r.status === filterStatus.value);
});

onMounted(fetchAttendance);

async function fetchAttendance() {
  loading.value = true;
  error.value = "";
  try {
    const res = await studentService.myAttendance();
    summary.value = res.data.summary;
    records.value = res.data.records;
  } catch (err) {
    error.value = err.response?.data?.message ?? "Failed to load attendance.";
  } finally {
    loading.value = false;
  }
}

function statusBadge(status) {
  if (status === "present") return "badge bg-success";
  if (status === "absent") return "badge bg-danger";
  if (status === "late") return "badge bg-warning text-dark";
  return "badge bg-secondary";
}

function rowClass(status) {
  if (status === "absent") return "table-danger";
  if (status === "late") return "table-warning";
  return "";
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
