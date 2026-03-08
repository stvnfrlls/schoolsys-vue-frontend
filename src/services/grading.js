import api from './api'

export const gradingComponentService = {
    getAll(filters = {}) {
        const params = new URLSearchParams()
        if (filters.subject_id) params.append('subject_id', filters.subject_id)
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active)
        return api.get(`/grading-components?${params.toString()}`)
    },

    getOne(id) {
        return api.get(`/grading-components/${id}`)
    },

    create(data) {
        return api.post('/grading-components', data)
    },

    update(id, data) {
        return api.put(`/grading-components/${id}`, data)
    },

    delete(id) {
        return api.delete(`/grading-components/${id}`)
    },
}

export const studentGradeService = {
    getAll(filters = {}) {
        const params = new URLSearchParams()
        if (filters.enrollment_id) params.append('enrollment_id', filters.enrollment_id)
        if (filters.subject_id) params.append('subject_id', filters.subject_id)
        if (filters.quarter) params.append('quarter', filters.quarter)
        if (filters.is_failing !== undefined) params.append('is_failing', filters.is_failing)
        return api.get(`/student-grades?${params.toString()}`)
    },

    // POST creates or updates via updateOrCreate on the API side
    save(data) {
        return api.post('/student-grades', data)
    },

    update(id, data) {
        return api.put(`/student-grades/${id}`, data)
    },

    delete(id) {
        return api.delete(`/student-grades/${id}`)
    },
}