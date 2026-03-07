import api from './api'

export const subjectService = {
    getAll(page = 1) {
        return api.get(`/subjects?page=${page}`)
    },

    getOne(id) {
        return api.get(`/subjects/${id}`)
    },

    create(data) {
        return api.post('/subjects', data)
    },

    update(id, data) {
        return api.put(`/subjects/${id}`, data)
    },

    delete(id) {
        return api.delete(`/subjects/${id}`)
    },

    activate(id) {
        return api.patch(`/subjects/${id}/activate`)
    },

    deactivate(id) {
        return api.patch(`/subjects/${id}/deactivate`)
    },

    assignGradeLevel(id, data) {
        return api.post(`/subjects/${id}/grade-levels`, data)
    },

    removeGradeLevel(id, gradeLevelId) {
        return api.delete(`/subjects/${id}/grade-levels/${gradeLevelId}`)
    }
}