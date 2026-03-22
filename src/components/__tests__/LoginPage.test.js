import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import LoginPage from '../../pages/auth/LoginPage.vue'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockLogin = vi.fn()
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ login: mockLogin, userRole: 'admin' }),
}))

const mountOptions = {
  global: { stubs: { RouterLink: true } },
}

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockLogin.mockReset()
    mockPush.mockReset()
  })

  it('shows error when both fields are empty', async () => {
    const wrapper = mount(LoginPage, mountOptions)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.alert-danger').text()).toBe('Email and password are required.')
  })

  it('shows error when only email is filled', async () => {
    const wrapper = mount(LoginPage, mountOptions)
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.alert-danger').text()).toBe('Email and password are required.')
  })

  it('shows error when only password is filled', async () => {
    const wrapper = mount(LoginPage, mountOptions)
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.alert-danger').text()).toBe('Email and password are required.')
  })

  it('calls auth.login with the correct credentials', async () => {
    mockLogin.mockResolvedValue()
    const wrapper = mount(LoginPage, mountOptions)
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('redirects to correct dashboard on successful login', async () => {
    mockLogin.mockResolvedValue()
    const wrapper = mount(LoginPage, mountOptions)
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(mockPush).toHaveBeenCalledWith('/admin/dashboard')
  })

  it('shows invalid credentials error on 401', async () => {
    mockLogin.mockRejectedValue({ response: { status: 401 } })
    const wrapper = mount(LoginPage, mountOptions)
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('wrongpassword')
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.find('.alert-danger').text()).toBe('Invalid email or password.')
  })

  it('shows invalid credentials error on 422', async () => {
    mockLogin.mockRejectedValue({ response: { status: 422 } })
    const wrapper = mount(LoginPage, mountOptions)
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('wrongpassword')
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.find('.alert-danger').text()).toBe('Invalid email or password.')
  })

  it('shows generic error on server failure', async () => {
    mockLogin.mockRejectedValue({ response: { status: 500 } })
    const wrapper = mount(LoginPage, mountOptions)
    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="password"]').setValue('password123')
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.find('.alert-danger').text()).toBe('Something went wrong. Please try again.')
  })

  it('does not show error alert on initial render', () => {
    const wrapper = mount(LoginPage, mountOptions)
    expect(wrapper.find('.alert-danger').exists()).toBe(false)
  })
})