import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/pages/LandingPage.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/pages/auth/LoginPage.vue'),
        meta: { guestOnly: true }
    },

    // ── Admin ────────────────────────────────────────────────────────────
    {
        path: '/admin',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, role: 'admin' },
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/pages/admin/DashboardPage.vue'),
            },
            {
                path: 'users',
                name: 'Users',
                component: () => import('@/pages/admin/UsersPage.vue'),
            },
            {
                path: 'grades-sections',
                name: 'Grades & Sections',
                component: () => import('@/pages/admin/GradeSectionPage.vue'),
            },
            {
                path: 'subjects',
                name: 'Subjects',
                component: () => import('@/pages/admin/SubjectsPage.vue'),
            },
            {
                path: 'students',
                name: 'Students',
                component: () => import('@/pages/admin/StudentsPage.vue'),
            },
            {
                path: 'faculty',
                name: 'Faculty',
                component: () => import('@/pages/admin/TeachersPage.vue'),
            },
            {
                path: 'enrollments',
                name: 'Enrollments',
                component: () => import('@/pages/admin/EnrollmentsPage.vue'),
            },
            {
                path: 'scheduling',
                name: 'Scheduling',
                component: () => import('@/pages/admin/SchedulingPage.vue'),
            },
            {
                path: 'grading',
                name: 'Grading',
                component: () => import('@/pages/admin/GradingPage.vue'),
            },
            {
                path: 'attendance',
                name: 'Attendance',
                component: () => import('@/pages/admin/AttendancePage.vue'),
            },
            {
                path: 'assignment',
                name: 'Assignment',
                component: () => import('@/pages/admin/AssignmentPage.vue'),
            },
            {
                path: 'assignment/:id/manage',
                name: 'ManageAssignment',
                component: () => import('@/pages/admin/ManageAssignmentPage.vue'),
            },
        ]
    },

    // ── Teacher ──────────────────────────────────────────────────────────
    {
        path: '/teacher',
        component: () => import('@/layouts/TeacherLayout.vue'),
        meta: { requiresAuth: true, role: 'faculty' },
        children: [
            {
                path: 'dashboard',
                name: 'Teacher Dashboard',
                component: () => import('@/pages/teacher/DashboardPage.vue'),
            },
            {
                path: 'schedule',
                name: 'My Schedule',
                component: () => import('@/pages/teacher/SchedulePage.vue'),
            },
            {
                path: 'subjects',
                name: 'My Subjects',
                component: () => import('@/pages/teacher/SubjectsPage.vue'),
            },
            {
                path: 'attendance',
                name: 'Teacher Attendance',
                component: () => import('@/pages/teacher/AttendancePage.vue'),
            },
            {
                path: 'assignment',
                name: 'Teacher Assignment',
                component: () => import('@/pages/teacher/AssignmentPage.vue'),
            },
            {
                path: 'assignment/:id/manage',
                name: 'TeacherManageAssignment',
                component: () => import('@/pages/teacher/ManageAssignmentPage.vue'),
            },
        ]
    },

    // ── Student ──────────────────────────────────────────────────────────
    {
        path: '/student',
        component: () => import('@/layouts/StudentLayout.vue'),
        meta: { requiresAuth: true, role: 'student' },
        children: [
            {
                path: 'dashboard',
                name: 'My Profile',
                component: () => import('@/pages/student/DashboardPage.vue'),
            },
            {
                path: 'schedule',
                name: 'Student Schedule',
                component: () => import('@/pages/student/SchedulePage.vue'),
            },
            {
                path: 'grades',
                name: 'My Grades',
                component: () => import('@/pages/student/GradesPage.vue'),
            },
            {
                path: 'attendance',
                name: 'Student Attendance',
                component: () => import('@/pages/student/AttendancePage.vue'),
            },
            {
                path: 'assignment',
                name: 'Student Assignment',
                component: () => import('@/pages/student/AssignmentPage.vue'),
            },
            {
                path: 'assignment/:id/take',
                name: 'TakeAssignment',
                component: () => import('@/pages/student/TakeAssignmentPage.vue'),
            },
        ]
    },

    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Route guard
router.beforeEach((to) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return '/login'
    }

    if (to.meta.guestOnly && auth.isAuthenticated) {
        return roleHomeRoute(auth.userRole)
    }

    if (to.meta.role && auth.userRole !== to.meta.role) {
        if (auth.isAuthenticated) {
            return roleHomeRoute(auth.userRole)
        }
        return '/login'
    }
})

// Returns the home route for a given role
function roleHomeRoute(role) {
    if (role === 'admin' || role === 'sub-admin') return '/admin/dashboard'
    if (role === 'faculty') return '/teacher/dashboard'
    if (role === 'student') return '/student/dashboard'
    return '/login'
}

export default router