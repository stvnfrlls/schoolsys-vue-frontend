import { mount, flushPromises } from "@vue/test-utils"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import DashboardPage from "../../pages/admin/DashboardPage.vue"

/* ────────────────── MOCK STORES ────────────────── */

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    user: { name: "John Doe" }
  })
}))

/* ────────────────── MOCK SERVICES ────────────────── */

vi.mock("@/services/student", () => ({
  studentService: {
    getAll: vi.fn().mockResolvedValue({
      data: { meta: { total: 100 } }
    })
  }
}))

vi.mock("@/services/user", () => ({
  userService: {
    getAll: vi.fn().mockResolvedValue({
      data: {
        data: [
          { roles: [{ name: "faculty" }] },
          { roles: [{ name: "faculty" }] }
        ]
      }
    })
  }
}))

vi.mock("@/services/grade", () => ({
  sectionService: {
    getAll: vi.fn().mockResolvedValue({
      data: [{}, {}, {}]
    })
  }
}))

vi.mock("@/services/subject", () => ({
  subjectService: {
    getAll: vi.fn().mockResolvedValue({
      data: { meta: { total: 5 } }
    })
  }
}))

vi.mock("@/services/grading", () => ({
  gradingQuarterService: {
    getQuarter: vi.fn().mockResolvedValue({
      data: { current_quarter: 1 }
    }),
    updateQuarter: vi.fn().mockResolvedValue({})
  }
}))

const mountOptions = {
  global: { stubs: { RouterLink: true } }
}

describe("DashboardPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mountComponent = async () => {
    const wrapper = mount(DashboardPage, mountOptions)
    await flushPromises()
    return wrapper
  }

  it("renders all 4 stat cards", async () => {
    const wrapper = await mountComponent()
    // Quarter selector moved to welcome bar — dashboard now has exactly 4 stat cards
    expect(wrapper.findAll(".col-sm-6.col-lg-3").length).toBe(4)
    expect(wrapper.text()).toContain("Total Students")
    expect(wrapper.text()).toContain("Faculty Members")
    expect(wrapper.text()).toContain("Sections")
    expect(wrapper.text()).toContain("Subjects")
  })

  it("renders correct stat card labels", async () => {
    const wrapper = await mountComponent()
    const text = wrapper.text()
    expect(text).toContain("Total Students")
    expect(text).toContain("Faculty Members")
    expect(text).toContain("Sections")
    expect(text).toContain("Subjects")
  })

  it("shows welcome message with the logged-in user name", async () => {
    const wrapper = await mountComponent()
    expect(wrapper.text()).toContain("Welcome back, John Doe")
  })

  it("renders stat values from API", async () => {
    const wrapper = await mountComponent()
    const text = wrapper.text()
    expect(text).toContain("100") // total students
    expect(text).toContain("2")   // faculty count
    expect(text).toContain("3")   // sections
    expect(text).toContain("5")   // subjects
  })
})