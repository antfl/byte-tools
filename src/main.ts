import { createApp } from 'vue'
import './style.less'
import 'monaco-editor/min/vs/editor/editor.main.css'
import 'virtual:svg-icons-register'
import App from './App.vue'
import router from './router'
import { setupMonacoEnvironment } from './utils/monaco'
import { showBrandInfo } from './utils/console'

setupMonacoEnvironment()
showBrandInfo()

const app = createApp(App)
app.use(router)
app.mount('#app')
