import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SubjectsPage from '../../pages/admin/SubjectsPage.vue'

// ── Mocks ──────────────────────────────────────────────────────────────────

const { mockCreate, mockUpdate, mockAssign, mockRemove } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockAssign: vi.fn(),
  mockRemove: vi.fn(),
}))

vi.mock('bootstrap', () => ({
  Modal: class {
    show() {}
    hide() {}
  },
}))

vi.mock('@/services/subject', () => ({
  subjectService: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            name: 'Mathematics',
            code: 'MAT',
            description: 'Core math subject',
            is_active: true,
            grade_levels: [{ id: 1, name: 'Grade 7', pivot: { units: 1, hours_per_week: 3 } }],
          },
          {
            id: 2,
            name: 'Science',
            code: 'SCI',
            description: null,
            is_active: false,
            grade_levels: [],
          },
        ],
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 2,
        total: 2,
      },
    }),
    getOne: vi.fn().mockResolvedValue({
      data: {
        id: 1,
        name: 'Mathematics',
        code: 'MAT',
        description: 'Core math subject',
        is_active: true,
        grade_levels: [{ id: 1, name: 'Grade 7', pivot: { units: 1, hours_per_week: 3 } }],
      },
    }),
    create:           mockCreate,
    update:           mockUpdate,
    delete:           vi.fn().mockResolvedValue({}),
    activate:         vi.fn().mockResolvedValue({}),
    deactivate:       vi.fn().mockResolvedValue({}),
    assignGradeLevel: mockAssign,
    removeGradeLevel: mockRemove,
  },
}))

vi.mock('@/services/grade', () => ({
  gradeLevelService: {
    getAll: vi.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Grade 7' },
        { id: 2, name: 'Grade 8' },
      ],
    }),
  },
}))

// ── Helpers ────────────────────────────────────────────────────────────────

async function mountPage() {
  const wrapper = mount(SubjectsPage)
  await flushPromises()
  return wrapper
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('SubjectsPage', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    mockUpdate.mockReset()
    mockAssign.mockReset()
    mockRemove.mockReset()
  })

  // 1. Table ─────────────────────────────────────────────────────────────────
  describe('table', () => {
    it('renders subject rows from API', async () => {
      const wrapper = await mountPage()
      expect(wrapper.findAll('tbody tr').length).toBe(2)
    })

    it('displays subject name, code, and grade level badges', async () => {
      const wrapper = await mountPage()
      const text = wrapper.text()
      expect(text).toContain('Mathematics')
      expect(text).toContain('MAT')
      expect(text).toContain('Grade 7')
    })

    it('shows "None" for subjects without grade levels', async () => {
      const wrapper = await mountPage()
      expect(wrapper.text()).toContain('None')
    })

    it('shows active/inactive status badges', async () => {
      const wrapper = await mountPage()
      const badges = wrapper.findAll('.badge')
      const activeBadge = badges.find(b => b.text() === 'Active' && b.classes().includes('bg-success'))
      const inactiveBadge = badges.find(b => b.text() === 'Inactive' && b.classes().includes('bg-danger'))
      expect(activeBadge).toBeDefined()
      expect(inactiveBadge).toBeDefined()
    })
  })

  // 2. Create form validation ────────────────────────────────────────────────
  describe('create form validation', () => {
    it('shows error when name and code are missing', async () => {
      const wrapper = await mountPage()
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
      expect(wrapper.find('.alert-danger').text()).toContain('Name and code are required')
    })

    it('calls subjectService.create with name and code', async () => {
      mockCreate.mockResolvedValue({ data: { id: 3 } })
      const wrapper = await mountPage()
      const textInputs = wrapper.findAll('#subjectModal input[type="text"]')
      await textInputs[0].setValue('English')
      await textInputs[1].setValue('ENG')
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'English', code: 'ENG' })
      )
    })
  })

  // 3. availableGradeLevels computed ─────────────────────────────────────────
  describe('availableGradeLevels', () => {
    it('excludes already-assigned grade levels from the assign dropdown', async () => {
      const wrapper = await mountPage()
      // Open the Assign modal for Mathematics (which already has Grade 7)
      const assignBtn = wrapper.findAll('button').find(b => b.text() === 'Assign')
      await assignBtn.trigger('click')
      await flushPromises()
      // The grade level dropdown in the assign modal should not contain Grade 7
      const assignSelect = wrapper.find('#assignModal select')
      const options = assignSelect.findAll('option')
      const optionTexts = options.map(o => o.text())
      expect(optionTexts.some(t => t.includes('Grade 7'))).toBe(false)
      expect(optionTexts.some(t => t.includes('Grade 8'))).toBe(true)
    })
  })

  // 4. Assign modal validation ───────────────────────────────────────────────
  describe('assign modal validation', () => {
    it('shows error when no grade level is selected', async () => {
      const wrapper = await mountPage()
      const assignBtn = wrapper.findAll('button').find(b => b.text() === 'Assign')
      await assignBtn.trigger('click')
      await flushPromises()
      // Click Add without selecting a grade level
      const addBtn = wrapper.find('#assignModal .modal-footer .btn-primary')
      await addBtn.trigger('click')
      await flushPromises()
      expect(wrapper.find('#assignModal .alert-danger').text()).toContain('Please select a grade level')
    })
  })

  // 5. Edit form ─────────────────────────────────────────────────────────────
  describe('edit form', () => {
    it('pre-fills edit form with existing subject data', async () => {
      const wrapper = await mountPage()
      const editBtn = wrapper.findAll('button').find(b => b.text() === 'Edit')
      await editBtn.trigger('click')
      await flushPromises()
      const nameInput = wrapper.find('#subjectModal input[type="text"]')
      expect(nameInput.element.value).toBe('Mathematics')
    })
  })
})
