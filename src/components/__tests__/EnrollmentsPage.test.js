import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import EnrollmentsPage from '../../pages/admin/EnrollmentsPage.vue'

// ── Mocks ──────────────────────────────────────────────────────────────────

const { mockCreate, mockUpdate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}))

vi.mock('bootstrap', () => ({
  Modal: class {
    show() {}
    hide() {}
  },
}))

vi.mock('@/services/enrollment', () => ({
  enrollmentService: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            student_id: 1,
            grade_level_id: 1,
            section_id: 1,
            school_year: '2025-2026',
            semester: '1st',
            status: 'active',
            student: { id: 1, student_number: 'STU-001', first_name: 'Jane', last_name: 'Doe', middle_name: null, suffix: null },
            grade_level: { id: 1, name: 'Grade 7' },
            section: { id: 1, name: 'Section A' },
          },
          {
            id: 2,
            student_id: 2,
            grade_level_id: 2,
            section_id: 2,
            school_year: '2025-2026',
            semester: '1st',
            status: 'dropped',
            student: { id: 2, student_number: 'STU-002', first_name: 'Bob', last_name: 'Smith', middle_name: null, suffix: null },
            grade_level: { id: 2, name: 'Grade 8' },
            section: { id: 2, name: 'Section B' },
          },
        ],
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 2,
        total: 2,
      },
    }),
    create:  mockCreate,
    update:  mockUpdate,
    delete:  vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('@/services/grade', () => ({
  gradeLevelService: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Grade 7' },
        { id: '2', name: 'Grade 8' },
      ],
    }),
  },
  sectionService: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Section A', grade_level_id: '1' },
        { id: '2', name: 'Section B', grade_level_id: '2' },
      ],
    }),
  },
}))

vi.mock('@/services/student', () => ({
  studentService: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: [
          { id: 1, student_number: 'STU-001', first_name: 'Jane', last_name: 'Doe', middle_name: null, suffix: null },
        ],
      },
    }),
  },
}))

// ── Helpers ────────────────────────────────────────────────────────────────

async function mountPage() {
  const wrapper = mount(EnrollmentsPage)
  await flushPromises()
  return wrapper
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('EnrollmentsPage', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    mockUpdate.mockReset()
  })

  // 1. Table ─────────────────────────────────────────────────────────────────
  describe('table', () => {
    it('renders enrollment rows from API', async () => {
      const wrapper = await mountPage()
      expect(wrapper.findAll('tbody tr').length).toBe(2)
    })

    it('displays student name, grade, section, and status', async () => {
      const wrapper = await mountPage()
      const text = wrapper.text()
      expect(text).toContain('Jane Doe')
      expect(text).toContain('Grade 7')
      expect(text).toContain('Section A')
      expect(text).toContain('active')
    })
  })

  // 2. Filters ───────────────────────────────────────────────────────────────
  describe('filteredEnrollments computed', () => {
    it('shows all enrollments with no filters', async () => {
      const wrapper = await mountPage()
      expect(wrapper.findAll('tbody tr').length).toBe(2)
    })

    it('filters by status', async () => {
      const wrapper = await mountPage()
      // filterStatus is the second select
      const selects = wrapper.findAll('select')
      await selects[1].setValue('active')
      await flushPromises()
      // Only 1 active enrollment
      const rows = wrapper.findAll('tbody tr')
      expect(rows.length).toBe(1)
      expect(wrapper.text()).toContain('Jane Doe')
      expect(wrapper.text()).not.toContain('Bob Smith')
    })

    it('filters by grade level', async () => {
      const wrapper = await mountPage()
      const selects = wrapper.findAll('select')
      await selects[0].setValue('2') // Grade 8
      await flushPromises()
      expect(wrapper.findAll('tbody tr').length).toBe(1)
      expect(wrapper.text()).toContain('Bob Smith')
    })
  })

  // 3. Form validation ────────────────────────────────────────────────────────
  describe('form validation', () => {
    it('shows error when student and section are missing on create', async () => {
      const wrapper = await mountPage()
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
      expect(wrapper.find('.alert-danger').text()).toContain('Student and section are required')
    })

    it('shows error when school_year and semester are missing', async () => {
      const wrapper = await mountPage()

      const selects = wrapper.findAll('.modal-body select')

      await selects[0].setValue('1')

      await selects[1].setValue('1')
      await flushPromises()

      await selects[2].setValue('1')

      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()

      expect(wrapper.find('.alert-danger').text())
        .toContain('Student and section are required.')
    })
  })

  // 4. Status badge ──────────────────────────────────────────────────────────
  describe('statusBadge', () => {
    it('shows bg-success badge for active enrollment', async () => {
      const wrapper = await mountPage()
      const badges = wrapper.findAll('.badge')
      const activeBadge = badges.find(b => b.text() === 'active')
      expect(activeBadge.classes()).toContain('bg-success')
    })

    it('shows bg-danger badge for dropped enrollment', async () => {
      const wrapper = await mountPage()
      const badges = wrapper.findAll('.badge')
      const droppedBadge = badges.find(b => b.text() === 'dropped')
      expect(droppedBadge.classes()).toContain('bg-danger')
    })
  })
})
