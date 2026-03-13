<template>
  <div class="modal fade" id="addUserModal" tabindex="-1" ref="modalEl">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title fw-bold">Add {{ roleLabel }}</h6>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div v-if="formError" class="alert alert-danger py-2 small">
            {{ formError }}
          </div>

          <!-- Account Fields -->
          <div class="mb-3">
            <label class="form-label"
              >Email <span class="text-danger">*</span></label
            >
            <input v-model="form.email" type="email" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label"
              >Password <span class="text-danger">*</span></label
            >
            <div class="input-group">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control font-monospace" />
              <button
                class="btn btn-outline-secondary btn-sm"
                type="button"
                @click="showPassword = !showPassword">
                {{ showPassword ? "Hide" : "Show" }}
              </button>
              <button
                class="btn btn-outline-secondary btn-sm"
                type="button"
                @click="regeneratePassword">
                Regenerate
              </button>
            </div>
            <div class="form-text text-muted">
              Auto-generated strong password.
            </div>
          </div>

          <hr class="my-3" />
          <p class="small text-muted fw-semibold mb-3 text-uppercase">
            {{ roleLabel }} Profile
          </p>

          <!-- Profile Fields -->
          <div class="row g-2 mb-3">
            <div class="col">
              <label class="form-label"
                >First Name <span class="text-danger">*</span></label
              >
              <input
                v-model="form.first_name"
                type="text"
                class="form-control" />
            </div>
            <div class="col">
              <label class="form-label"
                >Last Name <span class="text-danger">*</span></label
              >
              <input
                v-model="form.last_name"
                type="text"
                class="form-control" />
            </div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col">
              <label class="form-label">
                Middle Name <span class="text-muted small">(optional)</span>
              </label>
              <input
                v-model="form.middle_name"
                type="text"
                class="form-control" />
            </div>
            <div class="col">
              <label class="form-label">
                Suffix <span class="text-muted small">(optional)</span>
              </label>
              <input
                v-model="form.suffix"
                type="text"
                class="form-control"
                placeholder="Jr., Sr., III…" />
            </div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col">
              <label class="form-label"
                >Date of Birth <span class="text-danger">*</span></label
              >
              <input
                v-model="form.date_of_birth"
                type="date"
                class="form-control" />
            </div>
            <div class="col">
              <label class="form-label"
                >Gender <span class="text-danger">*</span></label
              >
              <select v-model="form.gender" class="form-select">
                <option disabled value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <!-- Faculty only -->
          <div class="mb-3" v-if="role === 'faculty'">
            <label class="form-label">Specialization</label>
            <input
              v-model="form.specialization"
              type="text"
              class="form-control" />
          </div>

          <!-- Enrollment Fields: student only -->
          <template v-if="role === 'student'">
            <hr class="my-3" />
            <p class="small text-muted fw-semibold mb-3 text-uppercase">
              Enrollment
            </p>

            <div class="mb-3">
              <label class="form-label"
                >Grade Level <span class="text-danger">*</span></label
              >
              <select
                v-model="form.grade_level_id"
                class="form-select"
                @change="form.section_id = ''">
                <option disabled value="">Select grade level</option>
                <option v-for="g in gradeLevels" :key="g.id" :value="g.id">
                  {{ g.name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label"
                >Section <span class="text-danger">*</span></label
              >
              <select
                v-model="form.section_id"
                class="form-select"
                :disabled="!form.grade_level_id">
                <option disabled value="">
                  {{
                    form.grade_level_id
                      ? "Select section"
                      : "Select a grade level first"
                  }}
                </option>
                <option v-for="s in filteredSections" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>

            <div class="row g-2 mb-3">
              <div class="col">
                <label class="form-label"
                  >School Year <span class="text-danger">*</span></label
                >
                <input
                  v-model="form.school_year"
                  type="text"
                  class="form-control"
                  placeholder="e.g. 2024-2025" />
                <div class="form-text text-muted">Format: YYYY-YYYY</div>
              </div>
              <div class="col">
                <label class="form-label"
                  >Semester <span class="text-danger">*</span></label
                >
                <select v-model="form.semester" class="form-select">
                  <option disabled value="">Select</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="summer">Summer</option>
                </select>
              </div>
            </div>
          </template>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm" @click="close">
            Cancel
          </button>
          <button
            class="btn btn-primary btn-sm"
            :disabled="saving"
            @click="submit">
            <span
              v-if="saving"
              class="spinner-border spinner-border-sm me-1"></span>
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Modal } from "bootstrap";
import { userService } from "@/services/user";
import { gradeLevelService, sectionService } from "@/services/grade";

const props = defineProps({
  role: {
    type: String,
    required: true, // 'student' or 'faculty'
  },
});

const emit = defineEmits(["created"]);

const roleLabel = computed(() =>
  props.role === "faculty" ? "Teacher" : "Student",
);

const modalEl = ref(null);
let modalInstance = null;

onMounted(() => {
  modalInstance = new Modal(modalEl.value);
});

// ── Grade levels + sections ───────────────────────────────────────────────────
const gradeLevels = ref([]);
const allSections = ref([]);

const filteredSections = computed(() =>
  allSections.value.filter(
    (s) => s.grade_level_id === form.value.grade_level_id,
  ),
);

async function fetchDropdownData() {
  const [gradesRes, sectionsRes] = await Promise.all([
    gradeLevelService.getAll(),
    sectionService.getAll(),
  ]);
  gradeLevels.value = gradesRes.data;
  allSections.value = sectionsRes.data;
}

// ── Password generation ───────────────────────────────────────────────────────
const CHARSET = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}",
};

function generatePassword(length = 16) {
  const all = CHARSET.upper + CHARSET.lower + CHARSET.digits + CHARSET.symbols;

  const required = [
    CHARSET.upper[Math.floor(Math.random() * CHARSET.upper.length)],
    CHARSET.lower[Math.floor(Math.random() * CHARSET.lower.length)],
    CHARSET.digits[Math.floor(Math.random() * CHARSET.digits.length)],
    CHARSET.symbols[Math.floor(Math.random() * CHARSET.symbols.length)],
  ];

  const rest = Array.from(
    { length: length - required.length },
    () => all[Math.floor(Math.random() * all.length)],
  );

  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}

// ── Form state ────────────────────────────────────────────────────────────────
const showPassword = ref(false);
const saving = ref(false);
const formError = ref("");

// School year starts in June — before June we're still in the previous year's cycle
function currentSchoolYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  const startYear = month >= 6 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

const emptyForm = () => ({
  // account
  email: "",
  password: generatePassword(),
  // profile
  first_name: "",
  last_name: "",
  middle_name: "",
  suffix: "",
  date_of_birth: "",
  gender: "",
  // faculty only
  specialization: "",
  // student enrollment
  grade_level_id: "",
  section_id: "",
  school_year: currentSchoolYear(),
  semester: "",
});

const form = ref(emptyForm());

function regeneratePassword() {
  form.value.password = generatePassword();
  showPassword.value = true;
}

// ── Modal controls ────────────────────────────────────────────────────────────
async function open() {
  form.value = emptyForm();
  formError.value = "";
  showPassword.value = false;

  if (props.role === "student") {
    await fetchDropdownData();
  }

  modalInstance.show();
}

function close() {
  modalInstance.hide();
}

defineExpose({ open });

// ── Validation ────────────────────────────────────────────────────────────────
const SCHOOL_YEAR_REGEX = /^\d{4}-\d{4}$/;

function validate() {
  if (!form.value.email || !form.value.password) {
    return "Email and password are required.";
  }
  if (
    !form.value.first_name ||
    !form.value.last_name ||
    !form.value.date_of_birth ||
    !form.value.gender
  ) {
    return "Please fill in all required profile fields.";
  }
  if (props.role === "student") {
    if (!form.value.grade_level_id || !form.value.section_id) {
      return "Please select a grade level and section.";
    }
    if (
      !form.value.school_year ||
      !SCHOOL_YEAR_REGEX.test(form.value.school_year)
    ) {
      return "School year must be in YYYY-YYYY format (e.g. 2024-2025).";
    }
    if (!form.value.semester) {
      return "Please select a semester.";
    }
  }
  return null;
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submit() {
  if (saving.value) return;
  formError.value = "";

  const validationError = validate();
  if (validationError) {
    formError.value = validationError;
    return;
  }

  saving.value = true;

  try {
    const payload = {
      email: form.value.email,
      password: form.value.password,
      role: props.role,
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      middle_name: form.value.middle_name || undefined,
      suffix: form.value.suffix || undefined,
      date_of_birth: form.value.date_of_birth,
      gender: form.value.gender,
    };

    if (props.role === "faculty") {
      payload.specialization = form.value.specialization || undefined;
    }

    if (props.role === "student") {
      payload.grade_level_id = form.value.grade_level_id;
      payload.section_id = form.value.section_id;
      payload.school_year = form.value.school_year;
      payload.semester = form.value.semester;
    }

    await userService.create(payload);
    close();
    emit("created");
  } catch (err) {
    formError.value = err.response?.data?.message ?? "Something went wrong.";
  } finally {
    saving.value = false;
  }
}
</script>
