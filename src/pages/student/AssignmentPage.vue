<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="fw-bold mb-0">Assignments</h5>
    </div>

    <div v-if="loading">
      <LoadingTable :headers="['#', 'Subject', 'Title', 'Points', 'Due Date', 'Actions']"
        loading-text="Loading subjects..." />
    </div>

    <div v-else>
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div v-if="error" class="text-center py-5 text-danger">
            {{ error }}
          </div>
          <table v-else class="table table-hover mb-0">
            <thead class="table-light">
              <tr class="text-center">
                <th>#</th>
                <th>Subject</th>
                <th>Title</th>
                <th>Points</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="assignments.length === 0">
                <td colspan="7" class="text-center text-muted py-5">
                  No Assignments yet.
                </td>
              </tr>
              <tr v-for="assignment in assignments" :key="assignment.id" class="text-center">
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
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="openViewModal(assignment)">
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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

    <div class="modal fade" id="viewAssignmentModal" tabindex="-1" ref="viewModalEl">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">

          <div class="modal-header">
            <h6 class="modal-title fw-bold">
              Assignment Details
            </h6>
            <button type="button" class="btn-close" @click="closeViewModal"></button>
          </div>

          <div class="modal-body">
            <div v-if="!selectedAssignment" class="text-muted text-center py-4">
              No assignment selected.
            </div>

            <div v-else>
              <h5 class="fw-bold mb-2">
                {{ selectedAssignment.title }}
              </h5>

              <div class="mb-2 text-muted small">
                {{ selectedAssignment.subject?.name }}
                <span class="badge bg-secondary">
                  {{ selectedAssignment.subject?.code }}
                </span>
              </div>

              <div class="row mb-3 small">
                <div class="col-md-4">
                  <strong>Points:</strong><br />
                  {{ selectedAssignment.total_points }}
                </div>
                <div class="col-md-4">
                  <strong>Due Date:</strong><br />
                  {{ formatDateTime(selectedAssignment.due_date) }}
                </div>
              </div>

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

                      <p v-if="item.type === 'text'" class="mb-2">
                        {{ item.content }}
                      </p>

                      <ul v-else-if="item.type === 'bullet'" class="mb-2 ps-3">
                        <li>{{ item.content }}</li>
                      </ul>

                    </template>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeViewModal">
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import LoadingTable from '../../components/LoadingTable.vue';
import { Modal } from "bootstrap";
import { assignmentService } from "@/services/assignment";

const assignments = ref([]);
const loading = ref(false);
const error = ref("");
const pagination = ref({});
const selectedAssignment = ref(null);

const viewModalEl = ref(null);
let viewModalInstance = null;

const parsedInstructions = computed(() => {
  try {
    const raw = selectedAssignment.value?.details?.instructions;
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
});

onMounted(async () => {
  await Promise.all([
    fetchAssignments(),
  ]);
});

async function fetchAssignments(page = 1) {
  loading.value = true;
  error.value = "";

  try {
    const res = await assignmentService.getStudentAssignments({ page });
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

function openViewModal(assignment) {
  selectedAssignment.value = assignment;
  if (!viewModalInstance) viewModalInstance = new Modal(viewModalEl.value);
  viewModalInstance.show();
}

function closeViewModal() {
  viewModalInstance?.hide();
}

function goToPage(page) {
  if (page >= 1 && page <= pagination.value.last_page) fetchAssignments(page);
}

const nextPage = () => goToPage(pagination.value.current_page + 1);
const prevPage = () => goToPage(pagination.value.current_page - 1);

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
</script>