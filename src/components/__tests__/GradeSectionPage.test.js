import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import GradeSectionPage from '../../pages/admin/GradeSectionPage.vue'

// ── Mocks ──────────────────────────────────────────────────────────────────

const { mockCreateGrade, mockCreateSection } = vi.hoisted(() => ({
  mockCreateGrade:   vi.fn(),
  mockCreateSection: vi.fn(),
}))

vi.mock('bootstrap', () => ({
  Modal: class {
    show() {}
    hide() {}
  },
}))

vi.mock('@/services/grade', () => ({
  gradeLevelService: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Grade 7', level: 7, sections_count: 2, is_active: true },
        { id: 2, name: 'Grade 8', level: 8, sections_count: 1, is_active: false },
      ],
    }),
    create:     mockCreateGrade,
    update:     vi.fn().mockResolvedValue({}),
    delete:     vi.fn().mockResolvedValue({}),
    activate:   vi.fn().mockResolvedValue({}),
    deactivate: vi.fn().mockResolvedValue({}),
  },
  sectionService: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Section A', grade_level_id: 1, room: 'Room 101', capacity: 40, is_active: true, grade_level: { id: 1, name: 'Grade 7' } },
        { id: 2, name: 'Section B', grade_level_id: 2, room: 'Room 102', capacity: 35, is_active: true, grade_level: { id: 2, name: 'Grade 8' } },
      ],
    }),
    create:     mockCreateSection,
    update:     vi.fn().mockResolvedValue({}),
    delete:     vi.fn().mockResolvedValue({}),
    activate:   vi.fn().mockResolvedValue({}),
    deactivate: vi.fn().mockResolvedValue({}),
  },
}))

// ── Helpers ────────────────────────────────────────────────────────────────

async function mountPage() {
  const wrapper = mount(GradeSectionPage)
  await flushPromises()
  return wrapper
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('GradeSectionPage', () => {
  beforeEach(() => {
    mockCreateGrade.mockReset()
    mockCreateSection.mockReset()
  })

  // 1. Tabs ──────────────────────────────────────────────────────────────────
  describe('tabs', () => {
    it('renders both tabs', async () => {
      const wrapper = await mountPage()
      expect(wrapper.text()).toContain('Grade Levels')
      expect(wrapper.text()).toContain('Sections')
    })

    it('defaults to Grade Levels tab', async () => {
      const wrapper = await mountPage()
      expect(wrapper.find('.nav-link.active').text()).toBe('Grade Levels')
    })

    it('switches to Sections tab on click', async () => {
      const wrapper = await mountPage()
      const tabs = wrapper.findAll('.nav-link')
      await tabs[1].trigger('click')
      expect(wrapper.find('.nav-link.active').text()).toBe('Sections')
    })
  })

  // 2. Grade Levels tab ──────────────────────────────────────────────────────
  describe('grade levels', () => {
    it('renders grade level rows from API', async () => {
      const wrapper = await mountPage()
      expect(wrapper.text()).toContain('Grade 7')
      expect(wrapper.text()).toContain('Grade 8')
    })

    it('shows active/inactive badges correctly', async () => {
      const wrapper = await mountPage()
      const badges = wrapper.findAll('.badge')
      const activeBadge = badges.find(b => b.text() === 'Active' && b.classes().includes('bg-success'))
      const inactiveBadge = badges.find(b => b.text() === 'Inactive' && b.classes().includes('bg-danger'))
      expect(activeBadge).toBeDefined()
      expect(inactiveBadge).toBeDefined()
    })
  })

  // 3. Grade form validation ──────────────────────────────────────────────────
  describe('grade form validation', () => {
    it('shows error when name and level are missing', async () => {
      const wrapper = await mountPage()
      // Click save without filling anything
      // Find the grade modal's save button
      const saveBtn = wrapper.findAll('.modal-footer .btn-primary')[0]
      await saveBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('.alert-danger').text()).toContain('Name and level are required')
    })

    it('calls gradeLevelService.create with correct data', async () => {
      mockCreateGrade.mockResolvedValue({ data: { id: 3 } })
      const wrapper = await mountPage()
      const textInputs = wrapper.findAll('#gradeModal input[type="text"], #gradeModal input[type="number"]')
      // Name input
      await textInputs[0].setValue('Grade 9')
      // Level input
      await textInputs[1].setValue('9')
      const saveBtn = wrapper.findAll('.modal-footer .btn-primary')[0]
      await saveBtn.trigger('click')
      await flushPromises()
      expect(mockCreateGrade).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Grade 9' })
      )
    })
  })

  // 4. Sections tab and filter ────────────────────────────────────────────────
  describe('sections', () => {
    async function goToSections(wrapper) {
      const tabs = wrapper.findAll('.nav-link')
      await tabs[1].trigger('click')
    }

    it('renders all sections when no grade filter is applied', async () => {
      const wrapper = await mountPage()
      await goToSections(wrapper)
      expect(wrapper.text()).toContain('Section A')
      expect(wrapper.text()).toContain('Section B')
    })

    it('filters sections by grade level', async () => {
      const wrapper = await mountPage()
      await goToSections(wrapper)
      // The section filter select
      const filterSelect = wrapper.find('.form-select-sm')
      await filterSelect.setValue(1)
      await flushPromises()
      expect(wrapper.text()).toContain('Section A')
      expect(wrapper.text()).not.toContain('Section B')
    })
  })

  // 5. Section form validation ────────────────────────────────────────────────
  describe('section form validation', () => {
    async function goToSections(wrapper) {
      const tabs = wrapper.findAll('.nav-link')
      await tabs[1].trigger('click')
    }

    it('shows error when grade level and name are missing', async () => {
      const wrapper = await mountPage()
      await goToSections(wrapper)
      // Section modal save button is the second btn-primary in modal-footer
      const saveBtn = wrapper.findAll('.modal-footer .btn-primary')[1]
      await saveBtn.trigger('click')
      await flushPromises()
      expect(wrapper.text()).toContain('Grade level and section name are required')
    })
  })
})
