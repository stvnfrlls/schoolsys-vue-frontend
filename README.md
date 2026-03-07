# 🏫 School Management System — Frontend

A role-based Vue.js web application for managing school operations including enrollment, scheduling, grading, and attendance.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Roles & Permissions](#roles--permissions)
- [Modules](#modules)

---

## Features

- Role-based access control (Admin, Teacher, Student)
- Full user account management
- Grade level and section management
- Curriculum and subject configuration
- Student enrollment system with duplicate prevention
- Class scheduling with conflict detection
- Grading system with auto-computed final grades
- Daily and per-subject attendance tracking
- Dedicated dashboards for Teachers and Students

---

## Tech Stack

| Layer       | Technology         |
|-------------|--------------------|
| Framework   | Vue 3              |
| State       | Pinia              |
| Routing     | Vue Router         |
| HTTP Client | Axios              |
| Build Tool  | Vite               |

---

## Getting Started

### Prerequisites

- Node.js `>= 18.x`
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/your-repo.git
cd your-repo

# Install dependencies
npm install

# Copy environment config
cp .env.example .env
```

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Running the App

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
src/
├── assets/             # Static assets (images, fonts)
├── components/         # Reusable UI components
├── layouts/            # Page layout wrappers (Admin, Teacher, Student)
├── pages/              # Route-level views
│   ├── admin/
│   ├── teacher/
│   └── student/
├── router/             # Vue Router config with route guards
├── stores/             # Pinia stores (auth, users, grades, etc.)
├── services/           # Axios API service modules
├── composables/        # Reusable Vue composition functions
└── utils/              # Helper functions
```

---

## Roles & Permissions

| Permission  | Admin | Teacher | Student |
|-------------|:-----:|:-------:|:-------:|
| View        | ✅    | ✅      | ✅      |
| Create      | ✅    | ✅      | ❌      |
| Edit        | ✅    | ✅      | ❌      |
| Delete      | ✅    | ❌      | ❌      |

Access to pages and features is enforced via **Vue Router navigation guards** and component-level permission checks.

---

## Modules

### 1. User Management
Create, edit, and deactivate user accounts. Assign roles and manage basic profiles (name, email, role). Includes password reset functionality.

### 2. Grade & Section Management
Configure grade levels (e.g. Grade 7–10) and sections (e.g. Section A, B). Set room assignments and capacity. Grades and sections can be activated or deactivated.

### 3. Curriculum Management
Define subjects with a name, code, and description. Assign subjects to specific grade levels and configure unit or hour allocations.

### 4. Enrollment System
Enroll students into a grade and section for a given school year or semester. Duplicate enrollment is prevented. Admins can view and manage the full student list per section.

### 5. Scheduling System
Assign subjects and teachers to sections with defined time slots (day, start time, end time). The system detects and flags schedule conflicts automatically.

### 6. Grading System
Configure grading components (written work, performance tasks, quarterly assessment) with custom weights. Grades are input per student per subject, and the final grade is auto-computed. Failing grades are flagged.

### 7. Attendance
Record attendance daily or per subject. Statuses include Present, Absent, and Late. Attendance summaries are available per student, and excessive absences trigger a flag.

### 8. Teacher Dashboard
Teachers can view their assigned subjects and sections, input and update grades, record attendance for their classes, and review their personal schedule.

### 9. Student Dashboard
Students can view their profile and enrollment details, class schedule, grades per subject, and their own attendance record.

---