import { useWorkspaceStore } from '@/stores/workspace'
import { useJsonOperations } from './useJsonOperations'
import { useTextOperations } from './useTextOperations'
import { useImageOperations } from './useImageOperations'
import { useFileOperations, useCacheManager } from './useFileOperations'
import { useMessage } from './useMessage'
import type { ToolActionPayload } from '@/types/actions'
import { CaseType, TrimOption, EncodeType, ImageFormat, FilterType, FlipDirection } from '@/types/enums'

/**
 * 统一的操作处理器 Composable
 */
export function useActionHandler() {
  const store = useWorkspaceStore()
  const { showSuccess } = useMessage()
  const jsonOps = useJsonOperations()
  const textOps = useTextOperations()
  const imageOps = useImageOperations()
  const fileOps = useFileOperations()
  const cacheManager = useCacheManager()
  
  // 处理操作
  function handleAction(payload: ToolActionPayload) {
    switch (payload.action) {
      case 'triggerImport':
        if (payload.panel) {
          // 打开导入选项模态框的逻辑在组件中处理
        }
        break
        
      case 'save':
        if (payload.panel) {
          cacheManager.openSaveDialog(payload.panel)
        }
        break
        
      case 'export':
        if (payload.panel) {
          fileOps.handleExport(payload.panel)
        }
        break
        
      case 'format':
        if (payload.panel) {
          jsonOps.formatJson(payload.panel)
        }
        break
        
      case 'minify':
        if (payload.panel) {
          jsonOps.minifyJson(payload.panel)
        }
        break
        
      case 'repair':
        if (payload.panel) {
          jsonOps.repairJson(payload.panel)
        }
        break
        
      case 'clear':
        if (payload.panel) {
          fileOps.handleClear(payload.panel)
        }
        break
        
      case 'toggleAutoFormat':
        store.setAutoFormat(!store.autoFormat)
        showSuccess(store.autoFormat ? '已启用自动格式化' : '已禁用自动格式化')
        break
        
      case 'toggleDeepParse':
        store.setDeepParse(!store.deepParse)
        showSuccess(store.deepParse ? '已启用深度解析' : '已禁用深度解析')
        break
        
      case 'case':
        if (payload.panel && 'params' in payload && payload.params) {
          textOps.convertTextCase(payload.panel, payload.params.caseType as CaseType)
        }
        break
        
      case 'encode':
        if (payload.panel && 'params' in payload && payload.params) {
          textOps.encodeText(payload.panel, payload.params.encodeType as EncodeType)
        }
        break
        
      case 'decode':
        if (payload.panel && 'params' in payload && payload.params) {
          textOps.decodeText(payload.panel, payload.params.decodeType as EncodeType)
        }
        break
        
      case 'trim':
        if (payload.panel && 'params' in payload && payload.params) {
          textOps.trimText(payload.panel, payload.params.trimType as TrimOption)
        }
        break
        
      case 'stats':
        if (payload.panel) {
          textOps.getStats(payload.panel)
        }
        break
        
      case 'compress':
        if (payload.panel && 'params' in payload && payload.params) {
          imageOps.compress(payload.panel, payload.params)
        }
        break
        
      case 'resize':
        if (payload.panel && 'params' in payload && payload.params) {
          imageOps.resize(payload.panel, payload.params)
        }
        break
        
      case 'crop':
        if (payload.panel && 'params' in payload && payload.params) {
          imageOps.crop(payload.panel, payload.params)
        }
        break
        
      case 'rotate':
        if (payload.panel && 'params' in payload && payload.params) {
          imageOps.rotate(payload.panel, payload.params.angle)
        }
        break
        
      case 'flip':
        if (payload.panel && 'params' in payload && payload.params) {
          imageOps.flip(payload.panel, payload.params.direction as FlipDirection)
        }
        break
        
      case 'convert':
        if (payload.panel && 'params' in payload && payload.params) {
          imageOps.convert(payload.panel, payload.params.format as ImageFormat)
        }
        break
        
      case 'filter':
        if (payload.panel && 'params' in payload && payload.params) {
          imageOps.applyImageFilter(payload.panel, payload.params.filter as FilterType)
        }
        break
        
      case 'adjust':
        if (payload.panel && 'params' in payload && payload.params) {
          imageOps.adjust(payload.panel, payload.params)
        }
        break
        
      case 'download':
        if (payload.panel) {
          imageOps.download(payload.panel)
        }
        break
        
      case 'undo':
        if (payload.panel) {
          imageOps.undo(payload.panel)
        }
        break
        
      case 'redo':
        if (payload.panel) {
          imageOps.redo(payload.panel)
        }
        break
    }
  }
  
  return {
    handleAction,
    fileOps,
    cacheManager
  }
}

