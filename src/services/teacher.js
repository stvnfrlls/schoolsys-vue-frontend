import api from './api'

export const teacherService = {
    // GET /teacher/schedule
    mySchedule(filters = {}) {
        const params = new URLSearchParams()
        if (filters.school_year) params.append('school_year', filters.school_year)
        if (filters.semester) params.append('semester', filters.semester)
        if (filters.day) params.append('day', filters.day)
        return api.get(`/teacher/schedule?${params.toString()}`)
    },

    // GET /teacher/subjects — returns subjects grouped with their sections
    mySubjects(filters = {}) {
        const params = new URLSearchParams()
        if (filters.school_year) params.append('school_year', filters.school_year)
        if (filters.semester) params.append('semester', filters.semester)
        return api.get(`/teacher/subjects?${params.toString()}`)
    },
}