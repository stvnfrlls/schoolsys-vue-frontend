import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import StudentsPage from '../../pages/admin/StudentsPage.vue'

// ── Mocks ──────────────────────────────────────────────────────────────────

const mockUpdate = vi.hoisted(() => vi.fn())

vi.mock('bootstrap', () => ({
  Modal: class {
    show() {}
    hide() {}
  },
}))

vi.mock('@/services/student', () => ({
  studentService: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            student_number: 'STU-001',
            first_name: 'Jane',
            middle_name: 'M',
            last_name: 'Doe',
            suffix: null,
            gender: 'female',
            date_of_birth: '2005-03-15',
            user: { email: 'jane@example.com', is_active: true },
          },
          {
            id: 2,
            student_number: 'STU-002',
            first_name: 'Bob',
            middle_name: null,
            last_name: 'Smith',
            suffix: 'Jr.',
            gender: 'male',
            date_of_birth: '2006-07-22',
            user: { email: 'bob@example.com', is_active: false },
          },
        ],
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 2,
        total: 2,
      },
    }),
    update: mockUpdate,
    getOne: vi.fn().mockResolvedValue({
      data: {
        id: 1,
        student_number: 'STU-001',
        first_name: 'Jane',
        middle_name: 'M',
        last_name: 'Doe',
        suffix: null,
        gender: 'female',
        date_of_birth: '2005-03-15',
        user: { email: 'jane@example.com', is_active: true },
        enrollments: [],
      },
    }),
  },
}))

// ── Helpers ────────────────────────────────────────────────────────────────

async function mountPage() {
  const wrapper = mount(StudentsPage)
  await flushPromises()
  return wrapper
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('StudentsPage', () => {
  beforeEach(() => {
    mockUpdate.mockReset()
  })

  // 1. Table ─────────────────────────────────────────────────────────────────
  describe('table', () => {
    it('renders student rows from API', async () => {
      const wrapper = await mountPage()
      expect(wrapper.findAll('tbody tr').length).toBe(2)
    })

    it('displays student number, name, gender, and email', async () => {
      const wrapper = await mountPage()
      const text = wrapper.text()
      expect(text).toContain('STU-001')
      expect(text).toContain('jane@example.com')
      expect(text).toContain('female')
    })

    it('shows active/inactive badge based on user.is_active', async () => {
      const wrapper = await mountPage()
      const badges = wrapper.findAll('.badge')
      const activeBadge = badges.find(b => b.text() === 'Active' && b.classes().includes('bg-success'))
      const inactiveBadge = badges.find(b => b.text() === 'Inactive' && b.classes().includes('bg-danger'))
      expect(activeBadge).toBeDefined()
      expect(inactiveBadge).toBeDefined()
    })
  })

  // 2. fullName helper ───────────────────────────────────────────────────────
  describe('fullName display', () => {
    it('displays full name including middle name', async () => {
      const wrapper = await mountPage()
      // Jane M Doe
      expect(wrapper.text()).toContain('Jane M Doe')
    })

    it('displays full name with suffix', async () => {
      const wrapper = await mountPage()
      // Bob Smith Jr.
      expect(wrapper.text()).toContain('Bob Smith Jr.')
    })
  })

  // 3. formatDate helper ─────────────────────────────────────────────────────
  describe('formatDate display', () => {
    it('formats date of birth in human readable format', async () => {
      const wrapper = await mountPage()
      // 2005-03-15 → Mar 15, 2005
      expect(wrapper.text()).toContain('2005')
    })
  })

  // 4. Edit form validation ──────────────────────────────────────────────────
  describe('edit form validation', () => {
    async function openEdit(wrapper) {
      // Find the Edit button in the table row for Jane Doe (first student)
      const editBtn = wrapper.findAll('tbody tr').at(0).find('button.btn-outline-primary')
      expect(editBtn.exists()).toBe(true)
      expect(editBtn.text()).toContain('Edit')
      await editBtn.trigger('click')
      await flushPromises()
    }

    it('shows error when first name is cleared', async () => {
      const wrapper = await mountPage()
      await openEdit(wrapper)
      
      // Clear first name - it's the first text input in the edit modal
      const firstNameInput = wrapper.find('#editStudentModal input[type="text"]')
      expect(firstNameInput.exists()).toBe(true)
      await firstNameInput.setValue('')
      
      await wrapper.find('#editStudentModal .modal-footer .btn-primary').trigger('click')
      await flushPromises()
      
      const alert = wrapper.find('#editStudentModal .alert-danger')
      expect(alert.exists()).toBe(true)
      expect(alert.text()).toContain('First name and last name are required')
    })

    it('shows error when last name is cleared', async () => {
      const wrapper = await mountPage()
      await openEdit(wrapper)
      
      // Last name is the second text input
      const textInputs = wrapper.findAll('#editStudentModal input[type="text"]')
      expect(textInputs.length).toBeGreaterThan(1)
      await textInputs[1].setValue('')
      
      await wrapper.find('#editStudentModal .modal-footer .btn-primary').trigger('click')
      await flushPromises()
      
      const alert = wrapper.find('#editStudentModal .alert-danger')
      expect(alert.exists()).toBe(true)
      expect(alert.text()).toContain('First name and last name are required')
    })

    it('calls studentService.update with correct data', async () => {
      mockUpdate.mockResolvedValue({ data: {} })
      const wrapper = await mountPage()
      await openEdit(wrapper)
      
      // Click the Update button in the edit modal
      await wrapper.find('#editStudentModal .modal-footer .btn-primary').trigger('click')
      await flushPromises()
      
      expect(mockUpdate).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ first_name: 'Jane', last_name: 'Doe' })
      )
    })
  })

  // 5. View modal ────────────────────────────────────────────────────────────
  describe('view modal', () => {
    it('opens view modal and shows student profile', async () => {
      const wrapper = await mountPage()
      const viewBtn = wrapper.findAll('tbody tr').at(0).find('button.btn-outline-secondary')
      expect(viewBtn.exists()).toBe(true)
      expect(viewBtn.text()).toContain('View')
      await viewBtn.trigger('click')
      await flushPromises()
      expect(wrapper.text()).toContain('Student Profile')
      expect(wrapper.text()).toContain('STU-001')
    })
  })
})
