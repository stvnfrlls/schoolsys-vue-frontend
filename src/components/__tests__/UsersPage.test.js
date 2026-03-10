import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UsersPage from '../../pages/admin/UsersPage.vue'

// ── Mocks ──────────────────────────────────────────────────────────────────

// vi.mock() is hoisted to the top of the file by Vitest.
// Any variables used inside the factory must also be hoisted via vi.hoisted()
// otherwise they won't be initialized yet when the factory runs.
const { mockCreate, mockUpdate, mockSyncRoles } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockSyncRoles: vi.fn(),
}))

// Bootstrap Modal requires a real DOM — mock it to prevent crashes in test env.
// Must use a class, NOT an arrow function — arrow functions cannot be used as
// constructors with `new` and will throw: "() => ... is not a constructor"
vi.mock('bootstrap', () => ({
  Modal: class {
    show() { }
    hide() { }
  },
}))

vi.mock('@/services/user', () => ({
  userService: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            roles: [{ id: 1, name: 'admin' }],
            is_active: true,
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
    syncRoles: mockSyncRoles,
    activate: vi.fn().mockResolvedValue({}),
    deactivate: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
  roleService: {
    // IDs must be strings here because VTU's setValue() on a <select> element
    // always produces a string via event.target.value. If IDs were integers,
    // the find(r => r.id === form.role_id) comparison would be 2 === "2" → false,
    // causing selectedRoleName to return "" and isProfileRole to stay false.
    getAll: vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'admin' },
        { id: '2', name: 'student' },
        { id: '3', name: 'faculty' },
      ],
    }),
  },
}))

// ── Helpers ────────────────────────────────────────────────────────────────

async function mountPage() {
  const wrapper = mount(UsersPage)
  await flushPromises() // wait for onMounted fetchUsers + fetchRoles
  return wrapper
}

// Role select is always the first <select> in the page.
// Pass role ID as a STRING — setValue() sets element.value which is always a string.
async function selectRole(wrapper, roleId) {
  await wrapper.findAll('select')[0].setValue(String(roleId))
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('UsersPage', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    mockUpdate.mockReset()
    mockSyncRoles.mockReset()
  })

  // 1. Table ────────────────────────────────────────────────────────────────
  describe('table', () => {
    it('renders user rows from API', async () => {
      const wrapper = await mountPage()
      expect(wrapper.findAll('tbody tr').length).toBe(1)
    })

    it('displays user name, email, and role badge', async () => {
      const wrapper = await mountPage()
      const text = wrapper.text()
      expect(text).toContain('John Doe')
      expect(text).toContain('john@example.com')
      expect(text).toContain('admin')
    })
  })

  // 2. Name field visibility ────────────────────────────────────────────────
  describe('name field visibility', () => {
    it('is visible when no role is selected', async () => {
      const wrapper = await mountPage()
      // No profile section = no <hr> divider
      expect(wrapper.find('hr.my-3').exists()).toBe(false)
    })

    it('is visible when admin role is selected', async () => {
      const wrapper = await mountPage()
      await selectRole(wrapper, 1) // admin
      expect(wrapper.find('hr.my-3').exists()).toBe(false)
    })

    it('is hidden when student role is selected', async () => {
      const wrapper = await mountPage()
      await selectRole(wrapper, 2) // student
      // Profile section appears — name field does not
      expect(wrapper.find('hr.my-3').exists()).toBe(true)
      expect(wrapper.text()).toContain('student Profile')
    })

    it('is hidden when faculty role is selected', async () => {
      const wrapper = await mountPage()
      await selectRole(wrapper, 3) // faculty
      expect(wrapper.find('hr.my-3').exists()).toBe(true)
      expect(wrapper.text()).toContain('faculty Profile')
    })
  })

  // 3. Profile fields ───────────────────────────────────────────────────────
  describe('profile fields', () => {
    it('shows shared fields for student', async () => {
      const wrapper = await mountPage()
      await selectRole(wrapper, 2)
      const text = wrapper.text()
      expect(text).toContain('First Name')
      expect(text).toContain('Last Name')
      expect(text).toContain('Middle Name')
      expect(text).toContain('Date of Birth')
      expect(text).toContain('Gender')
    })

    it('shows shared fields for faculty', async () => {
      const wrapper = await mountPage()
      await selectRole(wrapper, 3)
      const text = wrapper.text()
      expect(text).toContain('First Name')
      expect(text).toContain('Last Name')
      expect(text).toContain('Date of Birth')
      expect(text).toContain('Gender')
    })

    it('does not show profile fields for admin', async () => {
      const wrapper = await mountPage()
      await selectRole(wrapper, 1)
      const text = wrapper.text()
      expect(text).not.toContain('First Name')
      expect(text).not.toContain('Last Name')
    })

    it('shows specialization only for faculty', async () => {
      const wrapper = await mountPage()
      await selectRole(wrapper, 3)
      expect(wrapper.text()).toContain('Specialization')
    })

    it('does not show specialization for student', async () => {
      const wrapper = await mountPage()
      await selectRole(wrapper, 2)
      expect(wrapper.text()).not.toContain('Specialization')
    })
  })

  // 4. Validation ───────────────────────────────────────────────────────────
  describe('form validation', () => {
    it('shows error when email is missing on create', async () => {
      const wrapper = await mountPage()
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
    })

    it('shows error when required profile fields are empty for student', async () => {
      const wrapper = await mountPage()
      await selectRole(wrapper, 2)
      await wrapper.find('input[type="email"]').setValue('student@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      // Intentionally skip first_name, last_name, date_of_birth, gender
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()
      expect(wrapper.find('.alert-danger').text()).toContain('required profile fields')
    })

    it('shows error when required profile fields are empty for faculty', async () => {
      const wrapper = await mountPage()
      await selectRole(wrapper, 3)
      await wrapper.find('input[type="email"]').setValue('faculty@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()
      expect(wrapper.find('.alert-danger').text()).toContain('required profile fields')
    })
  })

  // 5. Double submit prevention ─────────────────────────────────────────────
  describe('double submit prevention', () => {
    it('disables save button while request is in flight', async () => {
      mockCreate.mockImplementation(() => new Promise(() => { })) // never resolves
      const wrapper = await mountPage()
      await wrapper.find('input[type="email"]').setValue('test@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      // Don't flushPromises — we want to inspect mid-flight state
      expect(wrapper.find('.modal-footer .btn-primary').attributes('disabled')).toBeDefined()
    })

    it('does not call create twice on rapid double click', async () => {
      mockCreate.mockResolvedValue({ data: { id: 99 } })
      const wrapper = await mountPage()
      await wrapper.find('input[type="email"]').setValue('test@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      const saveBtn = wrapper.find('.modal-footer .btn-primary')
      // Rapid double click — second click should be blocked by saving guard
      await saveBtn.trigger('click')
      await saveBtn.trigger('click')
      await flushPromises()
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })
  })

  // 6. Create payload ───────────────────────────────────────────────────────
  describe('create payload', () => {
    it('sends role as name string (not id)', async () => {
      mockCreate.mockResolvedValue({ data: { id: 99 } })
      const wrapper = await mountPage()
      await wrapper.find('input[type="email"]').setValue('admin@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      await selectRole(wrapper, 1) // id:1 → name:'admin'
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin' })
      )
    })

    it('sends profile fields in payload for student', async () => {
      mockCreate.mockResolvedValue({ data: { id: 99 } })
      const wrapper = await mountPage()
      await wrapper.find('input[type="email"]').setValue('student@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      await selectRole(wrapper, 2) // student

      // Text input order when student selected (name field hidden):
      // [0] first_name, [1] last_name, [2] middle_name, [3] suffix
      const textInputs = wrapper.findAll('input[type="text"]')
      await textInputs[0].setValue('Jane')
      await textInputs[1].setValue('Doe')

      await wrapper.find('input[type="date"]').setValue('2000-01-01')
      // Select order: [0] role, [1] gender
      await wrapper.findAll('select')[1].setValue('female')

      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'student',
          first_name: 'Jane',
          last_name: 'Doe',
          date_of_birth: '2000-01-01',
          gender: 'female',
        })
      )
    })

    it('sends specialization in payload for faculty', async () => {
      mockCreate.mockResolvedValue({ data: { id: 99 } })
      const wrapper = await mountPage()
      await wrapper.find('input[type="email"]').setValue('faculty@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      await selectRole(wrapper, 3) // faculty

      // Text input order when faculty selected (name field hidden):
      // [0] first_name, [1] last_name, [2] middle_name, [3] suffix, [4] specialization
      const textInputs = wrapper.findAll('input[type="text"]')
      await textInputs[0].setValue('Bob')
      await textInputs[1].setValue('Smith')
      await textInputs[4].setValue('Mathematics')

      await wrapper.find('input[type="date"]').setValue('1985-05-15')
      await wrapper.findAll('select')[1].setValue('male')

      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'faculty',
          first_name: 'Bob',
          last_name: 'Smith',
          specialization: 'Mathematics',
        })
      )
    })
  })
})