import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource/nebula-sans'
import App from './App.vue'
import './style.css'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
