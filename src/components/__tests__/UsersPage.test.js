import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UsersPage from '../../pages/admin/UsersPage.vue'

const { mockCreate, mockUpdate, mockSyncRoles } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockSyncRoles: vi.fn(),
}))

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
        meta: {
          current_page: 1,
          last_page: 1,
          from: 1,
          to: 1,
          total: 1,
        },
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
    getAll: vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'admin' },
        { id: '2', name: 'student' },
        { id: '3', name: 'faculty' },
      ],
    }),
  },
}))

async function mountPage() {
  const wrapper = mount(UsersPage)
  await flushPromises()
  return wrapper
}

async function selectRole(wrapper, roleId) {
  await wrapper.findAll('select')[0].setValue(String(roleId))
}

async function openModal(wrapper) {
  await wrapper.find('button.btn-primary').trigger('click')
  await flushPromises()
}

describe('UsersPage', () => {
  beforeEach(() => {
    mockCreate.mockReset()
    mockUpdate.mockReset()
    mockSyncRoles.mockReset()
  })

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

  describe('name field visibility', () => {
    it('is visible when no role is selected', async () => {
      const wrapper = await mountPage()
      await openModal(wrapper)
      expect(wrapper.find('hr.my-3').exists()).toBe(false)
    })

    it('is visible when admin role is selected', async () => {
      const wrapper = await mountPage()
      await openModal(wrapper)
      await selectRole(wrapper, 1)
      expect(wrapper.find('hr.my-3').exists()).toBe(false)
    })

    it('is hidden when student role is selected', async () => {
      const wrapper = await mountPage()
      await openModal(wrapper)
      await selectRole(wrapper, 2)
      expect(wrapper.find('hr.my-3').exists()).toBe(true)
      expect(wrapper.text()).toContain('student Profile')
    })

    it('is hidden when faculty role is selected', async () => {
      const wrapper = await mountPage()
      await openModal(wrapper)
      await selectRole(wrapper, 3)
      expect(wrapper.find('hr.my-3').exists()).toBe(true)
      expect(wrapper.text()).toContain('faculty Profile')
    })
  })

  describe('profile fields', () => {
    it('shows shared fields for student', async () => {
      const wrapper = await mountPage()
      await openModal(wrapper)
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
      await openModal(wrapper)
      await selectRole(wrapper, 3)
      const text = wrapper.text()
      expect(text).toContain('First Name')
      expect(text).toContain('Last Name')
      expect(text).toContain('Date of Birth')
      expect(text).toContain('Gender')
    })

    it('does not show profile fields for admin', async () => {
      const wrapper = await mountPage()
      await openModal(wrapper)
      await selectRole(wrapper, 1)
      const text = wrapper.text()
      expect(text).not.toContain('First Name')
      expect(text).not.toContain('Last Name')
    })

    it('shows specialization only for faculty', async () => {
      const wrapper = await mountPage()
      await openModal(wrapper)
      await selectRole(wrapper, 3)
      expect(wrapper.text()).toContain('Specialization')
    })

    it('does not show specialization for student', async () => {
      const wrapper = await mountPage()
      await openModal(wrapper)
      await selectRole(wrapper, 2)
      expect(wrapper.text()).not.toContain('Specialization')
    })
  })

  describe('form validation', () => {
    it('shows error when email is missing on create', async () => {
      const wrapper = await mountPage()
      await openModal(wrapper)
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()
      expect(wrapper.find('.alert-danger').exists()).toBe(true)
    })

    it('shows error when required profile fields are empty for student', async () => {
      const wrapper = await mountPage()
      await openModal(wrapper)
      await selectRole(wrapper, 2)
      await wrapper.find('input[type="email"]').setValue('student@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()
      expect(wrapper.find('.alert-danger').text()).toContain('required profile fields')
    })

    it('shows error when required profile fields are empty for faculty', async () => {
      const wrapper = await mountPage()
      await openModal(wrapper)
      await selectRole(wrapper, 3)
      await wrapper.find('input[type="email"]').setValue('faculty@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()
      expect(wrapper.find('.alert-danger').text()).toContain('required profile fields')
    })
  })

  describe('double submit prevention', () => {
    it('disables save button while request is in flight', async () => {
      mockCreate.mockImplementation(() => new Promise(() => { }))
      const wrapper = await mountPage()
      await openModal(wrapper)
      await wrapper.find('input[type="email"]').setValue('test@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      expect(wrapper.find('.modal-footer .btn-primary').attributes('disabled')).toBeDefined()
    })

    it('does not call create twice on rapid double click', async () => {
      mockCreate.mockResolvedValue({ data: { id: 99 } })
      const wrapper = await mountPage()
      await openModal(wrapper)
      await wrapper.find('input[type="email"]').setValue('test@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      const saveBtn = wrapper.find('.modal-footer .btn-primary')
      saveBtn.trigger('click')
      saveBtn.trigger('click')
      await flushPromises()
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })
  })

  describe('create payload', () => {
    it('sends role as name string (not id)', async () => {
      mockCreate.mockResolvedValue({ data: { id: 99 } })
      const wrapper = await mountPage()
      await openModal(wrapper)
      await wrapper.find('input[type="email"]').setValue('admin@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      await selectRole(wrapper, 1)
      await wrapper.find('.modal-footer .btn-primary').trigger('click')
      await flushPromises()
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin' })
      )
    })

    it('sends profile fields in payload for student', async () => {
      mockCreate.mockResolvedValue({ data: { id: 99 } })
      const wrapper = await mountPage()
      await openModal(wrapper)
      await wrapper.find('input[type="email"]').setValue('student@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      await selectRole(wrapper, 2)

      const textInputs = wrapper.findAll('input[type="text"]')
      await textInputs[0].setValue('Jane')
      await textInputs[1].setValue('Doe')

      await wrapper.find('input[type="date"]').setValue('2000-01-01')
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
      await openModal(wrapper)
      await wrapper.find('input[type="email"]').setValue('faculty@example.com')
      await wrapper.find('input[type="password"]').setValue('password123')
      await selectRole(wrapper, 3)

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