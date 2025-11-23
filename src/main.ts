import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.less'
import 'monaco-editor/min/vs/editor/editor.main.css'
import App from './App.vue'
import router from './router'
import { setupMonacoEnvironment } from './utils/monaco'
import { showBrandInfo } from './utils/console'

setupMonacoEnvironment()
showBrandInfo()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
