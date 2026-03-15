import { defineStore } from 'pinia'
import api from '@/services/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        expiresAt: localStorage.getItem('expiresAt') ? parseInt(localStorage.getItem('expiresAt')) : null,
    }),

    getters: {
        isAuthenticated: (state) => {
            if (!state.token || !state.expiresAt) return false
            return Date.now() < state.expiresAt
        },
        userRole: (state) => {
            const role = state.user?.roles?.[0]
            if (!role) return null
            return typeof role === 'string' ? role : role.name
        },
    },

    actions: {
        async login(credentials) {
            const response = await api.post('/login', credentials)
            const { token, user, expiresIn } = response.data

            const expiresAt = Date.now() + (expiresIn * 1000)

            this.token = token
            this.user = user
            this.expiresAt = expiresAt

            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            localStorage.setItem('expiresAt', expiresAt.toString())
        },

        logout() {
            this.token = null
            this.user = null
            this.expiresAt = null

            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('expiresAt')
        },

        checkAndClearExpiredAuth() {
            if (this.token && this.expiresAt && Date.now() >= this.expiresAt) {
                this.logout()
                router.push('/login')
            }
        }
    }
})