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
 * 图片操作 Composable
 */
export function useImageOperations() {
  const store = useWorkspaceStore()
  const { showMessage, showError, showSuccess } = useMessage()
  
  // 确保当前状态在历史记录中
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
  
  // 执行图片操作（通用方法）
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
      showSuccess(successMessage)
      // 使用 source 作为默认 panel，因为图片操作主要在 source 面板
      store.setActiveTool(`source-${actionKey}` as any)
    } catch (error) {
      showError(getErrorMessage(error, '操作失败'))
    } finally {
      store.setBusyPanel(null)
    }
  }
  
  // 压缩图片
  function compress(panel: PanelKey, options: { maxSizeMB: number; quality: number; maxWidthOrHeight: number }) {
    return executeImageOperation(
      panel,
      () => compressImage(store.source, options),
      '图片压缩成功',
      'compress'
    )
  }
  
  // 调整尺寸
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
  
  // 裁剪
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
  
  // 旋转
  function rotate(panel: PanelKey, angle: number) {
    return executeImageOperation(
      panel,
      () => rotateImage(store.source, angle),
      '图片旋转成功',
      'rotate'
    )
  }
  
  // 翻转
  function flip(panel: PanelKey, direction: FlipDirection) {
    return executeImageOperation(
      panel,
      () => flipImage(store.source, direction),
      '图片翻转成功',
      'flip'
    )
  }
  
  // 转换格式
  async function convert(panel: PanelKey, format: ImageFormat) {
    if (store.toolType !== 'image' || !store.source?.startsWith('data:image/')) {
      showError('请先导入图片')
      return
    }
    
    try {
      store.setBusyPanel(panel)
      ensureCurrentStateInHistory(panel)
      
      if (format === ImageFormat.BASE64) {
        const base64 = await convertImageFormat(store.source, format)
        store.setSource(base64)
        showSuccess('已转换为 Base64 文本')
        store.setActiveTool(`${panel}-convert`)
        return
      }
      
      const converted = await convertImageFormat(store.source, format)
      store.setSource(converted)
      store.saveImageToHistory(converted)
      showSuccess(`图片已转换为 ${format.toUpperCase()}`)
      store.setActiveTool(`${panel}-convert`)
    } catch (error) {
      showError(getErrorMessage(error, '格式转换失败'))
    } finally {
      store.setBusyPanel(null)
    }
  }
  
  // 应用滤镜
  function applyImageFilter(panel: PanelKey, filter: FilterType) {
    return executeImageOperation(
      panel,
      () => applyFilter(store.source, filter),
      '滤镜应用成功',
      'filter'
    )
  }
  
  // 调整（亮度、对比度、饱和度）
  function adjust(panel: PanelKey, options: { brightness: number; contrast: number; saturation: number }) {
    return executeImageOperation(
      panel,
      () => adjustImage(store.source, options),
      '图片调整成功',
      'adjust'
    )
  }
  
  // 下载
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
  
  // 撤销
  function undo(panel: PanelKey) {
    if (store.undoImage()) {
      showSuccess('已撤销')
      store.setActiveTool(`${panel}-undo`)
    } else {
      showMessage('info', '没有可撤销的操作')
    }
  }
  
  // 重做
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

