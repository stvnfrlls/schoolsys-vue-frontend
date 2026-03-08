import api from './api'

export const studentService = {
    // Admin routes
    getAll(page = 1) {
        return api.get(`/students?page=${page}`)
    },

    getOne(id) {
        return api.get(`/students/${id}`)
    },

    update(id, data) {
        return api.put(`/students/${id}`, data)
    },

    // ── Student self-service routes ───────────────────────────────────────
    // NOTE: GET /student/profile is not yet registered in routes/api.php.
    // Add this inside the student role middleware group:
    //   Route::get('/student/profile', [StudentController::class, 'myProfile']);
    myProfile() {
        return api.get('/student/profile')
    },

    mySchedule(filters = {}) {
        const params = new URLSearchParams()
        if (filters.school_year) params.append('school_year', filters.school_year)
        if (filters.semester) params.append('semester', filters.semester)
        return api.get(`/student/schedule?${params.toString()}`)
    },

    // Returns grades grouped by subject
    myGrades(filters = {}) {
        const params = new URLSearchParams()
        if (filters.subject_id) params.append('subject_id', filters.subject_id)
        if (filters.quarter) params.append('quarter', filters.quarter)
        if (filters.enrollment_id) params.append('enrollment_id', filters.enrollment_id)
        return api.get(`/student/grades?${params.toString()}`)
    },

    // Returns { summary, records }
    myAttendance(filters = {}) {
        const params = new URLSearchParams()
        if (filters.subject_id) params.append('subject_id', filters.subject_id)
        if (filters.status) params.append('status', filters.status)
        if (filters.enrollment_id) params.append('enrollment_id', filters.enrollment_id)
        return api.get(`/student/attendance?${params.toString()}`)
    },
}