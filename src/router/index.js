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
            }, {
                path: 'users',
                name: 'Users',
                component: () => import('@/pages/admin/UsersPage.vue'),
            }, {
                path: 'grades-sections',
                name: 'Grades & Sections',
                component: () => import('@/pages/admin/GradeSectionPage.vue'),
            }, {
                path: 'subjects',
                name: 'Subjects',
                component: () => import('@/pages/admin/SubjectsPage.vue'),
            }, {
                path: 'students',
                name: 'Students',
                component: () => import('@/pages/admin/StudentsPage.vue'),
            },
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