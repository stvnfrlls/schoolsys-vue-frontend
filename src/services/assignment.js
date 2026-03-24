import api from './api';

export const assignmentService = {
    getStudentAssignments(params) {
        return api.get(`/student-assignments`, {
            params
        })
    },

    getFacultyAssignments(params) {
        return api.get(`/faculty-assignments`, {
            params
        })
    },

    getAll(params) {
        return api.get(`/assignments`, {
            params
        })
    },

    createByFaculty(data) {
        return api.post('/faculty-assignments', data);
    },

    create(data) {
        return api.post('/assignments', data);
    },

    updateByFaculty(id, data) {
        return api.put(`/faculty-assignments/${id}`, data);
    },

    update(id, data) {
        return api.put(`/assignments/${id}`, data);
    },

    delete(id) {
        return api.delete(`/assignments/${id}`);
    },

    adminTogglePublish(id) {
        return api.patch(`/assignments/${id}/publish`)
    },

    facultyTogglePublish(id) {
        return api.patch(`/faculty/assignments/${id}/publish`)
    },

    show(id) {
        return api.get(`/assignments/${id}`)
    },

    // Questions
    getQuestions(assignmentId) {
        return api.get(`/assignments/${assignmentId}/questions`)
    },
    createQuestion(assignmentId, data) {
        return api.post(`/assignments/${assignmentId}/questions`, data)
    },
    updateQuestion(assignmentId, questionId, data) {
        return api.put(`/assignments/${assignmentId}/questions/${questionId}`, data)
    },
    deleteQuestion(assignmentId, questionId) {
        return api.delete(`/assignments/${assignmentId}/questions/${questionId}`)
    },
    reorderQuestions(assignmentId, order) {
        return api.post(`/assignments/${assignmentId}/questions/reorder`, { order })
    },

    // Submissions
    getSubmissions(assignmentId) {
        return api.get(`/assignments/${assignmentId}/submissions`)
    },
    getSubmissionSummary(assignmentId) {
        return api.get(`/assignments/${assignmentId}/submissions/summary`)
    },
    gradeSubmission(assignmentId, submissionId, data) {
        return api.post(`/assignments/${assignmentId}/submissions/${submissionId}/grade`, data)
    },
    pushToGradebook(assignmentId, submissionId) {
        return api.post(`/assignments/${assignmentId}/submissions/${submissionId}/push`)
    },

    getMySubmission(assignmentId) {
        return api.get(`/assignments/${assignmentId}/submissions/my`)
    },
    saveDraft(assignmentId, data) {
        return api.post(`/assignments/${assignmentId}/submissions/draft`, data)
    },
    submitAssignment(assignmentId, data) {
        return api.post(`/assignments/${assignmentId}/submissions/submit`, data)
    },
    resubmitAssignment(assignmentId, data) {
        return api.post(`/assignments/${assignmentId}/submissions/resubmit`, data)
    },
}