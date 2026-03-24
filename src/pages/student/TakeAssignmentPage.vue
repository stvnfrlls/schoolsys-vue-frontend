<template>
    <div>
        <!-- Header -->
        <div class="d-flex align-items-center gap-3 mb-4">
            <button class="btn btn-sm btn-outline-secondary" @click="goBack">← Back</button>
            <div v-if="assignment">
                <h5 class="fw-bold mb-0">{{ assignment.title }}</h5>
                <small class="text-muted">
                    {{ assignment.subject?.name }}
                    <span class="badge bg-secondary ms-1">{{ assignment.subject?.code }}</span>
                </small>
            </div>
            <div v-else class="placeholder-glow">
                <span class="placeholder col-4"></span>
            </div>
        </div>

        <div v-if="loading" class="text-center py-5 text-muted">Loading...</div>

        <div v-else>
            <!-- Assignment info -->
            <div class="row g-3 mb-4" v-if="assignment">
                <div class="col-md-3 col-6">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body py-3">
                            <div class="text-muted small">Total Points</div>
                            <div class="fw-bold">{{ assignment.total_points }}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body py-3">
                            <div class="text-muted small">Due Date</div>
                            <div class="fw-bold">{{ formatDateTime(assignment.due_date) }}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body py-3">
                            <div class="text-muted small">Status</div>
                            <div class="fw-bold">
                                <span class="badge" :class="submissionStatusBadge">
                                    {{ submission?.status ?? 'Not started' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-6" v-if="submission?.status === 'graded'">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body py-3">
                            <div class="text-muted small">Score</div>
                            <div class="fw-bold text-success">
                                {{ Number(submission.total_score).toFixed(2) }} / {{
                                    Number(assignment.total_points).toFixed(2) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div v-if="assignment?.details?.description" class="card border-0 shadow-sm mb-4">
                <div class="card-body">
                    <div class="text-muted small fw-semibold mb-1">Description</div>
                    <div>{{ assignment.details.description }}</div>
                </div>
            </div>

            <!-- Already graded view -->
            <div v-if="submission?.status === 'graded'" class="d-flex flex-column gap-3">
                <div v-for="(q, index) in questions" :key="q.id" class="card border-0 shadow-sm">
                    <div class="card-body">
                        <div class="fw-semibold mb-2">
                            {{ index + 1 }}. {{ q.question_text }}
                            <span class="text-muted fw-normal small ms-2">({{ q.points }} pts)</span>
                        </div>

                        <!-- Multiple choice -->
                        <div v-if="q.type === 'multiple_choice' && answers[q.id]">
                            <div v-for="opt in q.options" :key="opt.id" class="form-check mb-1">
                                <input class="form-check-input" type="radio" disabled
                                    :checked="getAnswer(q.id)?.selected_option_ids?.includes(opt.id)" />
                                <label class="form-check-label" :class="{
                                    'text-success fw-semibold': opt.is_correct,
                                    'text-danger': isWrongSelection(q, opt),
                                }">
                                    {{ opt.option_text }}
                                    <span v-if="opt.is_correct" class="ms-1">✓</span>
                                </label>
                            </div>
                        </div>

                        <!-- Checkbox -->
                        <div v-else-if="q.type === 'checkbox' && answers[q.id]">
                            <div v-for="opt in q.options" :key="opt.id" class="form-check mb-1">
                                <input class="form-check-input" type="checkbox" disabled
                                    :checked="getAnswer(q.id)?.selected_option_ids?.includes(opt.id)" />
                                <label class="form-check-label" :class="{
                                    'text-success fw-semibold': opt.is_correct,
                                    'text-danger': isWrongSelection(q, opt),
                                }">
                                    {{ opt.option_text }}
                                    <span v-if="opt.is_correct" class="ms-1">✓</span>
                                </label>
                            </div>
                        </div>

                        <!-- Short answer / paragraph -->
                        <div v-else>
                            <div class="border rounded p-2 bg-light small">
                                {{ getAnswer(q.id)?.answer_text || '(No answer)' }}
                            </div>
                        </div>

                        <!-- Per-question score -->
                        <div class="mt-2 small">
                            <span class="badge" :class="getAnswer(q.id)?.auto_score > 0 || getAnswer(q.id)?.manual_score > 0
                                ? 'bg-success'
                                : 'bg-secondary'">
                                Score:
                                {{
                                    (
                                        Number(getAnswer(q.id)?.auto_score ?? 0) +
                                        Number(getAnswer(q.id)?.manual_score ?? 0)
                                    ).toFixed(2)
                                }}
                                /
                                {{ Number(q.points).toFixed(2) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Answer form (draft / submitted / not started) -->
            <div v-else>
                <div v-if="questions.length === 0" class="text-center py-5 text-muted">
                    No questions yet.
                </div>

                <div v-else class="d-flex flex-column gap-3">
                    <div v-for="(q, index) in questions" :key="q.id" class="card border-0 shadow-sm">
                        <div class="card-body">
                            <div class="fw-semibold mb-3">
                                {{ index + 1 }}. {{ q.question_text }}
                                <span v-if="q.is_required" class="text-danger ms-1">*</span>
                                <span class="text-muted fw-normal small ms-2">({{ q.points }} pts)</span>
                            </div>

                            <!-- Multiple choice -->
                            <div v-if="q.type === 'multiple_choice'">
                                <div v-for="opt in q.options" :key="opt.id" class="form-check mb-1">
                                    <input class="form-check-input" type="radio" :name="`q_${q.id}`" :value="opt.id"
                                        v-model="answers[q.id].selected_option_ids[0]" :disabled="isSubmitted" />
                                    <label class="form-check-label">{{ opt.option_text }}</label>
                                </div>
                            </div>

                            <!-- Checkbox -->
                            <div v-else-if="q.type === 'checkbox'">
                                <div v-for="opt in q.options" :key="opt.id" class="form-check mb-1">
                                    <input class="form-check-input" type="checkbox" :value="opt.id"
                                        v-model="answers[q.id].selected_option_ids" :disabled="isSubmitted" />
                                    <label class="form-check-label">{{ opt.option_text }}</label>
                                </div>
                            </div>

                            <!-- Short answer -->
                            <div v-else-if="q.type === 'short_answer' && answers[q.id]">
                                <input type="text" class="form-control" v-model="answers[q.id].answer_text"
                                    placeholder="Your answer..." :disabled="isSubmitted" />
                            </div>

                            <!-- Paragraph -->
                            <div v-else-if="q.type === 'paragraph' && answers[q.id]">
                                <textarea class="form-control" rows="4" v-model="answers[q.id].answer_text"
                                    placeholder="Your answer..." :disabled="isSubmitted"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action buttons -->
                <div class="d-flex gap-2 mt-4" v-if="questions.length > 0">
                    <button v-if="!isSubmitted" class="btn btn-outline-secondary btn-sm" @click="saveDraft"
                        :disabled="saving">
                        <span v-if="saving === 'draft'" class="spinner-border spinner-border-sm me-1"></span>
                        Save Draft
                    </button>
                    <button v-if="!isSubmitted" class="btn btn-primary btn-sm" @click="confirmSubmit"
                        :disabled="saving">
                        <span v-if="saving === 'submit'" class="spinner-border spinner-border-sm me-1"></span>
                        Submit Assignment
                    </button>
                    <button v-if="isSubmitted" class="btn btn-outline-warning btn-sm" @click="confirmResubmit"
                        :disabled="saving">
                        <span v-if="saving === 'resubmit'" class="spinner-border spinner-border-sm me-1"></span>
                        Resubmit
                    </button>
                    <div v-if="isSubmitted" class="text-muted small d-flex align-items-center ms-2">
                        Submitted — awaiting grading.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { assignmentService } from '@/services/assignment'

const route = useRoute()
const router = useRouter()
const assignmentId = Number(route.params.id)

const assignment = ref(null)
const questions = ref([])
const submission = ref(null)
const answers = ref({})
const loading = ref(false)
const saving = ref(null)

// --- Computed ---
const isSubmitted = computed(() => submission.value?.status === 'submitted')

const submissionStatusBadge = computed(() => ({
    draft: 'bg-secondary',
    submitted: 'bg-warning text-dark',
    graded: 'bg-success',
})[submission.value?.status] ?? 'bg-light text-dark border')

// --- Lifecycle ---
onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            fetchAssignment(),
            fetchQuestions(),
            fetchMySubmission(),
        ])
    } finally {
        loading.value = false
    }
})

// --- Fetch ---
async function fetchAssignment() {
    const res = await assignmentService.show(assignmentId)
    assignment.value = res.data.data
}

async function fetchQuestions() {
    const res = await assignmentService.getQuestions(assignmentId)
    questions.value = res.data.data
}

async function fetchMySubmission() {
    const res = await assignmentService.getMySubmission(assignmentId)
    submission.value = res.data.data

    // Initialize answers from existing submission or blank
    initAnswers(res.data.data?.answers ?? [])
}

// --- Answer init ---
function initAnswers(existingAnswers) {
    const map = {}
    existingAnswers.forEach(a => {
        map[a.question_id] = {
            question_id: a.question_id,
            answer_text: a.answer_text ?? '',
            selected_option_ids: a.selected_option_ids ?? [],
        }
    })

    // Ensure every question has an entry even if unanswered
    questions.value.forEach(q => {
        if (!map[q.id]) {
            map[q.id] = {
                question_id: q.id,
                answer_text: '',
                selected_option_ids: [],
            }
        }
    })

    answers.value = map
}

// --- Build payload ---
function buildAnswersPayload() {
    return Object.values(answers.value).map(a => {
        const q = questions.value.find(q => q.id === a.question_id)
        if (!q) return null

        if (q.type === 'multiple_choice') {
            return {
                question_id: a.question_id,
                selected_option_ids: a.selected_option_ids[0] ? [a.selected_option_ids[0]] : [],
            }
        }
        if (q.type === 'checkbox') {
            return {
                question_id: a.question_id,
                selected_option_ids: a.selected_option_ids,
            }
        }
        return {
            question_id: a.question_id,
            answer_text: a.answer_text,
        }
    }).filter(Boolean)
}

// --- Actions ---
async function saveDraft() {
    saving.value = 'draft'
    try {
        await assignmentService.saveDraft(assignmentId, { answers: buildAnswersPayload() })
    } catch {
        alert('Failed to save draft.')
    } finally {
        saving.value = null
    }
}

async function confirmSubmit() {
    if (!confirm('Submit this assignment? You can resubmit later if allowed.')) return
    saving.value = 'submit'
    try {
        const res = await assignmentService.submitAssignment(assignmentId, { answers: buildAnswersPayload() })
        submission.value = res.data.data
    } catch (e) {
        alert(e.response?.data?.message || 'Failed to submit.')
    } finally {
        saving.value = null
    }
}

async function confirmResubmit() {
    if (!confirm('Resubmit? Your previous submission will be cleared.')) return
    saving.value = 'resubmit'
    try {
        const res = await assignmentService.resubmitAssignment(assignmentId, { answers: buildAnswersPayload() })
        submission.value = res.data.data
        initAnswers(res.data.data?.answers ?? [])
    } catch (e) {
        alert(e.response?.data?.message || 'Failed to resubmit.')
    } finally {
        saving.value = null
    }
}

// --- Helpers ---
function getAnswer(questionId) {
    return submission.value?.answers?.find(a => a.question_id === questionId)
}

function isWrongSelection(question, option) {
    const answer = getAnswer(question.id)
    if (!answer) return false
    const selected = answer.selected_option_ids ?? []
    return selected.includes(option.id) && !option.is_correct
}

function goBack() {
    router.back()
}

function formatDateTime(datetime) {
    if (!datetime) return '—'
    const d = new Date(datetime)
    return isNaN(d) ? '—' : d.toLocaleString('en-US', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
    })
}
</script>