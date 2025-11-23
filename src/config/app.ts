import { STORAGE_CONSTANTS } from '@/constants'
import type { ToolType } from '@/types/jsonTools'

/**
 * 应用配置接口
 */
export interface AppConfig {
  defaultTool: ToolType
}

/**
 * 默认配置
 */
export const defaultConfig: AppConfig = {
  defaultTool: 'json'
}

/**
 * 从 localStorage 加载配置
 * @returns 应用配置对象
 */
export function loadConfig(): AppConfig {
  try {
    const stored = localStorage.getItem(STORAGE_CONSTANTS.CONFIG_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...defaultConfig,
        ...parsed
      }
    }
  } catch {
  }
  return defaultConfig
}

/**
 * 保存配置到 localStorage
 * @param config 要保存的配置（部分更新）
 */
export function saveConfig(config: Partial<AppConfig>): void {
  try {
    const current = loadConfig()
    const updated = {
      ...current,
      ...config
    }
    localStorage.setItem(STORAGE_CONSTANTS.CONFIG_KEY, JSON.stringify(updated))
  } catch {
  }
}

/**
 * 获取当前配置（loadConfig 的别名）
 * @returns 应用配置对象
 */
export function getConfig(): AppConfig {
  return loadConfig()
}

