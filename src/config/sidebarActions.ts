/**
 * 侧边栏操作按钮配置
 */
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
 * 获取侧边栏操作按钮配置
 */
export function getSidebarActions(toolType: ToolType, mode: 'format' | 'diff'): SidebarGroup[] {
  const primaryGroup: SidebarActionConfig[] = []
  const utilityGroup: SidebarActionConfig[] = []

  // 模式切换（仅 JSON 工具支持）
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

  // 缓存管理（图片工具不显示）
  if (toolType !== 'image') {
    primaryGroup.push({
      key: 'cache-manager',
      icon: 'storage',
      title: '缓存管理',
      visible: () => true,
      emit: 'openCacheManager'
    })
  }

  // 关于工具
  utilityGroup.push({
    key: 'about',
    icon: 'info',
    title: '关于工具',
    visible: () => true,
    emit: 'openAbout'
  })

  // 主题切换
  utilityGroup.push({
    key: 'theme-toggle',
    icon: 'sun', // 动态图标，由组件处理
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

