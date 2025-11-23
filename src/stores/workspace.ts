import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { ToolType, PanelKey, MessageLevel, ToolAction } from '@/types/jsonTools'
import { getConfig, saveConfig } from '@/config/app'
import { STORAGE_CONSTANTS } from '@/constants'

/**
 * Workspace 状态管理 Store
 */
export const useWorkspaceStore = defineStore('workspace', () => {
  // 工具类型
  const toolType = ref<ToolType>(getConfig().defaultTool)
  
  // 工作模式
  const mode = ref<'format' | 'diff'>('format')
  
  // 内容状态
  const source = ref<string>('')
  const target = ref<string>('')
  const previewContent = ref<string>('')
  const previewIsValid = ref<boolean>(true)
  
  // UI 状态
  const activeTool = ref<ToolAction | null>(null)
  const busyPanel = ref<PanelKey | null>(null)
  const message = ref<{ level: MessageLevel; text: string } | null>(null)
  const autoFormat = ref<boolean>(false)
  const deepParse = ref<boolean>(true)
  const cursorPosition = ref<{ line: number; column: number } | null>(null)
  const errorPosition = ref<{ line: number; column: number } | null>(null)
  
  // 图片相关状态
  const imageHistory = ref<string[]>([])
  const imageHistoryIndex = ref<number>(-1)
  const currentImageInfo = ref<{ width: number; height: number } | null>(null)
  
  // 计算属性
  const canUndo = computed(() => {
    return toolType.value === 'image' && imageHistory.value.length > 0 && imageHistoryIndex.value > 0
  })
  
  const canRedo = computed(() => {
    return toolType.value === 'image' && 
           imageHistory.value.length > 0 && 
           imageHistoryIndex.value < imageHistory.value.length - 1
  })
  
  // 初始化内容
  function getStoredSource(tool: ToolType): string {
    try {
      const stored = localStorage.getItem(`${STORAGE_CONSTANTS.SOURCE_KEY_PREFIX}${tool}`)
      if (stored) {
        return stored
      }
    } catch {
      // 忽略错误
    }
    
    switch (tool) {
      case 'json':
        return `{
  "name": "Byte Tools",
  "description": "一个多功能的在线工具"
}`
      case 'text':
        return '在这里输入或粘贴文本内容...'
      case 'image':
        return ''
      default:
        return ''
    }
  }
  
  function getStoredTarget(tool: ToolType): string {
    try {
      const stored = localStorage.getItem(`${STORAGE_CONSTANTS.TARGET_KEY_PREFIX}${tool}`)
      if (stored) {
        return stored
      }
    } catch {
      // 忽略错误
    }
    
    if (tool === 'json') {
      return `{
  "name": "Byte Tools",
  "description": "一个多功能的在线工具",
  "features": ["文本", "图片", "JSON"]
}`
    }
    return ''
  }
  
  // 初始化
  function initialize() {
    source.value = getStoredSource(toolType.value)
    target.value = getStoredTarget(toolType.value)
  }
  
  // 切换工具类型
  function setToolType(newTool: ToolType) {
    const oldTool = toolType.value
    
    // 保存旧工具的内容
    if (oldTool) {
      try {
        localStorage.setItem(`${STORAGE_CONSTANTS.SOURCE_KEY_PREFIX}${oldTool}`, source.value)
        localStorage.setItem(`${STORAGE_CONSTANTS.TARGET_KEY_PREFIX}${oldTool}`, target.value)
      } catch {
        // 忽略错误
      }
    }
    
    toolType.value = newTool
    source.value = getStoredSource(newTool)
    target.value = getStoredTarget(newTool)
    saveConfig({ defaultTool: newTool })
    
    // 如果切换到非 JSON 工具，且当前是 diff 模式，切换回 format 模式
    if (newTool !== 'json' && mode.value === 'diff') {
      mode.value = 'format'
    }
    
    previewContent.value = ''
    previewIsValid.value = true
    errorPosition.value = null
  }
  
  // 设置工作模式
  function setMode(newMode: 'format' | 'diff') {
    mode.value = newMode
  }
  
  // 显示消息
  let messageTimer: number | null = null
  function showMessage(level: MessageLevel, text: string, duration = 2800) {
    message.value = { level, text }
    if (messageTimer) {
      window.clearTimeout(messageTimer)
    }
    messageTimer = window.setTimeout(() => {
      message.value = null
      messageTimer = null
    }, duration)
  }
  
  // 清除消息
  function clearMessage() {
    if (messageTimer) {
      window.clearTimeout(messageTimer)
      messageTimer = null
    }
    message.value = null
  }
  
  // 图片历史记录管理
  function initImageHistory(image: string) {
    if (toolType.value !== 'image') return
    imageHistory.value = [image]
    imageHistoryIndex.value = 0
  }
  
  function saveImageToHistory(image: string) {
    if (toolType.value !== 'image') return
    
    // 如果当前不在历史记录末尾，删除后面的记录
    if (imageHistoryIndex.value < imageHistory.value.length - 1) {
      imageHistory.value = imageHistory.value.slice(0, imageHistoryIndex.value + 1)
    }
    
    imageHistory.value.push(image)
    imageHistoryIndex.value = imageHistory.value.length - 1
    
    // 限制历史记录数量
    const MAX_HISTORY_SIZE = 50
    if (imageHistory.value.length > MAX_HISTORY_SIZE) {
      imageHistory.value.shift()
      imageHistoryIndex.value--
    }
  }
  
  function undoImage() {
    if (!canUndo.value) return false
    imageHistoryIndex.value--
    const previousImage = imageHistory.value[imageHistoryIndex.value]
    if (previousImage) {
      source.value = previousImage
      return true
    }
    return false
  }
  
  function redoImage() {
    if (!canRedo.value) return false
    imageHistoryIndex.value++
    const nextImage = imageHistory.value[imageHistoryIndex.value]
    if (nextImage) {
      source.value = nextImage
      return true
    }
    return false
  }
  
  // 监听 source 变化，自动保存到 localStorage
  watch(
    [source, toolType],
    ([newSource, tool]) => {
      try {
        localStorage.setItem(`${STORAGE_CONSTANTS.SOURCE_KEY_PREFIX}${tool}`, newSource)
      } catch {
        // 忽略错误
      }
    }
  )
  
  // 初始化
  initialize()
  
  return {
    // 状态
    toolType,
    mode,
    source,
    target,
    previewContent,
    previewIsValid,
    activeTool,
    busyPanel,
    message,
    autoFormat,
    deepParse,
    cursorPosition,
    errorPosition,
    imageHistory,
    imageHistoryIndex,
    currentImageInfo,
    
    // 计算属性
    canUndo,
    canRedo,
    
    // 方法
    setToolType,
    setMode,
    showMessage,
    clearMessage,
    initImageHistory,
    saveImageToHistory,
    undoImage,
    redoImage,
    setSource: (value: string) => { source.value = value },
    setTarget: (value: string) => { target.value = value },
    setPreviewContent: (value: string) => { previewContent.value = value },
    setPreviewIsValid: (value: boolean) => { previewIsValid.value = value },
    setActiveTool: (value: ToolAction | null) => { activeTool.value = value },
    setBusyPanel: (value: PanelKey | null) => { busyPanel.value = value },
    setAutoFormat: (value: boolean) => { autoFormat.value = value },
    setDeepParse: (value: boolean) => { deepParse.value = value },
    setCursorPosition: (value: { line: number; column: number } | null) => { cursorPosition.value = value },
    setErrorPosition: (value: { line: number; column: number } | null) => { errorPosition.value = value },
    setCurrentImageInfo: (value: { width: number; height: number } | null) => { currentImageInfo.value = value }
  }
})

