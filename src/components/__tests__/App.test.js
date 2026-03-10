import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import App from '../../App.vue'

describe('App', () => {
    it('mounts without crashing', () => {
        const wrapper = mount(App, {
            global: {
                stubs: { RouterView: true },
            },
        })
        expect(wrapper.exists()).toBe(true)
    })
})