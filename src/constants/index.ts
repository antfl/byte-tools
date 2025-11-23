/**
 * 应用常量定义
 */

/**
 * 图片编辑相关常量
 */
export const IMAGE_CONSTANTS = {
  /** 最大历史记录数量 */
  MAX_HISTORY_SIZE: 50,
  /** 默认压缩质量 (0-1) */
  DEFAULT_COMPRESS_QUALITY: 0.8,
  /** 默认最大文件大小 (MB) */
  DEFAULT_MAX_SIZE_MB: 1,
  /** 默认最大宽度或高度 (像素) */
  DEFAULT_MAX_WIDTH_OR_HEIGHT: 1920,
  /** 默认预览最大宽度 (像素) */
  PREVIEW_MAX_WIDTH: 800,
  /** 默认预览最大高度 (像素) */
  PREVIEW_MAX_HEIGHT: 600
} as const

/**
 * 存储相关常量
 */
export const STORAGE_CONSTANTS = {
  /** 配置存储键 */
  CONFIG_KEY: 'byte-tools-config',
  /** 主题存储键 */
  THEME_KEY: 'byte-tools-theme',
  /** 源内容存储键前缀 */
  SOURCE_KEY_PREFIX: 'byte-tools-source-',
  /** 目标内容存储键前缀 */
  TARGET_KEY_PREFIX: 'byte-tools-target-'
} as const

/**
 * IndexedDB 相关常量
 */
export const DB_CONSTANTS = {
  /** 数据库名称 */
  DB_NAME: 'byte-tools-storage',
  /** 对象存储名称 */
  STORE_NAME: 'snippets',
  /** 数据库版本 */
  DB_VERSION: 1
} as const

/**
 * 编辑器相关常量
 */
export const EDITOR_CONSTANTS = {
  /** 消息显示时长 (毫秒) */
  MESSAGE_DURATION: 2800,
  /** JSON 格式化默认缩进 */
  DEFAULT_JSON_INDENT: 2
} as const

/**
 * 文件大小单位
 */
export const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const

