import type { ToolType } from '@/types/jsonTools'

export type ActionKey =
  | 'triggerImport'
  | 'import'
  | 'save'
  | 'export'
  | 'format'
  | 'minify'
  | 'repair'
  | 'clear'
  | 'case'
  | 'encode'
  | 'decode'
  | 'trim'
  | 'stats'
  | 'compress'
  | 'resize'
  | 'crop'
  | 'rotate'
  | 'flip'
  | 'convert'
  | 'filter'
  | 'adjust'
  | 'download'
  | 'undo'
  | 'redo'
  | 'toggleAutoFormat'
  | 'toggleDeepParse'

export type ActionIcon =
  | 'import'
  | 'save'
  | 'export'
  | 'format'
  | 'minify'
  | 'repair'
  | 'clear'
  | 'case'
  | 'encode'
  | 'decode'
  | 'trim'
  | 'stats'
  | 'compress'
  | 'resize'
  | 'crop'
  | 'rotate'
  | 'flip'
  | 'convert'
  | 'filter'
  | 'info'
  | 'download'
  | 'undo'
  | 'redo'

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

const DATA_ACTIONS: ActionConfig[] = [
  { key: 'save', icon: 'save', title: '存储到缓存' },
  { key: 'import', icon: 'import', title: '导入', showLabel: true },
  { key: 'export', icon: 'export', title: '导出', showLabel: true }
]

const JSON_FORMAT_ACTIONS: ActionConfig[] = [
  { key: 'format', icon: 'format', title: '格式化' },
  { key: 'minify', icon: 'minify', title: '压缩' },
  { key: 'repair', icon: 'repair', title: '尝试修复' }
]

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

const CLEAR_ACTION: ActionConfig = { key: 'clear', icon: 'clear', title: '清空' }

// 图片操作分组
const IMAGE_HISTORY_ACTIONS: ActionConfig[] = [
  { key: 'undo', icon: 'undo', title: '撤销' },
  { key: 'redo', icon: 'redo', title: '重做' }
]

const IMAGE_EDIT_ACTIONS: ActionConfig[] = [
  { key: 'resize', icon: 'resize', title: '调整尺寸' },
  { key: 'crop', icon: 'crop', title: '裁剪' },
  { key: 'rotate', icon: 'rotate', title: '旋转' },
  { key: 'flip', icon: 'flip', title: '翻转' }
]

const IMAGE_PROCESS_ACTIONS: ActionConfig[] = [
  { key: 'compress', icon: 'compress', title: '压缩' },
  {
    key: 'convert',
    icon: 'convert',
    title: '转换格式',
    hasSubmenu: true,
    submenuItems: [
      { label: 'PNG', value: 'png' },
      { label: 'JPG', value: 'jpg' },
      { label: 'WebP', value: 'webp' },
      { label: 'ICO', value: 'ico' },
      { label: 'SVG', value: 'svg' },
      { label: 'Base64', value: 'base64' }
    ]
  },
  {
    key: 'filter',
    icon: 'filter',
    title: '滤镜',
    hasSubmenu: true,
    submenuItems: [
      { label: '灰度', value: 'grayscale' },
      { label: '怀旧', value: 'sepia' },
      { label: '反色', value: 'invert' },
      { label: '模糊', value: 'blur' }
    ]
  },
  { key: 'adjust', icon: 'info', title: '调整' }
]

const IMAGE_OUTPUT_ACTIONS: ActionConfig[] = [
  { key: 'download', icon: 'download', title: '下载' }
]

/**
 * 根据工具类型和工作模式获取操作组配置
 * @param toolType 工具类型（'json' | 'text' | 'image'）
 * @param mode 工作模式（'format' | 'diff'）
 * @returns 操作组数组
 */
export function getToolActionGroups(toolType: ToolType, mode: 'format' | 'diff'): ActionGroup[] {
  const groups: ActionGroup[] = []

  if (toolType !== 'image') {
    groups.push({
      name: 'data',
      actions: DATA_ACTIONS,
      visible: () => true
    })
  } else {
    groups.push({
      name: 'data',
      actions: [
        { key: 'import', icon: 'import', title: '导入', showLabel: true },
        { key: 'export', icon: 'export', title: '导出', showLabel: true }
      ],
      visible: () => true
    })
  }

  if (toolType === 'json') {
    groups.push({
      name: 'format',
      actions: JSON_FORMAT_ACTIONS,
      visible: () => true
    })
  }

  if (toolType === 'text') {
    groups.push({
      name: 'text',
      actions: TEXT_ACTIONS,
      visible: () => true
    })
  }

  if (toolType === 'image') {
    groups.push({
      name: 'image-history',
      actions: IMAGE_HISTORY_ACTIONS,
      visible: () => true
    })
    groups.push({
      name: 'image-edit',
      actions: IMAGE_EDIT_ACTIONS,
      visible: () => true
    })
    groups.push({
      name: 'image-process',
      actions: IMAGE_PROCESS_ACTIONS,
      visible: () => true
    })
    groups.push({
      name: 'image-output',
      actions: IMAGE_OUTPUT_ACTIONS,
      visible: () => true
    })
  }

  if (toolType !== 'image') {
    groups.push({
      name: 'clear',
      actions: [CLEAR_ACTION],
      visible: () => true
    })
  }

  return groups.filter(group => !group.visible || group.visible(toolType, mode))
}

