import api from './api'

export const userService = {
    getAll(page = 1) {
        return api.get(`/users?page=${page}`)
    },

    getOne(id) {
        return api.get(`/users/${id}`)
    },

    create(data) {
        return api.post('/users', data)
    },

    update(id, data) {
        return api.put(`/users/${id}`, data)
    },

    delete(id) {
        return api.delete(`/users/${id}`)
    },

    activate(id) {
        return api.patch(`/users/${id}/activate`)
    },

    deactivate(id) {
        return api.patch(`/users/${id}/deactivate`)
    },

    syncRoles(id, roleIds) {
        return api.put(`/users/${id}/roles`, { roles: roleIds })
    }
}

export const roleService = {
    getAll() {
        return api.get('/roles')
    }
}