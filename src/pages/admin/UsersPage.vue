<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="fw-bold mb-0">Users</h5>
      <button class="btn btn-primary btn-sm" @click="openCreate">
        + Add User
      </button>
    </div>

    <div v-if="loading">
      <LoadingTable :headers="['#', 'Name', 'Email', 'Role', 'Status', 'Action']" loading-text="Loading users..." />
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
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="text-center">
                <td class="text-muted small">{{ user.id }}</td>
                <td>{{ displayName(user) }}</td>
                <td class="text-muted small">{{ user.email }}</td>
                <td>
                  <span class="badge bg-secondary text-capitalize">
                    {{ user.roles[0]?.name ?? "unassigned" }}
                  </span>
                </td>
                <td>
                  <span :class="user.is_active ? 'badge bg-success' : 'badge bg-danger'
                    ">
                    {{ user.is_active ? "Active" : "Inactive" }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(user)">
                    Edit
                  </button>
                  <button class="btn btn-sm me-1" :class="user.is_active
                    ? 'btn-outline-warning'
                    : 'btn-outline-success'
                    " @click="toggleActive(user)">
                    {{ user.is_active ? "Deactivate" : "Activate" }}
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(user)">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-3 small text-muted"
      v-if="pagination.last_page > 1">
      <span>Showing {{ pagination.from }}–{{ pagination.to }} of
        {{ pagination.total }}</span>
      <div class="d-flex gap-1">
        <button class="btn btn-sm btn-outline-secondary" :disabled="pagination.current_page === 1"
          @click="fetchUsers(pagination.current_page - 1)">
          Prev
        </button>
        <button class="btn btn-sm btn-outline-secondary" :disabled="pagination.current_page === pagination.last_page"
          @click="fetchUsers(pagination.current_page + 1)">
          Next
        </button>
      </div>
    </div>

    <div class="modal fade" id="userModal" tabindex="-1" ref="modalEl">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title fw-bold">
              {{ isEditing ? "Edit User" : "Add User" }}
            </h6>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger py-2 small">
              {{ formError }}
            </div>

            <div class="mb-3" v-if="!isProfileRole">
              <label class="form-label">Name</label>
              <input v-model="form.name" type="text" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="form-control" />
            </div>
            <div class="mb-3" v-if="!isEditing">
              <label class="form-label">Password</label>
              <input v-model="form.password" type="password" class="form-control" />
            </div>
            <div class="mb-3" v-if="isEditing">
              <label class="form-label">New Password</label>
              <input v-model="form.password" type="password" class="form-control"
                placeholder="Leave blank to keep current password" />
              <div class="form-text text-muted">
                Only fill this in if you want to change the password.
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Role</label>
              <select v-model="form.role_id" class="form-select">
                <option disabled value="">Select a role</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
            </div>

            <template v-if="isProfileRole && !isEditing">
              <hr class="my-3" />
              <p class="small text-muted fw-semibold mb-3 text-uppercase">
                {{ selectedRoleName }} Profile
              </p>

              <div class="row g-2 mb-3">
                <div class="col">
                  <label class="form-label">First Name <span class="text-danger">*</span></label>
                  <input v-model="form.first_name" type="text" class="form-control" />
                </div>
                <div class="col">
                  <label class="form-label">Last Name <span class="text-danger">*</span></label>
                  <input v-model="form.last_name" type="text" class="form-control" />
                </div>
              </div>

              <div class="row g-2 mb-3">
                <div class="col">
                  <label class="form-label">Middle Name</label>
                  <input v-model="form.middle_name" type="text" class="form-control" />
                </div>
                <div class="col">
                  <label class="form-label">Suffix</label>
                  <input v-model="form.suffix" type="text" class="form-control" placeholder="Jr., Sr., III…" />
                </div>
              </div>

              <div class="row g-2 mb-3">
                <div class="col">
                  <label class="form-label">Date of Birth <span class="text-danger">*</span></label>
                  <input v-model="form.date_of_birth" type="date" class="form-control" />
                </div>
                <div class="col">
                  <label class="form-label">Gender <span class="text-danger">*</span></label>
                  <select v-model="form.gender" class="form-select">
                    <option disabled value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div class="mb-3" v-if="selectedRoleName === 'faculty'">
                <label class="form-label">Specialization</label>
                <input v-model="form.specialization" type="text" class="form-control" />
              </div>
            </template>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" @click="closeModal">
              Cancel
            </button>
            <button class="btn btn-primary btn-sm" :disabled="saving" @click="saveUser">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? "Update" : "Create" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="deleteModal" tabindex="-1" ref="deleteModalEl">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-body text-center py-4">
            <p class="mb-1 fw-semibold">Delete user?</p>
            <p class="text-muted small mb-3">
              {{ displayName(selectedUser) }}
            </p>
            <button class="btn btn-danger btn-sm me-2" :disabled="saving" @click="deleteUser">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
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
import { userService, roleService } from "@/services/user";

const users = ref([]);
const roles = ref([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const formError = ref("");
const isEditing = ref(false);
const selectedUser = ref(null);
const pagination = ref({});

const emptyForm = () => ({
  name: "",
  email: "",
  password: "",
  role_id: "",
  first_name: "",
  last_name: "",
  middle_name: "",
  suffix: "",
  date_of_birth: "",
  gender: "",
  specialization: "",
});

const form = ref(emptyForm());

const selectedRoleName = computed(() => {
  const found = roles.value.find((r) => r.id === form.value.role_id);
  return found?.name ?? "";
});

const PROFILE_ROLES = ["student", "faculty"];

const isProfileRole = computed(() =>
  PROFILE_ROLES.includes(selectedRoleName.value),
);

function displayName(user) {
  if (!user) return "—";
  const role = user.roles?.[0]?.name;
  if (role === "student" && user.student) {
    return profileFullName(user.student);
  }
  if (role === "faculty" && user.teacher) {
    return profileFullName(user.teacher);
  }
  return user.name ?? "—";
}

function profileFullName(profile) {
  return [
    profile.first_name,
    profile.middle_name,
    profile.last_name,
    profile.suffix,
  ]
    .filter(Boolean)
    .join(" ");
}

const modalEl = ref(null);
const deleteModalEl = ref(null);
let modalInstance = null;
let deleteModalInstance = null;

onMounted(async () => {
  modalInstance = new Modal(modalEl.value);
  deleteModalInstance = new Modal(deleteModalEl.value);
  await fetchUsers();
  await fetchRoles();
});

async function fetchUsers(page = 1) {
  loading.value = true;
  error.value = "";
  try {
    const res = await userService.getAll(page);
    users.value = res.data.data;
    pagination.value = res.data.meta;
  } catch {
    error.value = "Failed to load users.";
  } finally {
    loading.value = false;
  }
}

async function fetchRoles() {
  const res = await roleService.getAll();
  roles.value = res.data;
}

function openCreate() {
  isEditing.value = false;
  form.value = emptyForm();
  formError.value = "";
  modalInstance.show();
}

function openEdit(user) {
  isEditing.value = true;
  selectedUser.value = user;
  const profile = user.student ?? user.teacher ?? null;
  form.value = {
    ...emptyForm(),
    name: user.name,
    email: user.email,
    role_id: user.roles[0]?.id ?? "",
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    middle_name: profile?.middle_name ?? "",
    suffix: profile?.suffix ?? "",
    date_of_birth: profile?.date_of_birth ?? "",
    gender: profile?.gender ?? "",
    specialization: user.teacher?.specialization ?? "",
  };
  formError.value = "";
  modalInstance.show();
}

function closeModal() {
  modalInstance.hide();
}

function confirmDelete(user) {
  selectedUser.value = user;
  deleteModalInstance.show();
}

function closeDeleteModal() {
  deleteModalInstance.hide();
}

async function saveUser() {
  if (saving.value) return;
  formError.value = "";

  if (!form.value.email || (!isEditing.value && !form.value.password)) {
    formError.value = "Please fill in all required fields.";
    return;
  }

  if (!isEditing.value && isProfileRole.value) {
    if (
      !form.value.first_name ||
      !form.value.last_name ||
      !form.value.date_of_birth ||
      !form.value.gender
    ) {
      formError.value = "Please fill in all required profile fields.";
      return;
    }
  }

  saving.value = true;

  try {
    if (isEditing.value) {
      const updatePayload = {
        name: form.value.name,
        email: form.value.email,
      };
      if (form.value.password) {
        updatePayload.password = form.value.password;
      }
      if (form.value.role_id) {
        updatePayload.role = form.value.role_id;
      }
      await userService.update(selectedUser.value.id, updatePayload);
    } else {
      const payload = {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        role: selectedRoleName.value || undefined,
      };

      if (isProfileRole.value) {
        payload.first_name = form.value.first_name;
        payload.last_name = form.value.last_name;
        payload.middle_name = form.value.middle_name || undefined;
        payload.suffix = form.value.suffix || undefined;
        payload.date_of_birth = form.value.date_of_birth;
        payload.gender = form.value.gender;

        if (selectedRoleName.value === "faculty") {
          payload.specialization = form.value.specialization || undefined;
        }
      }

      await userService.create(payload);
    }

    closeModal();
    await fetchUsers(pagination.value.current_page);
  } catch (err) {
    const msg = err.response?.data?.message;
    formError.value = msg ?? "Something went wrong.";
  } finally {
    saving.value = false;
  }
}

async function toggleActive(user) {
  try {
    if (user.is_active) {
      await userService.deactivate(user.id);
    } else {
      await userService.activate(user.id);
    }
    await fetchUsers(pagination.value.current_page);
  } catch (err) {
    const msg = err.response?.data?.message ?? "Failed to update user status.";
    alert(msg);
  }
}

async function deleteUser() {
  saving.value = true;
  try {
    await userService.delete(selectedUser.value.id);
    closeDeleteModal();
    await fetchUsers(pagination.value.current_page);
  } catch (err) {
    const msg = err.response?.data?.message ?? "Failed to delete user.";
    alert(msg);
  } finally {
    saving.value = false;
  }
}
</script>