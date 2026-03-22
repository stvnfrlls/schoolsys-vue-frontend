import api from './api';

export const assignmentService = {
    getStudentAssignments(params) {
        return api.get(`/student-assignments`, {
            params
        })
    },

    getFacultyAssignments(params) {
        return api.get(`/faculty-assignments`, {
            params
        })
    },

    getAll(params) {
        return api.get(`/assignments`, {
            params
        })
    },

    createByFaculty(data) {
        return api.post('/faculty-assignments', data);
    },

    create(data) {
        return api.post('/assignments', data);
    },

    updateByFaculty(id, data) {
        return api.put(`/faculty-assignments/${id}`, data);
    },

    update(id, data) {
        return api.put(`/assignments/${id}`, data);
    },

    delete(id) {
        return api.delete(`/assignments/${id}`);
    },

    adminTogglePublish(id) {
        return api.patch(`/assignments/${id}/publish`)
    },

    facultyTogglePublish(id) {
        return api.patch(`/faculty/assignments/${id}/publish`)
    }
}