import api from './api'

export const gradeLevelService = {
    getAll() {
        return api.get('/grade-levels')
    },
    create(data) {
        return api.post('/grade-levels', data)
    },
    update(id, data) {
        return api.put(`/grade-levels/${id}`, data)
    },
    delete(id) {
        return api.delete(`/grade-levels/${id}`)
    },
    activate(id) {
        return api.patch(`/grade-levels/${id}/activate`)
    },
    deactivate(id) {
        return api.patch(`/grade-levels/${id}/deactivate`)
    }
}

export const sectionService = {
    getAll() {
        return api.get('/sections')
    },
    create(data) {
        return api.post('/sections', data)
    },
    update(id, data) {
        return api.put(`/sections/${id}`, data)
    },
    delete(id) {
        return api.delete(`/sections/${id}`)
    },
    activate(id) {
        return api.patch(`/sections/${id}/activate`)
    },
    deactivate(id) {
        return api.patch(`/sections/${id}/deactivate`)
    }
}