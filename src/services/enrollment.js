import api from './api'

export const enrollmentService = {
    getAll(page = 1, filters = {}) {
        const params = new URLSearchParams({ page })
        if (filters.status) params.append('status', filters.status)
        if (filters.grade_level_id) params.append('grade_level_id', filters.grade_level_id)
        return api.get(`/enrollments?${params.toString()}`)
    },

    getOne(id) {
        return api.get(`/enrollments/${id}`)
    },

    create(data) {
        return api.post('/enrollments', data)
    },

    update(id, data) {
        return api.put(`/enrollments/${id}`, data)
    },

    delete(id) {
        return api.delete(`/enrollments/${id}`)
    }
}