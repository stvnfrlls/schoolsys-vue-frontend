import api from './api'

export const scheduleService = {
    getAll(page = 1, filters = {}) {
        const params = new URLSearchParams({ page })
        if (filters.section_id) params.append('section_id', filters.section_id)
        if (filters.teacher_id) params.append('teacher_id', filters.teacher_id)
        if (filters.subject_id) params.append('subject_id', filters.subject_id)
        if (filters.day) params.append('day', filters.day)
        if (filters.school_year) params.append('school_year', filters.school_year)
        if (filters.semester) params.append('semester', filters.semester)
        return api.get(`/schedules?${params.toString()}`)
    },

    getOne(id) {
        return api.get(`/schedules/${id}`)
    },

    create(data) {
        return api.post('/schedules', data)
    },

    update(id, data) {
        return api.put(`/schedules/${id}`, data)
    },

    delete(id) {
        return api.delete(`/schedules/${id}`)
    },

    // GET /sections/{section}/schedules
    bySection(sectionId, filters = {}) {
        const params = new URLSearchParams()
        if (filters.school_year) params.append('school_year', filters.school_year)
        if (filters.semester) params.append('semester', filters.semester)
        if (filters.day) params.append('day', filters.day)
        return api.get(`/sections/${sectionId}/schedules?${params.toString()}`)
    }
}

// NOTE: There is no dedicated /teachers endpoint in the API.
// This fetches all users with a large per_page and filters by faculty role client-side.
// If your API adds a role filter to GET /users, update the query param here.
export const facultyService = {
    getAll() {
        return api.get('/teachers?per_page=200')
    }
}