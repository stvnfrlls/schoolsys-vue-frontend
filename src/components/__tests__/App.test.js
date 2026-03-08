import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import App from '../App.vue'  // adjust path to an actual component

describe('App', () => {
    it('mounts without crashing', () => {
        const wrapper = mount(App)
        expect(wrapper.exists()).toBe(true)
    })
})