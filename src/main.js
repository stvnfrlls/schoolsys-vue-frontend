import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import '@/assets/css/variables.css'
import '@/assets/css/tables.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Check expiration AFTER pinia is initialized
router.beforeEach(() => {
    const auth = useAuthStore()
    if (typeof auth.checkAndClearExpiredAuth === 'function') {
        auth.checkAndClearExpiredAuth()
    }
})

app.mount('#app')