/**
 * 应用配置
 */
export type ToolType = 'text' | 'image' | 'json'

export interface AppConfig {
  /** 默认工具类型 */
  defaultTool: ToolType
}

/**
 * 默认配置
 */
export const defaultConfig: AppConfig = {
  defaultTool: 'json'
}

/**
 * 从 localStorage 读取配置
 */
export function loadConfig(): AppConfig {
  try {
    const stored = localStorage.getItem('byte-tools-config')
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...defaultConfig,
        ...parsed
      }
    }
  } catch (error) {
    console.warn('无法读取配置:', error)
  }
  return defaultConfig
}

/**
 * 保存配置到 localStorage
 */
export function saveConfig(config: Partial<AppConfig>): void {
  try {
    const current = loadConfig()
    const updated = {
      ...current,
      ...config
    }
    localStorage.setItem('byte-tools-config', JSON.stringify(updated))
  } catch (error) {
    console.warn('无法保存配置:', error)
  }
}

/**
 * 获取当前配置
 */
export function getConfig(): AppConfig {
  return loadConfig()
}

