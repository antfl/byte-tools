import { computed, onMounted, ref, watch } from 'vue'
import type { ThemeMode } from '../types/jsonTools'

const theme = ref<ThemeMode>('dark')
const THEME_STORAGE_KEY = 'byte-tools-theme'

let initialized = false
let watching = false

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode
}

function initTheme() {
  if (initialized) {
    return
  }
  initialized = true

  if (typeof window === 'undefined') {
    return
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'dark' || storedTheme === 'light') {
    theme.value = storedTheme
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    theme.value = 'light'
  }

  applyTheme(theme.value)
}

function setupWatcher() {
  if (watching) {
    return
  }
  watching = true
  watch(
    theme,
    (mode) => {
      applyTheme(mode)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode)
      }
    },
    { immediate: true }
  )
}

export function useTheme() {
  onMounted(() => {
    initTheme()
    setupWatcher()
  })

  if (typeof window !== 'undefined') {
    initTheme()
    setupWatcher()
  }

  const isDarkTheme = computed(() => theme.value === 'dark')
  const themeToggleTitle = computed(() =>
    theme.value === 'dark' ? '切换到浅色主题' : '切换到暗色主题'
  )

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    theme,
    isDarkTheme,
    toggleTheme,
    themeToggleTitle
  }
}

export { applyTheme }

