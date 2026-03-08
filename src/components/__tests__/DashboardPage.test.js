import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import DashboardPage from '../../pages/admin/DashboardPage.vue'

// Mock auth store with a fake logged-in user
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    user: { name: 'John Doe' },
  }),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders all 4 stat cards', () => {
    const wrapper = mount(DashboardPage)
    expect(wrapper.findAll('.col-sm-6').length).toBe(4)
  })

  it('renders correct stat card labels', () => {
    const wrapper = mount(DashboardPage)
    const text = wrapper.text()
    expect(text).toContain('Total Students')
    expect(text).toContain('Total Teachers')
    expect(text).toContain('Sections')
    expect(text).toContain('Subjects')
  })

  it('shows welcome message with the logged-in user name', () => {
    const wrapper = mount(DashboardPage)
    expect(wrapper.text()).toContain('Welcome back, John Doe')
  })

  it('renders placeholder values for stat cards', () => {
    const wrapper = mount(DashboardPage)
    const text = wrapper.text()
    // All values are "—" until real data is loaded
    expect(text.match(/—/g)?.length).toBe(4)
  })
})
