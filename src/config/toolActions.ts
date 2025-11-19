/**
 * 工具操作按钮配置
 */
import type { ToolType } from '@/types/jsonTools'
import type { IconButtonIcon } from '@/components/base/IconButton.vue'

export type ActionKey = 'import' | 'save' | 'export' | 'format' | 'minify' | 'repair' | 'clear' | 'case' | 'encode' | 'decode' | 'trim' | 'stats'
export type ActionIcon = Extract<IconButtonIcon, 'import' | 'save' | 'export' | 'format' | 'minify' | 'repair' | 'clear' | 'case' | 'encode' | 'decode' | 'trim' | 'stats'>

export interface ActionConfig {
  key: ActionKey
  icon: ActionIcon
  title: string
  showLabel?: boolean
  hasSubmenu?: boolean
  submenuItems?: Array<{
    label: string
    value: string
  }>
}

export interface ActionGroup {
  name: string
  actions: ActionConfig[]
  visible?: (toolType: ToolType, mode: 'format' | 'diff') => boolean
}

// 数据管理操作组
const DATA_ACTIONS: ActionConfig[] = [
  { key: 'save', icon: 'save', title: '存储到缓存' },
  { key: 'import', icon: 'import', title: '导入', showLabel: true },
  { key: 'export', icon: 'export', title: '导出', showLabel: true }
]

// JSON 格式化操作组
const JSON_FORMAT_ACTIONS: ActionConfig[] = [
  { key: 'format', icon: 'format', title: '格式化' },
  { key: 'minify', icon: 'minify', title: '压缩' },
  { key: 'repair', icon: 'repair', title: '尝试修复' }
]

// 文本工具操作组
const TEXT_ACTIONS: ActionConfig[] = [
  {
    key: 'case',
    icon: 'case',
    title: '大小写转换',
    hasSubmenu: true,
    submenuItems: [
      { label: '全大写', value: 'upper' },
      { label: '全小写', value: 'lower' },
      { label: '标题格式', value: 'title' },
      { label: '驼峰命名', value: 'camel' },
      { label: '帕斯卡命名', value: 'pascal' },
      { label: '蛇形命名', value: 'snake' },
      { label: '短横线命名', value: 'kebab' }
    ]
  },
  {
    key: 'encode',
    icon: 'encode',
    title: '编码',
    hasSubmenu: true,
    submenuItems: [
      { label: 'Base64', value: 'base64' },
      { label: 'URL', value: 'url' }
    ]
  },
  {
    key: 'decode',
    icon: 'decode',
    title: '解码',
    hasSubmenu: true,
    submenuItems: [
      { label: 'Base64', value: 'base64' },
      { label: 'URL', value: 'url' }
    ]
  },
  {
    key: 'trim',
    icon: 'trim',
    title: '去除空白',
    hasSubmenu: true,
    submenuItems: [
      { label: '去除所有空白', value: 'all' },
      { label: '去除行首空白', value: 'leading' },
      { label: '去除行尾空白', value: 'trailing' },
      { label: '去除行首尾空白', value: 'lines' },
      { label: '去除空行', value: 'emptyLines' }
    ]
  },
  { key: 'stats', icon: 'stats', title: '统计信息' }
]

// 清空操作
const CLEAR_ACTION: ActionConfig = { key: 'clear', icon: 'clear', title: '清空' }

/**
 * 获取工具的操作按钮配置
 */
export function getToolActionGroups(toolType: ToolType, mode: 'format' | 'diff'): ActionGroup[] {
  const groups: ActionGroup[] = []

  // 数据管理组 - 所有工具都显示（除了图片工具）
  if (toolType !== 'image') {
    groups.push({
      name: 'data',
      actions: DATA_ACTIONS,
      visible: () => true
    })
  }

  // JSON 格式化工具组 - 仅 JSON 工具
  if (toolType === 'json') {
    groups.push({
      name: 'format',
      actions: JSON_FORMAT_ACTIONS,
      visible: () => true
    })
  }

  // 文本工具组 - 仅文本工具
  if (toolType === 'text') {
    groups.push({
      name: 'text',
      actions: TEXT_ACTIONS,
      visible: () => true
    })
  }

  // 清空组 - 所有工具都显示（除了图片工具）
  if (toolType !== 'image') {
    groups.push({
      name: 'clear',
      actions: [CLEAR_ACTION],
      visible: () => true
    })
  }

  return groups.filter(group => !group.visible || group.visible(toolType, mode))
}

