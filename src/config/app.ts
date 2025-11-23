import { STORAGE_CONSTANTS } from '@/constants'
import type { ToolType } from '@/types/jsonTools'

export interface AppConfig {
  defaultTool: ToolType
}

export const defaultConfig: AppConfig = {
  defaultTool: 'json'
}

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
    // 配置读取失败，使用默认配置
  }
  return defaultConfig
}

export function saveConfig(config: Partial<AppConfig>): void {
  try {
    const current = loadConfig()
    const updated = {
      ...current,
      ...config
    }
    localStorage.setItem(STORAGE_CONSTANTS.CONFIG_KEY, JSON.stringify(updated))
  } catch {
    // 配置保存失败，静默处理
  }
}

export function getConfig(): AppConfig {
  return loadConfig()
}

