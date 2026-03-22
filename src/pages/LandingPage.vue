<template>
    <div class="landing">
        <!-- Navbar -->
        <nav class="landing-nav" :class="{ 'nav-scrolled': scrolled }">
            <div class="container d-flex align-items-center justify-content-between">
                <span class="nav-logo">SchoolSys</span>
                <RouterLink to="/login" class="nav-cta">Sign In</RouterLink>
            </div>
        </nav>

        <!-- Hero -->
        <section class="hero-section">
            <div class="hero-grid-overlay"></div>
            <div class="container hero-container">
                <div class="row justify-content-center">
                    <div class="col-lg-9 text-center">
                        <div class="hero-eyebrow">School Management System</div>
                        <h1 class="hero-heading">
                            Manage your school.<br />
                            <em>Every role, one place.</em>
                        </h1>
                        <p class="hero-body">
                            SchoolSys gives administrators, teachers, and students a unified platform to handle
                            enrollment, attendance, scheduling, and academic records — without the operational
                            overhead.
                        </p>
                        <div class="hero-actions">
                            <RouterLink to="/login" class="btn hero-btn-primary">Sign In to SchoolSys</RouterLink>
                            <a href="#features" class="hero-btn-ghost">See what's included</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features -->
        <section class="features-section" id="features">
            <div class="container">
                <div class="section-eyebrow">Core Features</div>
                <h2 class="section-heading">Everything a school needs, built in.</h2>
                <p class="section-subheading">
                    No third-party integrations. No piecing together tools. One system that covers the full
                    operational scope of a school.
                </p>
                <div class="row g-4 mt-3">
                    <div class="col-md-6 col-lg-3" v-for="feature in features" :key="feature.title">
                        <div class="feature-card">
                            <div class="feature-num">{{ feature.num }}</div>
                            <h5 class="feature-title">{{ feature.title }}</h5>
                            <p class="feature-desc">{{ feature.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- How it works -->
        <section class="how-section" id="how-it-works">
            <div class="container">
                <div class="section-eyebrow">How It Works</div>
                <h2 class="section-heading">Three roles. One workflow.</h2>
                <p class="section-subheading">
                    SchoolSys is structured around how schools actually operate, with distinct responsibilities
                    and views for each role.
                </p>
                <div class="row g-4 mt-3">
                    <div class="col-md-4" v-for="step in steps" :key="step.role">
                        <div class="step-card">
                            <div class="step-role-badge">{{ step.role }}</div>
                            <h5 class="step-title">{{ step.title }}</h5>
                            <ul class="step-list">
                                <li v-for="item in step.items" :key="item">{{ item }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="landing-footer">
            <div class="container d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
                <span class="footer-logo">SchoolSys</span>
                <span class="footer-copy">&copy; {{ currentYear }} SchoolSys. School Management System.</span>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const currentYear = computed(() => new Date().getFullYear())

function onScroll() {
    scrolled.value = window.scrollY > 60
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const features = [
    {
        num: '01',
        title: 'Enrollment & Records',
        description:
            'Register students, assign them to grade levels and sections, and maintain a complete academic history.',
    },
    {
        num: '02',
        title: 'Attendance Tracking',
        description:
            'Teachers log attendance per class period. Admins get a cross-section view across all grades and sections.',
    },
    {
        num: '03',
        title: 'Grade Management',
        description:
            'Teachers submit grades per subject. Students and administrators can view full academic performance records.',
    },
    {
        num: '04',
        title: 'Scheduling & Assignments',
        description:
            'Build class schedules and distribute assignments directly to enrolled students per subject and section.',
    },
]

const steps = [
    {
        role: 'Administrator',
        title: 'Set up and maintain the system',
        items: [
            'Create and manage user accounts',
            'Define grade levels and sections',
            'Configure subjects and enrollments',
            'Assign faculty to class schedules',
        ],
    },
    {
        role: 'Teacher',
        title: 'Run day-to-day class operations',
        items: [
            'View assigned class schedules',
            'Record and monitor student attendance',
            'Post and manage assignments',
            'Submit grades per subject',
        ],
    },
    {
        role: 'Student',
        title: 'Monitor your academic progress',
        items: [
            'View your personal class schedule',
            'Check and submit assignments',
            'Track attendance records',
            'Review grades per subject',
        ],
    },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

/* ── Root ────────────────────────────────────────────── */
.landing {
    --navy: #0d1b2a;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --white: #ffffff;
    --light: #f8fafc;
    --border: #e2e8f0;
    --text: #1e293b;
    --muted: #64748b;
    font-family: 'Outfit', sans-serif;
    color: var(--text);
}

/* ── Navbar ──────────────────────────────────────────── */
.landing-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 1.25rem 0;
    transition: background 0.3s ease, box-shadow 0.3s ease, padding 0.3s ease;
}

.nav-logo {
    font-weight: 700;
    font-size: 1.2rem;
    color: var(--white);
    letter-spacing: -0.02em;
}

.nav-cta {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--white);
    border: 1px solid rgba(255, 255, 255, 0.35);
    padding: 0.45rem 1.25rem;
    border-radius: 4px;
    text-decoration: none;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.nav-cta:hover {
    background: var(--white);
    color: var(--navy);
    border-color: var(--white);
}

.nav-scrolled {
    background: var(--white);
    box-shadow: 0 1px 0 var(--border);
    padding: 0.875rem 0;
}

.nav-scrolled .nav-logo {
    color: var(--navy);
}

.nav-scrolled .nav-cta {
    color: var(--accent);
    border-color: var(--accent);
}

.nav-scrolled .nav-cta:hover {
    background: var(--accent);
    color: var(--white);
}

/* ── Hero ────────────────────────────────────────────── */
.hero-section {
    min-height: 100vh;
    background-color: var(--navy);
    display: flex;
    align-items: center;
    padding: 130px 0 90px;
    position: relative;
    overflow: hidden;
}

.hero-grid-overlay {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(255, 255, 255, 0.028) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.028) 1px, transparent 1px);
    background-size: 64px 64px;
    pointer-events: none;
}

.hero-container {
    position: relative;
    z-index: 1;
}

.hero-eyebrow {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.12);
    padding: 0.35rem 0.9rem;
    border-radius: 2px;
    margin-bottom: 1.75rem;
}

.hero-heading {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.4rem, 5vw, 4rem);
    line-height: 1.15;
    color: var(--white);
    margin-bottom: 1.5rem;
    letter-spacing: -0.01em;
}

.hero-heading em {
    font-style: italic;
    color: rgba(255, 255, 255, 0.55);
}

.hero-body {
    font-size: 1.05rem;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.5);
    max-width: 580px;
    margin: 0 auto 2.5rem;
    line-height: 1.75;
}

.hero-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.hero-btn-primary {
    background: var(--accent);
    border: 1px solid var(--accent);
    color: var(--white);
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.75rem 2.25rem;
    border-radius: 4px;
    text-decoration: none;
    transition: background 0.2s, transform 0.15s;
}

.hero-btn-primary:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
    transform: translateY(-1px);
    color: var(--white);
}

.hero-btn-ghost {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.45);
    text-decoration: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 1px;
    transition: color 0.2s, border-color 0.2s;
}

.hero-btn-ghost:hover {
    color: rgba(255, 255, 255, 0.8);
    border-color: rgba(255, 255, 255, 0.5);
}

/* ── Shared Section Styles ───────────────────────────── */
.section-eyebrow {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 0.75rem;
}

.section-heading {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1.75rem, 3vw, 2.35rem);
    color: var(--text);
    letter-spacing: -0.01em;
    margin-bottom: 0.75rem;
}

.section-subheading {
    color: var(--muted);
    font-size: 0.975rem;
    line-height: 1.75;
    max-width: 540px;
}

/* ── Features ────────────────────────────────────────── */
.features-section {
    padding: 100px 0;
    background: var(--white);
}

.feature-card {
    padding: 2rem 1.75rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    height: 100%;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
    border-color: #bfdbfe;
    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.07);
}

.feature-num {
    font-family: 'DM Serif Display', serif;
    font-size: 1.9rem;
    color: #cbd5e1;
    line-height: 1;
    margin-bottom: 1.25rem;
    letter-spacing: -0.02em;
}

.feature-title {
    font-weight: 600;
    font-size: 0.975rem;
    color: var(--text);
    margin-bottom: 0.6rem;
}

.feature-desc {
    font-size: 0.875rem;
    color: var(--muted);
    line-height: 1.7;
    margin-bottom: 0;
}

/* ── How It Works ────────────────────────────────────── */
.how-section {
    padding: 100px 0;
    background: var(--light);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
}

.step-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 2rem 1.75rem;
    height: 100%;
}

.step-role-badge {
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: #eff6ff;
    color: var(--accent);
    padding: 0.3rem 0.8rem;
    border-radius: 2px;
    margin-bottom: 1.25rem;
}

.step-title {
    font-weight: 600;
    font-size: 1rem;
    color: var(--text);
    margin-bottom: 1rem;
    line-height: 1.4;
}

.step-list {
    padding-left: 1.1rem;
    margin-bottom: 0;
}

.step-list li {
    font-size: 0.875rem;
    color: var(--muted);
    line-height: 1.7;
    margin-bottom: 0.35rem;
}

/* ── Footer ──────────────────────────────────────────── */
.landing-footer {
    background: var(--navy);
    padding: 1.75rem 0;
}

.footer-logo {
    font-weight: 700;
    font-size: 0.975rem;
    color: var(--white);
    letter-spacing: -0.01em;
}

.footer-copy {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.35);
}
</style>