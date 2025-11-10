import { createApp } from 'vue'
import './style.css'
import 'monaco-editor/min/vs/editor/editor.main.css'
import App from './App.vue'
import iconsSprite from './assets/icons.svg?raw'

const SPRITE_CONTAINER_ID = 'byte-json-icon-sprite'

function ensureSpriteMounted() {
  if (typeof document === 'undefined') {
    return
  }
  if (document.getElementById(SPRITE_CONTAINER_ID)) {
    return
  }
  const wrapper = document.createElement('div')
  wrapper.id = SPRITE_CONTAINER_ID
  wrapper.setAttribute('hidden', '')
  wrapper.innerHTML = iconsSprite
  document.body.prepend(wrapper)
}

ensureSpriteMounted()

createApp(App).mount('#app')
