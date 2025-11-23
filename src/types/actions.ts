/**
 * 统一的工具操作类型定义
 */
import type { PanelKey } from './jsonTools'
import type { ActionKey } from '@/config/toolActions'
import type { ImageFormat, FilterType, FlipDirection, CaseType, TrimOption, EncodeType } from './enums'

/**
 * 基础操作载荷
 */
interface BaseActionPayload {
  action: ActionKey
  panel: PanelKey
}

/**
 * 文本操作载荷类型映射
 */
interface TextCaseActionPayload extends BaseActionPayload {
  action: 'case'
  params: {
    caseType: CaseType | string
  }
}

interface TextEncodeActionPayload extends BaseActionPayload {
  action: 'encode'
  params: {
    encodeType: EncodeType | string
  }
}

interface TextDecodeActionPayload extends BaseActionPayload {
  action: 'decode'
  params: {
    decodeType: EncodeType | string
  }
}

interface TextTrimActionPayload extends BaseActionPayload {
  action: 'trim'
  params: {
    trimType: TrimOption | string
  }
}

interface TextStatsActionPayload extends BaseActionPayload {
  action: 'stats'
  params?: undefined
}

/**
 * 图片操作载荷类型映射
 */
interface ImageCompressActionPayload extends BaseActionPayload {
  action: 'compress'
  params: {
    maxSizeMB: number
    quality: number
    maxWidthOrHeight: number
  }
}

interface ImageResizeActionPayload extends BaseActionPayload {
  action: 'resize'
  params: {
    width?: number
    height?: number
    maintainAspectRatio: boolean
  }
}

interface ImageCropActionPayload extends BaseActionPayload {
  action: 'crop'
  params: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface ImageRotateActionPayload extends BaseActionPayload {
  action: 'rotate'
  params: {
    angle: number
  }
}

interface ImageFlipActionPayload extends BaseActionPayload {
  action: 'flip'
  params: {
    direction: FlipDirection
  }
}

interface ImageConvertActionPayload extends BaseActionPayload {
  action: 'convert'
  params: {
    format: ImageFormat | string
  }
}

interface ImageFilterActionPayload extends BaseActionPayload {
  action: 'filter'
  params: {
    filter: FilterType | string
  }
}

interface ImageAdjustActionPayload extends BaseActionPayload {
  action: 'adjust'
  params: {
    brightness: number
    contrast: number
    saturation: number
  }
}

interface ImageDownloadActionPayload extends BaseActionPayload {
  action: 'download'
  params?: undefined
}

interface ImageUndoActionPayload extends BaseActionPayload {
  action: 'undo'
  params?: undefined
}

interface ImageRedoActionPayload extends BaseActionPayload {
  action: 'redo'
  params?: undefined
}

/**
 * 通用操作载荷（无需额外参数）
 */
interface SimpleActionPayload extends BaseActionPayload {
  action: 'save' | 'export' | 'format' | 'minify' | 'repair' | 'clear'
  params?: undefined
}

/**
 * 导入操作载荷（特殊的 action 名称）
 */
interface ImportActionPayload extends BaseActionPayload {
  action: 'triggerImport'
  params?: undefined
}

/**
 * 切换操作载荷（无需 panel 参数）
 */
interface ToggleActionPayload {
  action: 'toggleAutoFormat' | 'toggleDeepParse'
  panel?: undefined
  params?: undefined
}

/**
 * 统一的工具操作载荷类型
 */
export type ToolActionPayload =
  | ImportActionPayload
  | SimpleActionPayload
  | TextCaseActionPayload
  | TextEncodeActionPayload
  | TextDecodeActionPayload
  | TextTrimActionPayload
  | TextStatsActionPayload
  | ImageCompressActionPayload
  | ImageResizeActionPayload
  | ImageCropActionPayload
  | ImageRotateActionPayload
  | ImageFlipActionPayload
  | ImageConvertActionPayload
  | ImageFilterActionPayload
  | ImageAdjustActionPayload
  | ImageDownloadActionPayload
  | ImageUndoActionPayload
  | ImageRedoActionPayload
  | ToggleActionPayload

