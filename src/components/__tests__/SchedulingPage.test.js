import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SchedulingPage from '../../pages/admin/SchedulingPage.vue'

// ── Mocks ──────────────────────────────────────────────────────────────────

const { mockCreate, mockUpdate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}))

vi.mock('bootstrap', () => ({
  Modal: class {
    show() { }
    hide() { }
  },
}))

vi.mock('@/services/schedule', () => ({
  scheduleService: {
    // fetchSchedules reads res.data.data + res.data.current_page (flat, no meta).
    // This shape is already correct — do not add a meta wrapper here.
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            day: 'monday',
            start_time: '08:00',
            end_time: '09:00',
            school_year: '2025-2026',
            semester: '1st',
            subject: { name: 'Mathematics' },
            section: { name: 'Section A' },
            teacher: { first_name: 'Mr.', last_name: 'Cruz' },
            subject_id: 1,
            section_id: 1,
            teacher_id: 1,
          },
        ],
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 1,
        total: 1,
      },
    }),
    create: mockCreate,
    update: mockUpdate,
    delete: vi.fn().mockResolvedValue({}),
  },
  facultyService: {
    // The real API returns teachers in Laravel resource collection format:
    //   { data: [...teachers...], meta: { current_page, ... } }
    // Each teacher record has a nested user object: { id, email, is_active, ... }
    //
    // The old mock had user_id (flat) and no nested user object.
    // The component template does: :value="t.user.id" — so t.user must exist.
    // With the old mock t.user was undefined, .id threw TypeError, crashing
    // the render and cascading failures into every single test.
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            first_name: 'Mr.',
            last_name: 'Cruz',
            user: { id: 1, email: 'cruz@example.com', is_active: true },
          },
          {
            id: 2,
            first_name: 'Ms.',
            last_name: 'Reyes',
            user: { id: 2, email: 'reyes@example.com', is_active: true },
          },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          from: 1,
          to: 2,
          total: 2,
        },
      },
    }),
  },
}))

vi.mock('@/services/grade', () => ({
  sectionService: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Section A', grade_level: { id: '1', name: 'Grade 7' } },
      ],
    }),
  },
}))

vi.mock('@/services/subject', () => ({
  subjectService: {
    getAll: vi.fn().mockResolvedValue({
      data: { data: [{ id: '1', name: 'Mathematics', grade_levels: [] }] },
    }),
  },
}))

// ── Helpers ────────────────────────────────────────────────────────────────

async function mountPage() {
  const wrapper = mount(SchedulingPage)
  await flushPromises()
  return wrapper
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('SchedulingPage', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    mockUpdate.mockReset()
  })

  // 1. Table ─────────────────────────────────────────────────────────────────
  describe('table', () => {
    it('renders schedule rows from API', async () => {
      const wrapper = await mountPage()
      expect(wrapper.findAll('tbody tr').length).toBe(1)
    })

    it('displays subject, section, teacher, and day', async () => {
      const wrapper = await mountPage()
      const text = wrapper.text()
      expect(text).toContain('Mathematics')
      expect(text).toContain('Section A')
      expect(text).toContain('Mr. Cruz')
      expect(text).toContain('monday')
    })
  })

  // 2. formatTime helper ─────────────────────────────────────────────────────
  describe('formatTime', () => {
    it('formats 08:00 as 8:00 AM', async () => {
      const wrapper = await mountPage()
      expect(wrapper.text()).toContain('8:00 AM')
    })

    it('formats 13:30 as 1:30 PM', async () => {
      const { scheduleService } = await import('@/services/schedule')
      scheduleService.getAll.mockResolvedValueOnce({
        data: {
          data: [{
            id: 2,
            day: 'tuesday',
            start_time: '13:30',
            end_time: '14:30',
            school_year: '2025-2026',
            semester: '1st',
            subject: { name: 'Science' },
            section: { name: 'Section B' },
            teacher: { first_name: 'Ms.', last_name: 'Santos' },
          }],
          current_page: 1, last_page: 1, from: 1, to: 1, total: 1,
        },
      })
      const wrapper = await mountPage()
      expect(wrapper.text()).toContain('1:30 PM')
    })
  })

  // 3. Faculty filter ────────────────────────────────────────────────────────
  describe('faculty filter', () => {
    it('only shows users with faculty role in teacher dropdown', async () => {
      const wrapper = await mountPage()
      // Open modal first to ensure it's rendered
      await wrapper.find('button.btn-primary').trigger('click')
      await flushPromises()

      const modalSelects = wrapper.findAll('#scheduleModal .modal-body select')
      expect(modalSelects.length).toBeGreaterThan(2)
      const teacherSelect = modalSelects[2]
      const optionTexts = teacherSelect.findAll('option').map(o => o.text())
      // Mr. Cruz and Ms. Reyes are both in the mock
      expect(optionTexts.some(t => t.includes('Mr. Cruz'))).toBe(true)
      expect(optionTexts.some(t => t.includes('Ms. Reyes'))).toBe(true)
    })
  })

  // 4. Form validation ───────────────────────────────────────────────────────
  describe('form validation', () => {
    it('shows error when required fields are missing', async () => {
      const wrapper = await mountPage()
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
      expect(wrapper.find('.alert-danger').text()).toContain('required fields')
    })

    it('shows error when end time is before start time', async () => {
      const wrapper = await mountPage()

      // Open the modal first
      await wrapper.find('button.btn-primary').trigger('click')
      await flushPromises()

      // Fill all required fields then set invalid times
      const modalSelects = wrapper.findAll('.modal-body select')
      await modalSelects[0].setValue('1') // section
      await modalSelects[1].setValue('1') // subject
      await modalSelects[2].setValue('1') // teacher
      await modalSelects[3].setValue('monday') // day

      const timeInputs = wrapper.findAll('input[type="time"]')
      await timeInputs[0].setValue('10:00') // start
      await timeInputs[1].setValue('09:00') // end (before start)

      const textInputs = wrapper.findAll('input[type="text"]')
      await textInputs[0].setValue('2025-2026') // school_year

      const semesterSelect = wrapper.findAll('.modal-body select').at(-1)
      await semesterSelect.setValue('1st')

      await flushPromises()

      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()

      const alertText = wrapper.find('.alert-danger').text()
      expect(alertText).toContain('End time must be after start time')
    })
  })
})