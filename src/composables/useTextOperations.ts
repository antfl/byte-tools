import { useWorkspaceStore } from '@/stores/workspace'
import { useMessage } from './useMessage'
import {
  convertCase,
  encodeBase64,
  decodeBase64,
  encodeURL,
  decodeURL,
  trimWhitespace,
  getTextStats
} from '@/utils/textTools'
import { CaseType, TrimOption, EncodeType } from '@/types/enums'
import type { PanelKey } from '@/types/jsonTools'
import { getErrorMessage } from '@/utils/errorHandler'

/**
 * 文本操作 Composable
 */
export function useTextOperations() {
  const store = useWorkspaceStore()
  const { showMessage, showError, showSuccess } = useMessage()
  
  // 大小写转换
  function convertTextCase(panel: PanelKey, caseType: CaseType) {
    if (store.toolType !== 'text') {
      showMessage('info', '大小写转换功能仅适用于文本工具')
      return
    }
    
    try {
      store.setBusyPanel(panel)
      const result = convertCase(store.source, caseType)
      store.setPreviewContent(result)
      showSuccess('大小写转换成功')
      store.setActiveTool(`${panel}-case`)
    } catch (error) {
      showError(getErrorMessage(error, '大小写转换失败'))
    } finally {
      store.setBusyPanel(null)
    }
  }
  
  // 编码
  function encodeText(panel: PanelKey, encodeType: EncodeType) {
    if (store.toolType !== 'text') {
      showMessage('info', '编码功能仅适用于文本工具')
      return
    }
    
    try {
      store.setBusyPanel(panel)
      let result = ''
      if (encodeType === EncodeType.BASE64) {
        result = encodeBase64(store.source)
      } else if (encodeType === EncodeType.URL) {
        result = encodeURL(store.source)
      }
      store.setPreviewContent(result)
      showSuccess(`${encodeType.toUpperCase()} 编码成功`)
      store.setActiveTool(`${panel}-encode`)
    } catch (error) {
      showError(getErrorMessage(error, '编码失败'))
    } finally {
      store.setBusyPanel(null)
    }
  }
  
  // 解码
  function decodeText(panel: PanelKey, decodeType: EncodeType) {
    if (store.toolType !== 'text') {
      showMessage('info', '解码功能仅适用于文本工具')
      return
    }
    
    try {
      store.setBusyPanel(panel)
      let result = ''
      if (decodeType === EncodeType.BASE64) {
        result = decodeBase64(store.source)
      } else if (decodeType === EncodeType.URL) {
        result = decodeURL(store.source)
      }
      store.setPreviewContent(result)
      showSuccess(`${decodeType.toUpperCase()} 解码成功`)
      store.setActiveTool(`${panel}-decode`)
    } catch (error) {
      showError(getErrorMessage(error, '解码失败'))
    } finally {
      store.setBusyPanel(null)
    }
  }
  
  // 去除空白
  function trimText(panel: PanelKey, trimType: TrimOption) {
    if (store.toolType !== 'text') {
      showMessage('info', '去除空白功能仅适用于文本工具')
      return
    }
    
    try {
      store.setBusyPanel(panel)
      const result = trimWhitespace(store.source, trimType)
      store.setPreviewContent(result)
      showSuccess('去除空白成功')
      store.setActiveTool(`${panel}-trim`)
    } catch (error) {
      showError(getErrorMessage(error, '去除空白失败'))
    } finally {
      store.setBusyPanel(null)
    }
  }
  
  // 统计信息
  function getStats(panel: PanelKey) {
    if (store.toolType !== 'text') {
      showMessage('info', '统计功能仅适用于文本工具')
      return
    }
    
    try {
      const stats = getTextStats(store.source)
      const statsText = `文本统计信息
═══════════════════════════════════════

字符数（含空格）: ${stats.characters.toLocaleString()}
字符数（不含空格）: ${stats.charactersNoSpaces.toLocaleString()}
单词数: ${stats.words.toLocaleString()}
行数: ${stats.lines.toLocaleString()}
段落数: ${stats.paragraphs.toLocaleString()}
字节数: ${stats.bytes.toLocaleString()}

═══════════════════════════════════════`
      store.setPreviewContent(statsText)
      showSuccess('统计信息已显示在右侧预览区域')
      store.setActiveTool(`${panel}-stats`)
    } catch (error) {
      showError(getErrorMessage(error, '统计失败'))
    }
  }
  
  return {
    convertTextCase,
    encodeText,
    decodeText,
    trimText,
    getStats
  }
}

