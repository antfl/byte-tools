import type {
  PanelKey as PanelKeyEnum,
  ThemeMode as ThemeModeEnum,
  ToolType as ToolTypeEnum,
  MessageLevel as MessageLevelEnum
} from './enums'

/**
 * 面板键类型
 */
export type PanelKey = `${PanelKeyEnum}`

/**
 * 主题模式类型
 */
export type ThemeMode = `${ThemeModeEnum}`

/**
 * 工具类型
 */
export type ToolType = `${ToolTypeEnum}`

/**
 * 工具操作类型
 */
export type ToolAction =
  `${PanelKey}-${'import' | 'save' | 'export' | 'format' | 'minify' | 'repair' | 'clear' | 'case' | 'encode' | 'decode' | 'trim' | 'stats' | 'compress' | 'resize' | 'crop' | 'rotate' | 'flip' | 'convert' | 'filter' | 'adjust' | 'download' | 'undo' | 'redo'}`

/**
 * 消息级别类型
 */
export type MessageLevel = `${MessageLevelEnum}`

/**
 * 差异状态接口
 */
export interface DiffState {
  ok: boolean
  hasDiff: boolean
  message: string
}

