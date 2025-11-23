/**
 * 图片格式枚举
 */
export const ImageFormat = {
  PNG: 'png',
  JPG: 'jpg',
  WEBP: 'webp',
  ICO: 'ico',
  SVG: 'svg',
  BASE64: 'base64'
} as const

export type ImageFormat = typeof ImageFormat[keyof typeof ImageFormat]

/**
 * 图片滤镜类型枚举
 */
export const FilterType = {
  GRAYSCALE: 'grayscale',
  SEPIA: 'sepia',
  INVERT: 'invert',
  BLUR: 'blur',
  BRIGHTNESS: 'brightness',
  CONTRAST: 'contrast',
  SATURATE: 'saturate'
} as const

export type FilterType = typeof FilterType[keyof typeof FilterType]

/**
 * 图片翻转方向枚举
 */
export const FlipDirection = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
} as const

export type FlipDirection = typeof FlipDirection[keyof typeof FlipDirection]

/**
 * 文本大小写转换类型枚举
 */
export const CaseType = {
  UPPER: 'upper',
  LOWER: 'lower',
  TITLE: 'title',
  CAMEL: 'camel',
  PASCAL: 'pascal',
  SNAKE: 'snake',
  KEBAB: 'kebab'
} as const

export type CaseType = typeof CaseType[keyof typeof CaseType]

/**
 * 文本去除空白选项枚举
 */
export const TrimOption = {
  ALL: 'all',
  LEADING: 'leading',
  TRAILING: 'trailing',
  LINES: 'lines',
  EMPTY_LINES: 'emptyLines'
} as const

export type TrimOption = typeof TrimOption[keyof typeof TrimOption]

/**
 * 编码类型枚举
 */
export const EncodeType = {
  BASE64: 'base64',
  URL: 'url'
} as const

export type EncodeType = typeof EncodeType[keyof typeof EncodeType]

/**
 * 工具类型枚举
 */
export const ToolType = {
  TEXT: 'text',
  IMAGE: 'image',
  JSON: 'json'
} as const

export type ToolType = typeof ToolType[keyof typeof ToolType]

/**
 * 面板键枚举
 */
export const PanelKey = {
  SOURCE: 'source',
  TARGET: 'target'
} as const

export type PanelKey = typeof PanelKey[keyof typeof PanelKey]

/**
 * 主题模式枚举
 */
export const ThemeMode = {
  DARK: 'dark',
  LIGHT: 'light'
} as const

export type ThemeMode = typeof ThemeMode[keyof typeof ThemeMode]

/**
 * 消息级别枚举
 */
export const MessageLevel = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info'
} as const

export type MessageLevel = typeof MessageLevel[keyof typeof MessageLevel]

/**
 * 工作模式枚举
 */
export const WorkMode = {
  FORMAT: 'format',
  DIFF: 'diff'
} as const

export type WorkMode = typeof WorkMode[keyof typeof WorkMode]

