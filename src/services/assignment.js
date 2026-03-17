import api from './api';

export const assignmentService = {
    getAll(params) {
        return api.get(`/assignments`, {
            params
        })
    },

    create(data) {
        return api.post('/assignments', data);
    },

    update(id, data) {
        return api.put(`/assignments/${id}`, data);
    },

    delete(id) {
        return api.delete(`/assignments/${id}`);
    },
}