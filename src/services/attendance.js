import api from './api'

export const attendanceService = {
    getAll(filters = {}) {
        const params = new URLSearchParams()
        if (filters.enrollment_id) params.append('enrollment_id', filters.enrollment_id)
        if (filters.subject_id) params.append('subject_id', filters.subject_id)
        if (filters.date) params.append('date', filters.date)
        if (filters.status) params.append('status', filters.status)
        return api.get(`/attendance?${params.toString()}`)
    },

    // POST uses updateOrCreate on the API — safe to call multiple times for same date
    save(data) {
        return api.post('/attendance', data)
    },

    update(id, data) {
        return api.put(`/attendance/${id}`, data)
    },

    delete(id) {
        return api.delete(`/attendance/${id}`)
    },

    // NOTE: These two routes may not be registered in api.php yet.
    // Add to routes/api.php if needed:
    //   Route::get('/attendance/summary/{enrollment}', [AttendanceController::class, 'summary']);
    //   Route::get('/attendance/flagged', [AttendanceController::class, 'flagged']);
    summary(enrollmentId) {
        return api.get(`/attendance/summary/${enrollmentId}`)
    },

    flagged() {
        return api.get('/attendance/flagged')
    },
}