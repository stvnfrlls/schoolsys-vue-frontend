import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        userRole: (state) => {
            const role = state.user?.roles?.[0]
            if (!role) return null
            return typeof role === 'string' ? role : role.name
        },
    },

    actions: {
        async login(credentials) {
            const response = await api.post('/login', credentials)
            const { token, user } = response.data

            this.token = token
            this.user = user

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
        },

        logout() {
            this.token = null
            this.user = null

            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    }
})