<template>
    <div>
        <!-- Header -->
        <div class="d-flex align-items-center gap-3 mb-4">
            <button class="btn btn-sm btn-outline-secondary" @click="goBack">
                ← Back
            </button>
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

        <!-- Summary Cards -->
        <div class="row g-3 mb-4" v-if="assignment">
            <div class="col-md-2 col-6">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body py-3">
                        <div class="text-muted small">Points</div>
                        <div class="fw-bold">{{ assignment.total_points }}</div>
                    </div>
                </div>
            </div>
            <div class="col-md-2 col-6">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body py-3">
                        <div class="text-muted small">Quarter</div>
                        <div class="fw-bold">{{ assignment.quarter ? `Q${assignment.quarter}` : '—' }}</div>
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
            <div class="col-md-2 col-6">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body py-3">
                        <div class="text-muted small">Submitted</div>
                        <div class="fw-bold">
                            {{ summary.graded ?? '—' }}
                            <span class="text-muted small">/{{ summary.total_submissions ?? '—' }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-2 col-6">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body py-3">
                        <div class="text-muted small">Graded</div>
                        <div class="fw-bold text-success">{{ summary.graded ?? '—' }}</div>
                    </div>
                </div>
            </div>
            <div class="col-md-1 col-6">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body py-3">
                        <div class="text-muted small">Status</div>
                        <button class="btn btn-xs btn-sm mt-1"
                            :class="assignment.is_published ? 'btn-success' : 'btn-secondary'" @click="togglePublish"
                            :disabled="togglingPublish">
                            {{ assignment.is_published ? 'Live' : 'Draft' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
                <button class="nav-link" :class="{ active: activeTab === 'questions' }"
                    @click="activeTab = 'questions'">Questions</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" :class="{ active: activeTab === 'submissions' }"
                    @click="onTabChange('submissions')">
                    Submissions
                    <span v-if="summary.pending_grading > 0" class="badge bg-warning text-dark ms-1">
                        {{ summary.pending_grading }}
                    </span>
                </button>
            </li>
            <li class="nav-item">
                <button class="nav-link" :class="{ active: activeTab === 'preview' }"
                    @click="onTabChange('preview')">Preview</button>
            </li>
        </ul>

        <!-- Tab: Questions -->
        <div v-if="activeTab === 'questions'">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-muted small">{{ questions.length }} question(s)</span>
                <button class="btn btn-sm btn-primary" @click="openAddQuestion">
                    + Add Question
                </button>
            </div>

            <div v-if="loadingQuestions" class="text-center py-5 text-muted">
                Loading questions...
            </div>

            <div v-else-if="questions.length === 0" class="text-center py-5 text-muted">
                No questions yet. Click "Add Question" to start building the form.
            </div>

            <div v-else class="d-flex flex-column gap-3">
                <div v-for="(q, index) in questions" :key="q.id" class="card border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="d-flex gap-2 align-items-start flex-grow-1">
                                <span class="badge bg-light text-dark border mt-1">{{ index + 1 }}</span>
                                <div class="flex-grow-1">
                                    <div class="fw-semibold">{{ q.question_text }}</div>
                                    <div class="d-flex gap-2 mt-1">
                                        <span class="badge bg-secondary">{{ formatType(q.type) }}</span>
                                        <span class="badge bg-light text-dark border">{{ q.points }} pt{{ q.points !== 1
                                            ? 's' : '' }}</span>
                                        <span v-if="q.is_required" class="badge bg-danger">Required</span>
                                    </div>
                                    <!-- Options preview -->
                                    <ul v-if="q.options?.length" class="mt-2 mb-0 small text-muted ps-3">
                                        <li v-for="opt in q.options" :key="opt.id"
                                            :class="{ 'text-success fw-semibold': opt.is_correct }">
                                            {{ opt.option_text }}
                                            <span v-if="opt.is_correct">✓</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="d-flex gap-1 ms-3 flex-shrink-0">
                                <button class="btn btn-sm btn-outline-secondary" :disabled="index === 0"
                                    @click="moveQuestion(index, -1)">↑</button>
                                <button class="btn btn-sm btn-outline-secondary"
                                    :disabled="index === questions.length - 1"
                                    @click="moveQuestion(index, 1)">↓</button>
                                <button class="btn btn-sm btn-outline-primary"
                                    @click="openEditQuestion(q)">Edit</button>
                                <button class="btn btn-sm btn-outline-danger" @click="deleteQuestion(q)"
                                    :disabled="deletingQuestionId === q.id">
                                    <span v-if="deletingQuestionId === q.id"
                                        class="spinner-border spinner-border-sm"></span>
                                    <span v-else>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tab: Submissions -->
        <div v-if="activeTab === 'submissions'">
            <div v-if="loadingSubmissions" class="text-center py-5 text-muted">
                Loading submissions...
            </div>
            <div v-else-if="submissions.length === 0" class="text-center py-5 text-muted">
                No submissions yet.
            </div>
            <div v-else class="card border-0 shadow-sm">
                <div class="card-body p-0">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Student</th>
                                <th class="text-center">Status</th>
                                <th class="text-center">Auto Score</th>
                                <th class="text-center">Total Score</th>
                                <th class="text-center">Pushed</th>
                                <th class="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="sub in submissions" :key="sub.id">
                                <td>{{ sub.student?.first_name }} {{ sub.student?.last_name }}</td>
                                <td class="text-center">
                                    <span class="badge" :class="statusBadge(sub.status)">
                                        {{ sub.status }}
                                    </span>
                                </td>
                                <td class="text-center text-muted small">{{ sub.auto_score ?? '—' }}</td>
                                <td class="text-center fw-semibold">{{ sub.total_score ?? '—' }}</td>
                                <td class="text-center">
                                    <span v-if="sub.pushed_to_gradebook" class="badge bg-success">Yes</span>
                                    <span v-else class="badge bg-light text-dark border">No</span>
                                </td>
                                <td class="text-center">
                                    <button v-if="sub.status === 'submitted'"
                                        class="btn btn-sm btn-outline-primary me-1"
                                        @click="openGradeModal(sub)">Grade</button>
                                    <button v-if="sub.status === 'graded' && !sub.pushed_to_gradebook"
                                        class="btn btn-sm btn-outline-success" @click="pushToGradebook(sub)"
                                        :disabled="pushingId === sub.id">
                                        <span v-if="pushingId === sub.id"
                                            class="spinner-border spinner-border-sm me-1"></span>
                                        Push
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Tab: Preview -->
        <div v-if="activeTab === 'preview'">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <h6 class="fw-bold mb-1">{{ assignment?.title }}</h6>
                    <p class="text-muted small mb-3">{{ assignment?.details?.description || 'No description.' }}</p>
                    <hr />

                    <div v-if="questions.length === 0" class="text-muted text-center py-4">
                        No questions to preview yet.
                    </div>

                    <div v-for="(q, index) in questions" :key="q.id" class="mb-4">
                        <div class="fw-semibold mb-2">
                            {{ index + 1 }}. {{ q.question_text }}
                            <span v-if="q.is_required" class="text-danger ms-1">*</span>
                            <span class="text-muted fw-normal small ms-2">({{ q.points }} pt{{ q.points !== 1 ? 's' : ''
                            }})</span>
                        </div>

                        <!-- Multiple choice -->
                        <div v-if="q.type === 'multiple_choice'">
                            <div v-for="opt in q.options" :key="opt.id" class="form-check">
                                <input class="form-check-input" type="radio" disabled />
                                <label class="form-check-label text-muted">{{ opt.option_text }}</label>
                            </div>
                        </div>

                        <!-- Checkbox -->
                        <div v-else-if="q.type === 'checkbox'">
                            <div v-for="opt in q.options" :key="opt.id" class="form-check">
                                <input class="form-check-input" type="checkbox" disabled />
                                <label class="form-check-label text-muted">{{ opt.option_text }}</label>
                            </div>
                        </div>

                        <!-- Short answer -->
                        <div v-else-if="q.type === 'short_answer'">
                            <input type="text" class="form-control" disabled placeholder="Student's short answer..." />
                        </div>

                        <!-- Paragraph -->
                        <div v-else-if="q.type === 'paragraph'">
                            <textarea class="form-control" rows="3" disabled
                                placeholder="Student's answer..."></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Question Modal (Add / Edit) -->
        <div class="modal fade" tabindex="-1" ref="questionModalEl">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">
                            {{ editingQuestion ? 'Edit Question' : 'Add Question' }}
                        </h6>
                        <button type="button" class="btn-close" @click="closeQuestionModal"></button>
                    </div>

                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Question Text <span class="text-danger">*</span></label>
                            <textarea v-model="questionForm.question_text" class="form-control" rows="2"
                                placeholder="Enter your question..."></textarea>
                        </div>

                        <div class="row mb-3">
                            <div class="col">
                                <label class="form-label">Type</label>
                                <select v-model="questionForm.type" class="form-select" :disabled="!!editingQuestion"
                                    @change="onTypeChange">
                                    <option value="multiple_choice">Multiple Choice</option>
                                    <option value="checkbox">Checkboxes</option>
                                    <option value="short_answer">Short Answer</option>
                                    <option value="paragraph">Paragraph</option>
                                </select>
                                <small v-if="editingQuestion" class="text-muted">Type cannot be changed after
                                    creation.</small>
                            </div>
                            <div class="col">
                                <label class="form-label">Points</label>
                                <input v-model="questionForm.points" type="number" min="0" class="form-control" />
                            </div>
                            <div class="col-auto d-flex align-items-end pb-1">
                                <div class="form-check">
                                    <input v-model="questionForm.is_required" class="form-check-input" type="checkbox"
                                        id="isRequired" />
                                    <label class="form-check-label" for="isRequired">Required</label>
                                </div>
                            </div>
                        </div>

                        <!-- Options (MC / Checkbox only) -->
                        <div v-if="isObjectiveType">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <label class="form-label mb-0">Options</label>
                                <button class="btn btn-sm btn-outline-primary" @click="addOption">+ Add Option</button>
                            </div>

                            <div class="text-muted small mb-2">
                                <span v-if="questionForm.type === 'multiple_choice'">Mark exactly one correct
                                    answer.</span>
                                <span v-else>Mark all correct answers.</span>
                            </div>

                            <div v-for="(opt, i) in questionForm.options" :key="i"
                                class="d-flex gap-2 align-items-center mb-2">
                                <input v-if="questionForm.type === 'multiple_choice'" type="radio"
                                    class="form-check-input mt-0" :checked="opt.is_correct"
                                    @change="setCorrectSingle(i)" />
                                <input v-else type="checkbox" class="form-check-input mt-0" v-model="opt.is_correct" />
                                <input v-model="opt.option_text" class="form-control form-control-sm"
                                    placeholder="Option text..." />
                                <button class="btn btn-sm btn-outline-danger" @click="removeOption(i)"
                                    :disabled="questionForm.options.length <= 2">✕</button>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-sm" @click="closeQuestionModal">Cancel</button>
                        <button class="btn btn-primary btn-sm" @click="saveQuestion" :disabled="savingQuestion">
                            <span v-if="savingQuestion" class="spinner-border spinner-border-sm me-1"></span>
                            {{ editingQuestion ? 'Save Changes' : 'Add Question' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Grade Modal -->
        <div class="modal fade" tabindex="-1" ref="gradeModalEl">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h6 class="modal-title fw-bold">
                            Grade — {{ gradingSubmission?.student?.first_name }} {{
                                gradingSubmission?.student?.last_name }}
                        </h6>
                        <button type="button" class="btn-close" @click="closeGradeModal"></button>
                    </div>

                    <div class="modal-body" v-if="gradingSubmission">
                        <div v-for="(answer, i) in gradingSubmission.answers" :key="answer.id" class="mb-4">
                            <div class="fw-semibold mb-1">
                                {{ i + 1 }}. {{ answer.question?.question_text }}
                                <span class="text-muted fw-normal small ms-1">
                                    ({{ answer.question?.points }} pts)
                                </span>
                            </div>

                            <!-- Student's answer -->
                            <div class="border rounded p-2 bg-light mb-2 small">
                                <span v-if="answer.answer_text">{{ answer.answer_text }}</span>
                                <span v-else-if="answer.selected_option_ids?.length">
                                    {{ resolveOptionLabels(answer) }}
                                </span>
                                <span v-else class="text-muted">No answer.</span>
                            </div>

                            <!-- Auto-scored indicator -->
                            <div
                                v-if="answer.question?.type === 'multiple_choice' || answer.question?.type === 'checkbox'">
                                <span class="badge" :class="answer.auto_score > 0 ? 'bg-success' : 'bg-danger'">
                                    Auto: {{ answer.auto_score }} / {{ answer.question?.points }}
                                </span>
                            </div>

                            <!-- Manual score for subjective -->
                            <div v-else class="d-flex align-items-center gap-2">
                                <label class="form-label mb-0 small">Score:</label>
                                <input v-model="gradeForm[answer.id]" type="number" min="0"
                                    :max="answer.question?.points" class="form-control form-control-sm"
                                    style="width: 80px" />
                                <span class="text-muted small">/ {{ answer.question?.points }}</span>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Feedback (optional)</label>
                            <textarea v-model="gradeFeedback" class="form-control" rows="2"
                                placeholder="Leave feedback for the student..."></textarea>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="btn btn-secondary btn-sm" @click="closeGradeModal">Cancel</button>
                        <button class="btn btn-primary btn-sm" @click="submitGrade" :disabled="savingGrade">
                            <span v-if="savingGrade" class="spinner-border spinner-border-sm me-1"></span>
                            Submit Grade
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import { assignmentService } from '@/services/assignment'

const route = useRoute()
const router = useRouter()
const assignmentId = Number(route.params.id)

// --- State ---
const assignment = ref(null)
const questions = ref([])
const submissions = ref([])
const summary = ref({})
const activeTab = ref('questions')

const loadingQuestions = ref(false)
const loadingSubmissions = ref(false)
const togglingPublish = ref(false)
const deletingQuestionId = ref(null)
const pushingId = ref(null)
const savingQuestion = ref(false)
const savingGrade = ref(false)

const editingQuestion = ref(null)
const gradingSubmission = ref(null)
const gradeForm = ref({})
const gradeFeedback = ref('')

const questionModalEl = ref(null)
const gradeModalEl = ref(null)
let questionModalInstance = null
let gradeModalInstance = null

const defaultQuestionForm = () => ({
    question_text: '',
    type: 'multiple_choice',
    points: 1,
    is_required: true,
    options: [
        { option_text: '', is_correct: false, order: 0 },
        { option_text: '', is_correct: false, order: 1 },
    ],
})

const questionForm = ref(defaultQuestionForm())

// --- Computed ---
const isObjectiveType = computed(() =>
    ['multiple_choice', 'checkbox'].includes(questionForm.value.type)
)

// --- Lifecycle ---
onMounted(async () => {
    await Promise.all([
        fetchAssignment(),
        fetchQuestions(),
        fetchSummary(),
    ])
})

// --- Fetch ---
async function fetchAssignment() {
    try {
        const res = await assignmentService.show(assignmentId)
        assignment.value = res.data.data
    } catch {
        alert('Failed to load assignment.')
    }
}

async function fetchQuestions() {
    loadingQuestions.value = true
    try {
        const res = await assignmentService.getQuestions(assignmentId)
        questions.value = res.data.data
    } catch {
        alert('Failed to load questions.')
    } finally {
        loadingQuestions.value = false
    }
}

async function fetchSubmissions() {
    loadingSubmissions.value = true
    try {
        const res = await assignmentService.getSubmissions(assignmentId)
        submissions.value = res.data.data
    } catch {
        alert('Failed to load submissions.')
    } finally {
        loadingSubmissions.value = false
    }
}

async function fetchSummary() {
    try {
        const res = await assignmentService.getSubmissionSummary(assignmentId)
        summary.value = res.data.data
    } catch {
        // non-critical, fail silently
    }
}

// Watch tab change to lazy-load submissions
async function onTabChange(tab) {
    activeTab.value = tab
    if (tab === 'submissions' && submissions.value.length === 0) {
        await fetchSubmissions()
    }
}

// --- Publish toggle ---
async function togglePublish() {
    togglingPublish.value = true
    try {
        await assignmentService.adminTogglePublish(assignmentId)
        assignment.value.is_published = !assignment.value.is_published
    } catch {
        alert('Failed to toggle publish status.')
    } finally {
        togglingPublish.value = false
    }
}

// --- Questions ---
function openAddQuestion() {
    editingQuestion.value = null
    questionForm.value = defaultQuestionForm()
    if (!questionModalInstance) questionModalInstance = new Modal(questionModalEl.value)
    questionModalInstance.show()
}

function openEditQuestion(q) {
    editingQuestion.value = q
    questionForm.value = {
        question_text: q.question_text,
        type: q.type,
        points: q.points,
        is_required: q.is_required,
        options: q.options?.map(o => ({ ...o })) ?? [],
    }
    if (!questionModalInstance) questionModalInstance = new Modal(questionModalEl.value)
    questionModalInstance.show()
}

function closeQuestionModal() {
    questionModalInstance?.hide()
}

function onTypeChange() {
    questionForm.value.options = [
        { option_text: '', is_correct: false, order: 0 },
        { option_text: '', is_correct: false, order: 1 },
    ]
}

function addOption() {
    questionForm.value.options.push({
        option_text: '',
        is_correct: false,
        order: questionForm.value.options.length,
    })
}

function removeOption(index) {
    questionForm.value.options.splice(index, 1)
}

function setCorrectSingle(index) {
    questionForm.value.options.forEach((o, i) => {
        o.is_correct = i === index
    })
}

async function saveQuestion() {
    savingQuestion.value = true
    try {
        const payload = {
            question_text: questionForm.value.question_text,
            type: questionForm.value.type,
            points: questionForm.value.points,
            is_required: questionForm.value.is_required,
        }

        if (isObjectiveType.value) {
            payload.options = questionForm.value.options.map((o, i) => ({
                option_text: o.option_text,
                is_correct: o.is_correct,
                order: i,
            }))
        }

        if (editingQuestion.value) {
            await assignmentService.updateQuestion(assignmentId, editingQuestion.value.id, payload)
        } else {
            payload.order = questions.value.length
            await assignmentService.createQuestion(assignmentId, payload)
        }

        await fetchQuestions()
        closeQuestionModal()
    } catch (e) {
        const msg = e.response?.data?.message || 'Failed to save question.'
        alert(msg)
    } finally {
        savingQuestion.value = false
    }
}

async function deleteQuestion(q) {
    if (!confirm(`Delete question "${q.question_text}"?`)) return
    deletingQuestionId.value = q.id
    try {
        await assignmentService.deleteQuestion(assignmentId, q.id)
        questions.value = questions.value.filter(x => x.id !== q.id)
    } catch {
        alert('Failed to delete question.')
    } finally {
        deletingQuestionId.value = null
    }
}

async function moveQuestion(index, direction) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= questions.value.length) return

    const reordered = [...questions.value]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)
    questions.value = reordered

    try {
        await assignmentService.reorderQuestions(assignmentId, reordered.map(q => q.id))
    } catch {
        // revert on failure
        await fetchQuestions()
    }
}

// --- Grading ---
function openGradeModal(submission) {
    gradingSubmission.value = submission
    gradeFeedback.value = ''
    gradeForm.value = {}
    // Pre-fill manual scores for subjective answers
    submission.answers?.forEach(a => {
        if (!['multiple_choice', 'checkbox'].includes(a.question?.type)) {
            gradeForm.value[a.id] = a.manual_score ?? 0
        }
    })
    if (!gradeModalInstance) gradeModalInstance = new Modal(gradeModalEl.value)
    gradeModalInstance.show()
}

function closeGradeModal() {
    gradeModalInstance?.hide()
}

async function submitGrade() {
    savingGrade.value = true
    try {
        const answers = gradingSubmission.value.answers
            .filter(a => !['multiple_choice', 'checkbox'].includes(a.question?.type))
            .map(a => ({
                id: a.id,
                score: gradeForm.value[a.id] ?? 0,
            }))

        await assignmentService.gradeSubmission(assignmentId, gradingSubmission.value.id, {
            answers,
            feedback: gradeFeedback.value || null,
        })

        await fetchSubmissions()
        await fetchSummary()
        closeGradeModal()
    } catch (e) {
        alert(e.response?.data?.message || 'Failed to submit grade.')
    } finally {
        savingGrade.value = false
    }
}

async function pushToGradebook(submission) {
    if (!confirm('Push this score to the grade book?')) return
    pushingId.value = submission.id
    try {
        await assignmentService.pushToGradebook(assignmentId, submission.id)
        submission.pushed_to_gradebook = true
        submission.pushed_at = new Date().toISOString()
    } catch (e) {
        const msg = e.response?.data?.message || 'Failed to push to grade book.'
        alert(msg)
    } finally {
        pushingId.value = null
    }
}

// --- Helpers ---
function resolveOptionLabels(answer) {
    const opts = answer.question?.options ?? []
    return answer.selected_option_ids
        ?.map(id => opts.find(o => o.id === id)?.option_text ?? `Option ${id}`)
        .join(', ')
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

function formatType(type) {
    return {
        multiple_choice: 'Multiple Choice',
        checkbox: 'Checkboxes',
        short_answer: 'Short Answer',
        paragraph: 'Paragraph',
    }[type] ?? type
}

function statusBadge(status) {
    return {
        draft: 'bg-secondary',
        submitted: 'bg-warning text-dark',
        graded: 'bg-success',
    }[status] ?? 'bg-light text-dark'
}
</script>