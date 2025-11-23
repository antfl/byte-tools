/**
 * 图片操作相关的组合式函数
 * 提供图片压缩、调整、转换、滤镜等功能
 */
import { useWorkspaceStore } from '@/stores/workspace'
import { useMessage } from './useMessage'
import {
  compressImage,
  resizeImage,
  cropImage,
  rotateImage,
  flipImage,
  convertImageFormat,
  applyFilter,
  adjustImage
} from '@/utils/imageTools'
import { ImageFormat, FilterType, FlipDirection } from '@/types/enums'
import type { PanelKey } from '@/types/jsonTools'
import { getErrorMessage } from '@/utils/errorHandler'

/**
 * 图片操作组合式函数
 * @returns 图片操作相关的方法
 */
export function useImageOperations() {
  const store = useWorkspaceStore()
  const { showMessage, showError, showSuccess } = useMessage()
  
  /**
   * 确保当前图片状态已保存到历史记录
   * 用于在执行操作前保存当前状态，支持撤销/重做
   * @param _panel - 面板标识（未使用，保留用于接口一致性）
   */
  function ensureCurrentStateInHistory(_panel: PanelKey) {
    if (store.toolType !== 'image' || !store.source?.startsWith('data:image/')) {
      return
    }
    
    const currentImage = store.source
    
    if (store.imageHistory.length === 0) {
      store.saveImageToHistory(currentImage)
      return
    }
    
    if (store.imageHistoryIndex >= 0 && store.imageHistoryIndex < store.imageHistory.length) {
      const currentStateInHistory = store.imageHistory[store.imageHistoryIndex] === currentImage
      if (currentStateInHistory) {
        return
      }
    }
    
    store.saveImageToHistory(currentImage)
  }
  
  /**
   * 执行图片操作的通用方法
   * @param panel - 目标面板
   * @param operation - 图片操作函数，返回处理后的图片数据 URL
   * @param successMessage - 成功提示消息
   * @param actionKey - 操作标识，用于设置活动工具
   */
  async function executeImageOperation(
    panel: PanelKey,
    operation: () => Promise<string>,
    successMessage: string,
    actionKey: string
  ) {
    if (store.toolType !== 'image' || !store.source?.startsWith('data:image/')) {
      showError('请先导入图片')
      return
    }
    
    try {
      store.setBusyPanel(panel)
      ensureCurrentStateInHistory(panel)
      const result = await operation()
      store.setSource(result)
      store.saveImageToHistory(result)
      store.clearResultState()
      showSuccess(successMessage)
      store.setActiveTool(`source-${actionKey}` as any)
    } catch (error) {
      showError(getErrorMessage(error, '操作失败'))
    } finally {
      store.setBusyPanel(null)
    }
  }
  
  /**
   * 压缩图片
   * @param panel - 目标面板
   * @param options - 压缩选项
   */
  function compress(panel: PanelKey, options: { maxSizeMB: number; quality: number; maxWidthOrHeight: number }) {
    return executeImageOperation(
      panel,
      () => compressImage(store.source, options),
      '图片压缩成功',
      'compress'
    )
  }
  
  /**
   * 调整图片尺寸
   * @param panel - 目标面板
   * @param options - 尺寸调整选项
   */
  function resize(panel: PanelKey, options: { width?: number; height?: number; maintainAspectRatio: boolean }) {
    if (!options.width && !options.height) {
      showError('请指定宽度或高度')
      return
    }
    
    return executeImageOperation(
      panel,
      () => resizeImage(store.source, options),
      '图片尺寸调整成功',
      'resize'
    )
  }
  
  /**
   * 裁剪图片
   * @param panel - 目标面板
   * @param options - 裁剪区域选项
   */
  function crop(panel: PanelKey, options: { x: number; y: number; width: number; height: number }) {
    if (!options.width || !options.height) {
      showError('请设置裁剪区域')
      return
    }
    
    return executeImageOperation(
      panel,
      () => cropImage(store.source, options),
      '图片裁剪成功',
      'crop'
    )
  }
  
  /**
   * 旋转图片
   * @param panel - 目标面板
   * @param angle - 旋转角度（度）
   */
  function rotate(panel: PanelKey, angle: number) {
    return executeImageOperation(
      panel,
      () => rotateImage(store.source, angle),
      '图片旋转成功',
      'rotate'
    )
  }
  
  /**
   * 翻转图片
   * @param panel - 目标面板
   * @param direction - 翻转方向
   */
  function flip(panel: PanelKey, direction: FlipDirection) {
    return executeImageOperation(
      panel,
      () => flipImage(store.source, direction),
      '图片翻转成功',
      'flip'
    )
  }
  
  /**
   * 转换图片格式
   * @param panel - 目标面板
   * @param format - 目标格式
   */
  async function convert(panel: PanelKey, format: ImageFormat) {
    if (store.toolType !== 'image' || !store.source?.startsWith('data:image/')) {
      showError('请先导入图片')
      return
    }
    
    try {
      store.clearResultState()
      store.setResultLoading(true)
      store.setBusyPanel(panel)
      ensureCurrentStateInHistory(panel)
      
      store.setOriginalImageForConvert(store.source)
      store.setCurrentConvertFormat(format)
      
      if (format === ImageFormat.BASE64) {
        const base64 = await convertImageFormat(store.source, format)
        store.setResultText(base64)
        store.setResultType('base64')
        store.setResultImageData('')
        store.setResultFormat('base64')
        store.setResultLoading(false)
        showSuccess('已转换为 Base64 文本')
        store.setActiveTool(`${panel}-convert`)
        return
      }
      
      const converted = await convertImageFormat(store.source, format)
      const base64Text = converted.replace(/^data:image\/[^;]+;base64,/, '')
      
      store.setSource(converted)
      store.saveImageToHistory(converted)
      
      store.setResultImageData(converted)
      store.setResultText(base64Text)
      store.setResultType('image')
      store.setResultFormat(format.toUpperCase())
      store.setResultLoading(false)
      
      showSuccess(`图片已转换为 ${format.toUpperCase()}`)
      store.setActiveTool(`${panel}-convert`)
    } catch (error) {
      store.setResultLoading(false)
      showError(getErrorMessage(error, '格式转换失败'))
    } finally {
      store.setBusyPanel(null)
    }
  }
  
  /**
   * 应用图片滤镜
   * @param panel - 目标面板
   * @param filter - 滤镜类型
   */
  function applyImageFilter(panel: PanelKey, filter: FilterType) {
    return executeImageOperation(
      panel,
      () => applyFilter(store.source, filter),
      '滤镜应用成功',
      'filter'
    )
  }
  
  /**
   * 调整图片属性（亮度、对比度、饱和度）
   * @param panel - 目标面板
   * @param options - 调整选项
   */
  function adjust(panel: PanelKey, options: { brightness: number; contrast: number; saturation: number }) {
    return executeImageOperation(
      panel,
      () => adjustImage(store.source, options),
      '图片调整成功',
      'adjust'
    )
  }
  
  /**
   * 下载图片
   * @param panel - 目标面板
   */
  function download(panel: PanelKey) {
    if (store.toolType !== 'image' || !store.source?.startsWith('data:image/')) {
      showError('请先导入图片')
      return
    }
    
    try {
      const link = document.createElement('a')
      link.href = store.source
      const match = store.source.match(/data:image\/([^;]+);/)
      const format = match ? match[1] : 'png'
      link.download = `image-${Date.now()}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showSuccess('图片下载成功')
      store.setActiveTool(`${panel}-download`)
    } catch (error) {
      showError(getErrorMessage(error, '下载失败'))
    }
  }
  
  /**
   * 撤销图片操作
   * @param panel - 目标面板
   */
  function undo(panel: PanelKey) {
    if (store.undoImage()) {
      showSuccess('已撤销')
      store.setActiveTool(`${panel}-undo`)
    } else {
      showMessage('info', '没有可撤销的操作')
    }
  }
  
  /**
   * 重做图片操作
   * @param panel - 目标面板
   */
  function redo(panel: PanelKey) {
    if (store.redoImage()) {
      showSuccess('已重做')
      store.setActiveTool(`${panel}-redo`)
    } else {
      showMessage('info', '没有可重做的操作')
    }
  }
  
  return {
    compress,
    resize,
    crop,
    rotate,
    flip,
    convert,
    applyImageFilter,
    adjust,
    download,
    undo,
    redo,
    ensureCurrentStateInHistory
  }
}

