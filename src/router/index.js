import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/pages/auth/LoginPage.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/admin',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, role: 'admin' },
        children: [
            {
                path: 'dashboard',
                name: 'AdminDashboard',
                component: () => import('@/pages/admin/DashboardPage.vue'),
            }
        ]
    },
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/login'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Route guard
router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return next('/login')
    }

    if (to.meta.guestOnly && auth.isAuthenticated) {
        return next('/admin/dashboard')
    }

    if (to.meta.role && auth.userRole !== to.meta.role) {
        return next('/login')
    }

    next()
})

export default router