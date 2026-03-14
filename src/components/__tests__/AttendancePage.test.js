import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AttendancePage from '../../pages/admin/AttendancePage.vue'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockSave = vi.hoisted(() => vi.fn())
const mockFlagged = vi.hoisted(() => vi.fn())

vi.mock('@/services/attendance', () => ({
  attendanceService: {
    getAll: vi.fn().mockResolvedValue({ data: [] }),
    save: mockSave,
    flagged: mockFlagged,
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
    getAll: vi.fn().mockResolvedValue({ data: { data: [{ id: '1', name: 'Math' }] } }),
  },
}))

vi.mock('@/services/enrollment', () => ({
  enrollmentService: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: 10,
            // loadAttendanceSheet filters by: String(e.section?.id) === String(filterSectionId.value)
            // The old mock had section_id: '1' (flat) with no nested section object.
            // So e.section was undefined, e.section?.id was undefined, the filter
            // returned nothing, attendanceSheet stayed empty, and Jane Doe never
            // appeared — causing all 3 sheet tests to fail.
            // Fix: use a nested section object to match what the component reads.
            section: { id: '1', name: 'Section A' },
            status: 'active',
            student: {
              id: 1,
              student_number: 'STU-001',
              first_name: 'Jane',
              middle_name: null,
              last_name: 'Doe',
              suffix: null,
            },
          },
        ],
      },
    }),
  },
}))

// ── Helpers ────────────────────────────────────────────────────────────────

async function mountPage() {
  const wrapper = mount(AttendancePage)
  await flushPromises()
  return wrapper
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('AttendancePage', () => {
  beforeEach(() => {
    mockSave.mockReset()
    mockFlagged.mockReset()
    mockFlagged.mockResolvedValue({ data: [] })
  })

  // 1. Tabs ──────────────────────────────────────────────────────────────────
  describe('tabs', () => {
    it('renders both tabs', async () => {
      const wrapper = await mountPage()
      const text = wrapper.text()
      expect(text).toContain('Take Attendance')
      expect(text).toContain('Flagged Students')
    })

    it('defaults to the Take Attendance tab', async () => {
      const wrapper = await mountPage()
      const activeTab = wrapper.find('.nav-link.active')
      expect(activeTab.text()).toContain('Take Attendance')
    })

    it('switches to Flagged Students tab on click', async () => {
      mockFlagged.mockResolvedValue({ data: [] })
      const wrapper = await mountPage()
      const tabs = wrapper.findAll('.nav-link')
      await tabs[1].trigger('click')
      await flushPromises()
      expect(wrapper.find('.nav-link.active').text()).toContain('Flagged Students')
    })

    it('calls fetchFlagged when Flagged tab is clicked', async () => {
      mockFlagged.mockResolvedValue({ data: [] })
      const wrapper = await mountPage()
      const tabs = wrapper.findAll('.nav-link')
      await tabs[1].trigger('click')
      await flushPromises()
      expect(mockFlagged).toHaveBeenCalledTimes(1)
    })
  })

  // 2. Take Attendance tab ───────────────────────────────────────────────────
  describe('take attendance', () => {
    it('shows prompt to select section and date before loading', async () => {
      const wrapper = await mountPage()
      expect(wrapper.text()).toContain('Select a section and date')
    })

    it('disables Load button when section is not selected', async () => {
      const wrapper = await mountPage()
      const loadBtn = wrapper.find('button.btn-outline-secondary')
      expect(loadBtn.attributes('disabled')).toBeDefined()
    })

    it('shows section options from API', async () => {
      const wrapper = await mountPage()
      expect(wrapper.text()).toContain('Grade 7')
      expect(wrapper.text()).toContain('Section A')
    })
  })

  // 3. Attendance sheet ──────────────────────────────────────────────────────
  describe('attendance sheet after load', () => {
    async function loadSheet(wrapper) {
      // Select section
      await wrapper.find('select').setValue('1')
      // Date is pre-filled with today — just click Load
      const loadBtn = wrapper.findAll('button').find(b => b.text() === 'Load')
      await loadBtn.trigger('click')
      await flushPromises()
    }

    it('renders student rows after loading', async () => {
      const wrapper = await mountPage()
      await loadSheet(wrapper)
      expect(wrapper.text()).toContain('Jane Doe')
    })

    it('shows Present/Absent/Late buttons for each student', async () => {
      const wrapper = await mountPage()
      await loadSheet(wrapper)
      const text = wrapper.text()
      expect(text).toContain('Present')
      expect(text).toContain('Absent')
      expect(text).toContain('Late')
    })

    it('markAll present sets all rows to present', async () => {
      const wrapper = await mountPage()
      await loadSheet(wrapper)
      // Mark all absent first
      const absentBtn = wrapper.findAll('button').find(b => b.text() === 'Absent' && b.classes().includes('btn-outline-danger'))
      await absentBtn.trigger('click')
      // Now mark all present
      const presentBtn = wrapper.findAll('button').find(b => b.text() === 'Present' && b.classes().includes('btn-outline-success'))
      await presentBtn.trigger('click')
      // The status count should show 1 present
      expect(wrapper.text()).toContain('1 present')
    })

    it('calls attendanceService.save when Save button is clicked', async () => {
      mockSave.mockResolvedValue({ data: { id: 99 } })
      const wrapper = await mountPage()
      await loadSheet(wrapper)
      const saveBtn = wrapper.findAll('button').find(b => b.text() === 'Save' && b.classes().includes('btn-primary'))
      await saveBtn.trigger('click')
      await flushPromises()
      expect(mockSave).toHaveBeenCalledTimes(1)
      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          enrollment_id: 10,
          status: 'present',
        })
      )
    })
  })

  // 4. Flagged Students tab ──────────────────────────────────────────────────
  describe('flagged students', () => {
    it('shows flagged students from API', async () => {
      mockFlagged.mockResolvedValue({
        data: [
          {
            id: 1,
            absence_count: 7,
            student: { first_name: 'Bob', last_name: 'Smith', middle_name: null, suffix: null, student_number: 'STU-002' },
            section: { name: 'Section B', grade_level: { name: 'Grade 8' } },
          },
        ],
      })
      const wrapper = await mountPage()
      const tabs = wrapper.findAll('.nav-link')
      await tabs[1].trigger('click')
      await flushPromises()
      expect(wrapper.text()).toContain('Bob Smith')
      expect(wrapper.text()).toContain('7')
    })

    it('shows empty state when no flagged students', async () => {
      mockFlagged.mockResolvedValue({ data: [] })
      const wrapper = await mountPage()
      const tabs = wrapper.findAll('.nav-link')
      await tabs[1].trigger('click')
      await flushPromises()
      expect(wrapper.text()).toContain('No flagged students')
    })

    it('shows error message when flagged route returns 404', async () => {
      mockFlagged.mockRejectedValue({ response: { status: 404 } })
      const wrapper = await mountPage()
      const tabs = wrapper.findAll('.nav-link')
      await tabs[1].trigger('click')
      await flushPromises()
      expect(wrapper.text()).toContain('not registered')
    })
  })
})
