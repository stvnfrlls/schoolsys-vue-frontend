import api from './api'

export const studentService = {
    getAll(page = 1) {
        return api.get(`/students?page=${page}`)
    },

    getOne(id) {
        return api.get(`/students/${id}`)
    },

    update(id, data) {
        return api.put(`/students/${id}`, data)
    }
}