/**
 * 工作区状态管理 Store
 * 管理工具类型、编辑器内容、图片历史、转换结果等状态
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { ToolType, PanelKey, MessageLevel, ToolAction } from '@/types/jsonTools'
import { getConfig, saveConfig } from '@/config/app'
import { STORAGE_CONSTANTS } from '@/constants'

export const useWorkspaceStore = defineStore('workspace', () => {
  /** 当前工具类型 */
  const toolType = ref<ToolType>(getConfig().defaultTool)
  /** 工作模式：format 或 diff */
  const mode = ref<'format' | 'diff'>('format')
  /** 源面板内容 */
  const source = ref<string>('')
  /** 目标面板内容 */
  const target = ref<string>('')
  /** 预览内容 */
  const previewContent = ref<string>('')
  /** 预览内容是否有效 */
  const previewIsValid = ref<boolean>(true)
  /** 当前活动的工具 */
  const activeTool = ref<ToolAction | null>(null)
  /** 正在处理的面板 */
  const busyPanel = ref<PanelKey | null>(null)
  /** 状态消息 */
  const message = ref<{ level: MessageLevel; text: string } | null>(null)
  /** 是否自动格式化（JSON 工具） */
  const autoFormat = ref<boolean>(false)
  /** 是否深度解析（JSON 工具） */
  const deepParse = ref<boolean>(true)
  /** 光标位置 */
  const cursorPosition = ref<{ line: number; column: number } | null>(null)
  /** 错误位置 */
  const errorPosition = ref<{ line: number; column: number } | null>(null)
  /** 图片历史记录（用于撤销/重做） */
  const imageHistory = ref<string[]>([])
  /** 图片历史记录当前索引 */
  const imageHistoryIndex = ref<number>(-1)
  /** 当前图片信息 */
  const currentImageInfo = ref<{ width: number; height: number; size: number; format: string } | null>(null)
  /** 转换结果文本 */
  const resultText = ref<string>('')
  /** 转换结果类型 */
  const resultType = ref<'base64' | 'image' | null>(null)
  /** 转换结果图片数据 */
  const resultImageData = ref<string>('')
  /** 转换结果格式 */
  const resultFormat = ref<string>('')
  /** 转换结果加载状态 */
  const resultLoading = ref<boolean>(false)
  /** 用于转换的原始图片 */
  const originalImageForConvert = ref<string>('')
  /** 当前转换格式 */
  const currentConvertFormat = ref<string>('')
  
  /** 是否可以撤销 */
  const canUndo = computed(() => {
    return toolType.value === 'image' && imageHistory.value.length > 0 && imageHistoryIndex.value > 0
  })
  
  /** 是否可以重做 */
  const canRedo = computed(() => {
    return toolType.value === 'image' && 
           imageHistory.value.length > 0 && 
           imageHistoryIndex.value < imageHistory.value.length - 1
  })
  
  /**
   * 获取存储的源面板内容，如果不存在则返回默认内容
   * @param tool - 工具类型
   * @returns 源面板内容
   */
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
  "description": "为开发者打造的多功能在线工具集",
  "version": "1.0.0",
  "features": {
    "json": {
      "format": "格式化 JSON 数据，支持自定义缩进",
      "minify": "压缩为单行，节省空间",
      "repair": "智能修复常见的 JSON 错误",
      "diff": "并排对比两个 JSON 文件"
    },
    "text": {
      "case": "大小写转换（全大写、全小写、驼峰等）",
      "encode": "Base64 和 URL 编码解码",
      "trim": "去除空白字符",
      "stats": "文本统计信息"
    },
    "image": {
      "compress": "图片压缩，可设置质量",
      "resize": "调整尺寸，支持保持宽高比",
      "crop": "自定义区域裁剪",
      "convert": "格式转换（PNG、JPG、WebP 等）"
    }
  },
  "editor": {
    "name": "Monaco Editor",
    "features": ["语法高亮", "代码折叠", "实时预览", "错误提示"]
  },
  "storage": {
    "type": "IndexedDB",
    "description": "本地缓存常用片段，支持导入导出"
  },
  "theme": {
    "modes": ["light", "dark"],
    "auto": true
  },
  "url": "https://tools.byteout.cn",
  "contact": "https://byteout.cn/contact",
  "license": "MIT"
}`
      case 'text':
        return '在这里输入或粘贴文本内容...'
      case 'image':
        return ''
      default:
        return ''
    }
  }
  
  /**
   * 获取存储的目标面板内容，如果不存在则返回默认内容
   * @param tool - 工具类型
   * @returns 目标面板内容
   */
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
  "description": "为开发者打造的多功能在线工具集",
  "version": "1.0.0",
  "tools": ["JSON", "文本", "图片"],
  "editor": "Monaco Editor",
  "storage": "IndexedDB",
  "features": [
    "格式化与压缩",
    "差异对比",
    "修复与解析",
    "大小写转换",
    "编码解码",
    "图片编辑",
    "格式转换"
  ],
  "config": {
    "autoFormat": false,
    "deepParse": true,
    "defaultIndent": 2
  },
  "url": "https://tools.byteout.cn",
  "contact": "https://byteout.cn/contact"
}`
    }
    return ''
  }
  
  /**
   * 初始化工作区，从本地存储加载内容
   */
  function initialize() {
    source.value = getStoredSource(toolType.value)
    target.value = getStoredTarget(toolType.value)
  }
  
  /**
   * 设置工具类型，并保存当前内容到本地存储
   * @param newTool - 新的工具类型
   */
  function setToolType(newTool: ToolType) {
    const oldTool = toolType.value
    
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
    
    if (newTool !== 'json' && mode.value === 'diff') {
      mode.value = 'format'
    }
    
    previewContent.value = ''
    previewIsValid.value = true
    errorPosition.value = null
    cursorPosition.value = null
  }
  
  /**
   * 设置工作模式
   * @param newMode - 新的工作模式
   */
  function setMode(newMode: 'format' | 'diff') {
    mode.value = newMode
  }
  
  /** 消息定时器 */
  let messageTimer: number | null = null
  
  /**
   * 显示状态消息
   * @param level - 消息级别
   * @param text - 消息文本
   * @param duration - 显示时长（毫秒）
   */
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
  
  /**
   * 清除状态消息
   */
  function clearMessage() {
    if (messageTimer) {
      window.clearTimeout(messageTimer)
      messageTimer = null
    }
    message.value = null
  }
  
  /**
   * 初始化图片历史记录
   * @param image - 初始图片数据
   */
  function initImageHistory(image: string) {
    if (toolType.value !== 'image') return
    imageHistory.value = [image]
    imageHistoryIndex.value = 0
  }
  
  /**
   * 保存图片到历史记录
   * @param image - 图片数据
   */
  function saveImageToHistory(image: string) {
    if (toolType.value !== 'image') return
    
    // 如果当前不在历史记录末尾，删除后面的记录
    if (imageHistoryIndex.value < imageHistory.value.length - 1) {
      imageHistory.value = imageHistory.value.slice(0, imageHistoryIndex.value + 1)
    }
    
    imageHistory.value.push(image)
    imageHistoryIndex.value = imageHistory.value.length - 1
    
    /** 最大历史记录数量 */
    const MAX_HISTORY_SIZE = 50
    if (imageHistory.value.length > MAX_HISTORY_SIZE) {
      imageHistory.value.shift()
      imageHistoryIndex.value--
    }
  }
  
  /**
   * 撤销图片操作
   * @returns 是否成功撤销
   */
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
  
  /**
   * 重做图片操作
   * @returns 是否成功重做
   */
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
  
  initialize()
  
  return {
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
    resultText,
    resultType,
    resultImageData,
    resultFormat,
    resultLoading,
    originalImageForConvert,
    currentConvertFormat,
    canUndo,
    canRedo,
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
    setCurrentImageInfo: (value: { width: number; height: number; size: number; format: string } | null) => { currentImageInfo.value = value },
    setResultText: (value: string) => { resultText.value = value },
    setResultType: (value: 'base64' | 'image' | null) => { resultType.value = value },
    setResultImageData: (value: string) => { resultImageData.value = value },
    setResultFormat: (value: string) => { resultFormat.value = value },
    setResultLoading: (value: boolean) => { resultLoading.value = value },
    setOriginalImageForConvert: (value: string) => { originalImageForConvert.value = value },
    setCurrentConvertFormat: (value: string) => { currentConvertFormat.value = value },
    /**
     * 清除转换结果状态
     */
    clearResultState: () => {
      resultText.value = ''
      resultType.value = null
      resultImageData.value = ''
      resultFormat.value = ''
      resultLoading.value = false
      originalImageForConvert.value = ''
      currentConvertFormat.value = ''
    }
  }
})

