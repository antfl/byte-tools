import type { ToolType } from '@/types/jsonTools'
import type { IconButtonIcon } from '@/components/base/IconButton.vue'

export interface SidebarActionConfig {
  key: string
  icon: IconButtonIcon
  title: string
  visible?: (toolType: ToolType, mode: 'format' | 'diff') => boolean
  active?: (mode: 'format' | 'diff', isDarkTheme: boolean) => boolean
  emit?: string
}

export interface SidebarGroup {
  name: string
  actions: SidebarActionConfig[]
}

/**
 * 根据工具类型和工作模式获取侧边栏操作配置
 * @param toolType 工具类型（'json' | 'text' | 'image'）
 * @param mode 工作模式（'format' | 'diff'）
 * @returns 侧边栏操作组数组
 */
export function getSidebarActions(toolType: ToolType, mode: 'format' | 'diff'): SidebarGroup[] {
  const primaryGroup: SidebarActionConfig[] = []
  const utilityGroup: SidebarActionConfig[] = []

  if (toolType === 'json') {
    primaryGroup.push({
      key: 'format-mode',
      icon: 'format',
      title: '预览模式',
      visible: () => true,
      active: (currentMode) => currentMode === 'format',
      emit: 'update:mode:format'
    })
    primaryGroup.push({
      key: 'diff-mode',
      icon: 'diff',
      title: '对比模式',
      visible: () => true,
      active: (currentMode) => currentMode === 'diff',
      emit: 'update:mode:diff'
    })
  }

  if (toolType !== 'image') {
    primaryGroup.push({
      key: 'cache-manager',
      icon: 'storage',
      title: '缓存管理',
      visible: () => true,
      emit: 'openCacheManager'
    })
  }

  utilityGroup.push({
    key: 'about',
    icon: 'about',
    title: '关于工具',
    visible: () => true,
    emit: 'openAbout'
  })

  utilityGroup.push({
    key: 'theme-toggle',
    icon: 'sun',
    title: '切换主题',
    visible: () => true,
    emit: 'toggleTheme'
  })

  const groups: SidebarGroup[] = []

  if (primaryGroup.length > 0) {
    groups.push({
      name: 'primary',
      actions: primaryGroup.filter(action => !action.visible || action.visible(toolType, mode))
    })
  }

  if (utilityGroup.length > 0) {
    groups.push({
      name: 'utility',
      actions: utilityGroup.filter(action => !action.visible || action.visible(toolType, mode))
    })
  }

  return groups
}
