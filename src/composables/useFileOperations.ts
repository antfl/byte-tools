/**
 * 文件操作相关的组合式函数
 * 提供文件导入、导出、清空等功能
 */
import { ref } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { useMessage } from './useMessage'
import { deleteSnippet, getSnippet, listSnippets, saveSnippet } from '@/services/storageStore'
import type { StoredSnippet } from '@/services/storageStore'
import type { PanelKey } from '@/types/jsonTools'
import { getErrorMessage } from '@/utils/errorHandler'

/**
 * 文件操作组合式函数
 * @returns 文件操作相关的方法和引用
 */
export function useFileOperations() {
  const store = useWorkspaceStore()
  const { showError, showSuccess } = useMessage()
  
  /** 源面板的文件输入框引用 */
  const sourceInput = ref<HTMLInputElement | null>(null)
  /** 目标面板的文件输入框引用 */
  const targetInput = ref<HTMLInputElement | null>(null)
  
  /**
   * 估算内容大小（字节数）
   * @param content - 文本内容
   * @returns 内容大小（字节数）
   */
  function estimateContentSize(content: string): number {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(content).length
    }
    return content.length
  }
  
  /**
   * 处理文件导入
   * @param panel - 目标面板
   * @param event - 文件选择事件
   */
  function handleImport(panel: PanelKey, event: Event) {
    const input = event.target as HTMLInputElement
    const fileList = input.files
    if (!fileList || fileList.length === 0) {
      input.value = ''
      return
    }
    
    const file = fileList.item(0)
    if (!file) {
      showError('未能读取文件，请重试')
      input.value = ''
      return
    }
    
    if (store.toolType === 'image') {
      // 检查是否为图片文件（通过 MIME 类型或文件扩展名）
      const isImageFile = file.type.startsWith('image/') || 
        /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|tif)$/i.test(file.name)
      
      if (isImageFile) {
        const reader = new FileReader()
        reader.onload = () => {
          const imageData = String(reader.result ?? '')
          if (!imageData || !imageData.startsWith('data:image/')) {
            showError('无效的图片文件')
            input.value = ''
            return
          }
          store.setSource(imageData)
          store.initImageHistory(imageData)
          store.clearResultState()
          showSuccess(`${file.name} 已加载到${panel === 'source' ? '源' : '目标'}面板`)
          input.value = ''
          store.setActiveTool(`${panel}-import`)
        }
        reader.onerror = (error) => {
          console.error('图片导入错误:', error)
          showError('导入失败，请检查文件是否损坏或格式不支持')
          input.value = ''
        }
        reader.onabort = () => {
          showError('导入已取消')
          input.value = ''
        }
        reader.readAsDataURL(file)
        return
      } else {
        showError('请选择有效的图片文件（JPG、PNG、GIF、WebP、SVG 等）')
        input.value = ''
        return
      }
    }
    
    const reader = new FileReader()
    reader.onload = () => {
      store.setSource(String(reader.result ?? ''))
      showSuccess(`${file.name} 已加载到${panel === 'source' ? '源' : '目标'}面板`)
      input.value = ''
      store.setActiveTool(`${panel}-import`)
    }
    reader.onerror = () => {
      showError('导入失败，请重试')
      input.value = ''
    }
    reader.readAsText(file, 'utf-8')
  }
  
  /**
   * 处理文件导出
   * @param panel - 源面板
   */
  function handleExport(panel: PanelKey) {
    try {
      let blob: Blob
      let filename: string
      const now = new Date()
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
      
      const content = panel === 'source' ? store.source : store.target
      
      if (store.toolType === 'image' && content.startsWith('data:')) {
        const base64Data = content.split(',')[1]
        if (!base64Data) {
          showError('无效的图片数据')
          return
        }
        const mimeType = content.match(/data:([^;]+)/)?.[1] || 'image/png'
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        blob = new Blob([byteArray], { type: mimeType })
        const ext = mimeType.split('/')[1] || 'png'
        filename = `image-${timestamp}.${ext}`
      } else if (store.toolType === 'json') {
        blob = new Blob([content], { type: 'application/json;charset=utf-8' })
        filename = `json-${timestamp}.json`
      } else {
        blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        filename = `text-${timestamp}.txt`
      }
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
      showSuccess('导出成功')
      store.setActiveTool(`${panel}-export`)
    } catch (error) {
      showError(getErrorMessage(error, '导出失败'))
    }
  }
  
  /**
   * 处理清空操作
   * @param panel - 目标面板
   */
  function handleClear(panel: PanelKey) {
    if (panel === 'source') {
      store.setSource(store.toolType === 'json' ? '{\n\n}' : '')
    } else {
      store.setTarget(store.toolType === 'json' ? '{\n\n}' : '')
    }
    store.setActiveTool(`${panel}-clear`)
  }
  
  return {
    sourceInput,
    targetInput,
    handleImport,
    handleExport,
    handleClear,
    estimateContentSize
  }
}

/**
 * 缓存管理组合式函数
 * 提供缓存保存、读取、删除等功能
 * @returns 缓存管理相关的方法和状态
 */
export function useCacheManager() {
  const store = useWorkspaceStore()
  const { showError, showSuccess } = useMessage()
  
  /** 存储对话框状态 */
  const storageDialog = ref({
    visible: false,
    panel: 'source' as PanelKey,
    loading: false,
    title: '',
    size: 0
  })
  
  /** 缓存选择器状态 */
  const cachePicker = ref({
    visible: false,
    panel: 'source' as PanelKey,
    loading: false,
    items: [] as StoredSnippet[],
    selectedId: null as string | null
  })
  
  /**
   * 创建建议的标题
   * @param panel - 面板标识
   * @returns 建议的标题字符串
   */
  function createSuggestedTitle(panel: PanelKey): string {
    const prefix = panel === 'source' ? '源面板' : '目标面板'
    const now = new Date()
    const compact = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(
      now.getMinutes()
    ).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
    return `${prefix}-${compact}`
  }
  
  function estimateContentSize(content: string): number {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(content).length
    }
    return content.length
  }
  
  /**
   * 刷新缓存列表
   * @param showErrorMessage - 是否显示错误消息
   * @returns 是否成功
   */
  async function refreshCacheItems(showErrorMessage = true) {
    cachePicker.value.loading = true
    let success = true
    try {
      cachePicker.value.items = await listSnippets()
      if (!cachePicker.value.items.some((item) => item.id === cachePicker.value.selectedId)) {
        cachePicker.value.selectedId = null
      }
    } catch (error) {
      success = false
      if (showErrorMessage) {
        showError(getErrorMessage(error, '读取缓存失败'))
      }
    } finally {
      cachePicker.value.loading = false
    }
    return success
  }
  
  /**
   * 打开保存对话框
   * @param panel - 目标面板
   */
  function openSaveDialog(panel: PanelKey) {
    storageDialog.value.panel = panel
    storageDialog.value.title = createSuggestedTitle(panel)
    const content = panel === 'source' ? store.source : store.target
    storageDialog.value.size = estimateContentSize(content)
    storageDialog.value.visible = true
  }
  
  /**
   * 确认保存内容到缓存
   * @param title - 保存的标题
   */
  async function confirmSave(title: string) {
    if (!storageDialog.value.visible || storageDialog.value.loading) {
      return
    }
    
    const panel = storageDialog.value.panel
    const content = panel === 'source' ? store.source : store.target
    
    if (!content || !content.trim()) {
      showError('空文本不允许保存')
      return
    }
    
    storageDialog.value.loading = true
    try {
      await saveSnippet(panel, title, content)
      showSuccess('内容已保存到缓存')
      store.setActiveTool(`${panel}-save`)
      storageDialog.value.visible = false
      if (cachePicker.value.visible) {
        await refreshCacheItems(false)
      }
    } catch (error) {
      showError(getErrorMessage(error, '保存失败，请重试'))
    } finally {
      storageDialog.value.loading = false
    }
  }
  
  /**
   * 取消保存操作
   */
  function cancelSave() {
    if (storageDialog.value.loading) {
      return
    }
    storageDialog.value.visible = false
  }
  
  /**
   * 打开缓存选择器
   * @param panel - 目标面板
   */
  async function openCachePicker(panel: PanelKey) {
    cachePicker.value.panel = panel
    cachePicker.value.visible = true
    cachePicker.value.selectedId = null
    const success = await refreshCacheItems()
    if (!success) {
      cachePicker.value.visible = false
    }
  }
  
  /**
   * 关闭缓存选择器
   */
  function closeCachePicker() {
    if (cachePicker.value.loading) {
      return
    }
    cachePicker.value.visible = false
    cachePicker.value.selectedId = null
  }
  
  /**
   * 选择并加载缓存片段
   * @param id - 缓存片段 ID
   */
  async function selectCacheSnippet(id: string) {
    try {
      const snippet = await getSnippet(id)
      if (!snippet) {
        showError('未找到对应的缓存记录')
        await refreshCacheItems()
        return
      }
      if (cachePicker.value.panel === 'source') {
        store.setSource(snippet.content)
      } else {
        store.setTarget(snippet.content)
      }
      store.setActiveTool(`${cachePicker.value.panel}-import`)
      showSuccess(`已从缓存加载：${snippet.title}`)
      cachePicker.value.visible = false
      cachePicker.value.selectedId = null
    } catch (error) {
      showError(getErrorMessage(error, '读取缓存失败'))
    }
  }
  
  /**
   * 删除缓存片段
   * @param id - 缓存片段 ID
   */
  async function deleteCacheSnippet(id: string) {
    try {
      await deleteSnippet(id)
      cachePicker.value.items = cachePicker.value.items.filter((item) => item.id !== id)
      if (cachePicker.value.selectedId === id) {
        cachePicker.value.selectedId = null
      }
      showSuccess('缓存已删除')
      if (!cachePicker.value.items.length) {
        await refreshCacheItems(false)
      }
    } catch (error) {
      showError(getErrorMessage(error, '删除缓存失败'))
    }
  }
  
  /**
   * 预览缓存片段
   * @param id - 缓存片段 ID，null 表示取消预览
   */
  function previewCacheSnippet(id: string | null) {
    cachePicker.value.selectedId = id
  }
  
  /**
   * 复制文本到剪贴板
   * @param text - 要复制的文本
   */
  async function copyToClipboard(text: string) {
    if ('clipboard' in navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text)
      return
    }
    
    await new Promise<void>((resolve, reject) => {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', 'true')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        textarea.setSelectionRange(0, textarea.value.length)
        const successful = document.execCommand('copy')
        document.body.removeChild(textarea)
        if (!successful) {
          reject(new Error('浏览器不允许访问剪贴板'))
          return
        }
        resolve()
      } catch (error) {
        reject(error instanceof Error ? error : new Error('复制失败'))
      }
    })
  }
  
  /**
   * 复制缓存片段内容到剪贴板
   * @param id - 缓存片段 ID
   */
  async function copyCacheSnippet(id: string) {
    const snippet = cachePicker.value.items.find((item) => item.id === id)
    if (!snippet) {
      showError('未找到对应的缓存记录')
      await refreshCacheItems()
      return
    }
    
    try {
      await copyToClipboard(snippet.content)
      showSuccess('内容已复制到剪贴板')
    } catch (error) {
      showError(getErrorMessage(error, '复制失败，请检查浏览器权限'))
    }
  }
  
  return {
    storageDialog,
    cachePicker,
    openSaveDialog,
    confirmSave,
    cancelSave,
    openCachePicker,
    closeCachePicker,
    selectCacheSnippet,
    deleteCacheSnippet,
    previewCacheSnippet,
    copyCacheSnippet,
    refreshCacheItems
  }
}

