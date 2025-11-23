import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ThemeMode } from '../types/jsonTools'
import { STORAGE_CONSTANTS } from '@/constants'

const theme = ref<ThemeMode>('system')
const systemTheme = ref<'light' | 'dark'>('dark')

let initialized = false
let watching = false
let mediaQuery: MediaQueryList | null = null

/**
 * 获取系统主题偏好
 * @returns 'light' 或 'dark'
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'dark'
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

/**
 * 获取当前生效的主题
 * @returns 'light' 或 'dark'
 */
function getEffectiveTheme(): 'light' | 'dark' {
  if (theme.value === 'system') {
    return systemTheme.value
  }
  return theme.value
}

/**
 * 应用主题到文档根元素
 * @param mode 主题模式
 */
function applyTheme(mode: 'light' | 'dark') {
  document.documentElement.dataset.theme = mode
}

/**
 * 初始化主题系统
 * 从 localStorage 读取保存的主题设置，并监听系统主题变化
 */
function initTheme() {
  if (initialized) {
    return
  }
  initialized = true

  if (typeof window === 'undefined') {
    return
  }

  systemTheme.value = getSystemTheme()

  const storedTheme = window.localStorage.getItem(STORAGE_CONSTANTS.THEME_KEY)
  if (storedTheme === 'dark' || storedTheme === 'light' || storedTheme === 'system') {
    theme.value = storedTheme as ThemeMode
  }

  applyTheme(getEffectiveTheme())

  if (window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  }
}

/**
 * 处理系统主题变化
 * 当系统主题改变时，如果当前使用的是系统主题，则更新应用主题
 */
function handleSystemThemeChange() {
  systemTheme.value = getSystemTheme()
  if (theme.value === 'system') {
    applyTheme(systemTheme.value)
  }
}

/**
 * 设置主题监听器
 * 监听主题变化并自动保存到 localStorage
 */
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

/**
 * 主题管理 Composable
 * 提供主题切换、系统主题监听等功能
 * @returns 主题相关的响应式状态和方法
 */
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

  /**
   * 设置主题模式
   * @param mode 主题模式（'light' | 'dark' | 'system'）
   */
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

