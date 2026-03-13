import { mount, flushPromises } from "@vue/test-utils"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import DashboardPage from "../../pages/admin/DashboardPage.vue"

/* ---------------- MOCK STORES ---------------- */

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    user: { name: "John Doe" }
  })
}))

/* ---------------- MOCK SERVICES ---------------- */

vi.mock("@/services/student", () => ({
  studentService: {
    getAll: vi.fn().mockResolvedValue({
      data: { total: 100 }
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
      data: { total: 5 }
    })
  }
}))

describe("DashboardPage", () => {

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mountComponent = async () => {
    const wrapper = mount(DashboardPage)

    // wait for Promise.allSettled
    await flushPromises()

    return wrapper
  }

  it("renders all 4 stat cards", async () => {
    const wrapper = await mountComponent()
    expect(wrapper.findAll(".col-sm-6").length).toBe(4)
  })

  it("renders correct stat card labels", async () => {
    const wrapper = await mountComponent()

    const text = wrapper.text()

    expect(text).toContain("Total Students")
    expect(text).toContain("Total Teachers")
    expect(text).toContain("Sections")
    expect(text).toContain("Subjects")
  })

  it("shows welcome message with the logged-in user name", async () => {
    const wrapper = await mountComponent()

    expect(wrapper.text()).toContain("Welcome back, John Doe")
  })

  it("renders stat values from API", async () => {
    const wrapper = await mountComponent()

    expect(wrapper.text()).toContain("100")
    expect(wrapper.text()).toContain("2")
    expect(wrapper.text()).toContain("3")
    expect(wrapper.text()).toContain("5")
  })
})
