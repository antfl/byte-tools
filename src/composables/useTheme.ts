import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ThemeMode } from '../types/jsonTools'
import { STORAGE_CONSTANTS } from '@/constants'

const theme = ref<ThemeMode>('system')
const systemTheme = ref<'light' | 'dark'>('dark')

let initialized = false
let watching = false
let mediaQuery: MediaQueryList | null = null

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'dark'
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

function getEffectiveTheme(): 'light' | 'dark' {
  if (theme.value === 'system') {
    return systemTheme.value
  }
  return theme.value
}

function applyTheme(mode: 'light' | 'dark') {
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

  // 初始化系统主题
  systemTheme.value = getSystemTheme()

  // 从存储中读取主题设置
  const storedTheme = window.localStorage.getItem(STORAGE_CONSTANTS.THEME_KEY)
  if (storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system') {
    theme.value = storedTheme as ThemeMode
  }

  // 应用主题
  applyTheme(getEffectiveTheme())

  // 监听系统主题变化
  if (window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  }
}

function handleSystemThemeChange() {
  systemTheme.value = getSystemTheme()
  if (theme.value === 'system') {
    applyTheme(systemTheme.value)
  }
}

function setupWatcher() {
  if (watching) {
    return
  }
  watching = true
  watch(
    [theme, systemTheme],
    () => {
      applyTheme(getEffectiveTheme())
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_CONSTANTS.THEME_KEY, theme.value)
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

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  })

  if (typeof window !== 'undefined') {
    initTheme()
    setupWatcher()
  }

  const effectiveTheme = computed(() => getEffectiveTheme())
  const isDarkTheme = computed(() => effectiveTheme.value === 'dark')
  const themeToggleTitle = computed(() => {
    if (theme.value === 'system') {
      return '主题设置'
    }
    return theme.value === 'dark' ? '切换到浅色主题' : '切换到暗色主题'
  })

  function setTheme(mode: ThemeMode) {
    theme.value = mode
  }

  return {
    theme,
    effectiveTheme,
    isDarkTheme,
    setTheme,
    themeToggleTitle
  }
}

export { applyTheme }

