import { computed, watch } from 'vue'
import { jsonrepair } from 'jsonrepair'
import { create as createDiffer } from 'jsondiffpatch'
import { useWorkspaceStore } from '@/stores/workspace'
import { useMessage } from './useMessage'
import { parseJsonError } from '@/utils/format'
import { EDITOR_CONSTANTS } from '@/constants'
import type { PanelKey, DiffState } from '@/types/jsonTools'

/**
 * JSON 操作 Composable
 */
export function useJsonOperations() {
  const store = useWorkspaceStore()
  const { showMessage, showError, showSuccess } = useMessage()
  
  const differ = createDiffer({
    arrays: { detectMove: false, includeValueOnMove: false }
  })
  
  // 深度解析 JSON
  function deepParseJson(obj: unknown): unknown {
    if (typeof obj === 'string') {
      const trimmed = obj.trim()
      if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        try {
          const parsed = JSON.parse(trimmed)
          return deepParseJson(parsed)
        } catch {
          return obj
        }
      }
      return obj
    }
    
    if (Array.isArray(obj)) {
      return obj.map((item) => deepParseJson(item))
    }
    
    if (obj !== null && typeof obj === 'object') {
      const result: Record<string, unknown> = {}
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = deepParseJson((obj as Record<string, unknown>)[key])
        }
      }
      return result
    }
    
    return obj
  }
  
  // 格式化 JSON
  function formatJson(panel: PanelKey, space = EDITOR_CONSTANTS.DEFAULT_JSON_INDENT) {
    if (store.toolType !== 'json') {
      showMessage('info', '格式化功能仅适用于 JSON 工具')
      return
    }
    
    try {
      store.setBusyPanel(panel)
      const content = panel === 'source' ? store.source : store.target
      const parsed = JSON.parse(content)
      const formatted = JSON.stringify(parsed, null, space)
      
      if (panel === 'source') {
        store.setSource(formatted)
      } else {
        store.setTarget(formatted)
      }
      
      showSuccess(panel === 'source' ? '源 JSON 已格式化' : '目标 JSON 已格式化')
      store.setActiveTool(`${panel}-format`)
    } catch (error) {
      showError('格式化失败，请检查 JSON 是否有效')
    } finally {
      store.setBusyPanel(null)
    }
  }
  
  // 压缩 JSON
  function minifyJson(panel: PanelKey) {
    if (store.toolType !== 'json') {
      showMessage('info', '压缩功能仅适用于 JSON 工具')
      return
    }
    
    try {
      store.setBusyPanel(panel)
      const content = panel === 'source' ? store.source : store.target
      const parsed = JSON.parse(content)
      const minified = JSON.stringify(parsed)
      
      if (panel === 'source') {
        store.setSource(minified)
      } else {
        store.setTarget(minified)
      }
      
      showSuccess(panel === 'source' ? '源 JSON 已压缩' : '目标 JSON 已压缩')
      store.setActiveTool(`${panel}-minify`)
    } catch (error) {
      showError('压缩失败，JSON 格式无效')
    } finally {
      store.setBusyPanel(null)
    }
  }
  
  // 修复 JSON
  function repairJson(panel: PanelKey) {
    if (store.toolType !== 'json') {
      showMessage('info', '修复功能仅适用于 JSON 工具')
      return
    }
    
    try {
      store.setBusyPanel(panel)
      const content = panel === 'source' ? store.source : store.target
      const repaired = jsonrepair(content)
      const formatted = JSON.stringify(JSON.parse(repaired), null, 2)
      
      if (panel === 'source') {
        store.setSource(formatted)
      } else {
        store.setTarget(formatted)
      }
      
      showSuccess(panel === 'source' ? '尝试修复源 JSON 成功' : '尝试修复目标 JSON 成功')
      store.setActiveTool(`${panel}-repair`)
    } catch (error) {
      showError('修复失败，无法自动识别问题')
    } finally {
      store.setBusyPanel(null)
    }
  }
  
  // 计算差异状态
  const diffState = computed<DiffState>(() => {
    if (store.mode === 'format') {
      return store.previewIsValid
        ? {
            ok: true,
            hasDiff: false,
            message: '已生成 JSON 预览'
          }
        : {
            ok: false,
            hasDiff: false,
            message: '源内容不是有效 JSON'
          }
    }
    
    try {
      const left = JSON.parse(store.source)
      const right = JSON.parse(store.target)
      const delta = differ.diff(left, right)
      return {
        ok: true,
        hasDiff: Boolean(delta),
        message: delta ? '已检测到差异' : '内容一致'
      }
    } catch (error) {
      return {
        ok: false,
        hasDiff: false,
        message: '无法比较，存在无效的 JSON'
      }
    }
  })
  
  // 监听 source 变化，自动更新预览
  watch(
    [() => store.mode, () => store.source, () => store.deepParse, () => store.toolType],
    ([currentMode, source, isDeepParse, tool]) => {
      if (currentMode === 'diff' || tool !== 'json') {
        return
      }
      
      const trimmedSource = source.trim()
      if (!trimmedSource) {
        store.setPreviewContent('// 请输入 JSON 字符串')
        store.setPreviewIsValid(false)
        store.setErrorPosition(null)
        return
      }
      
      try {
        let parsed = JSON.parse(source)
        
        if (isDeepParse) {
          parsed = deepParseJson(parsed)
        }
        
        store.setPreviewContent(JSON.stringify(parsed, null, 2))
        store.setPreviewIsValid(true)
        store.setErrorPosition(null)
      } catch (error) {
        const errorInfo = parseJsonError(error, source)
        if (errorInfo) {
          store.setErrorPosition({
            line: errorInfo.line,
            column: errorInfo.column
          })
          
          const contextLength = 20
          const errorPos = errorInfo.position
          const startPos = Math.max(0, errorPos - contextLength)
          const endPos = Math.min(source.length, errorPos + contextLength + 1)
          const context = source.substring(startPos, endPos)
          const errorCharIndexInContext = errorPos - startPos
          
          const escapeForComment = (str: string) => {
            return str
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t')
          }
          
          const escapedContext = escapeForComment(context)
          const beforeError = escapedContext.substring(0, errorCharIndexInContext)
          const errorChar = errorInfo.errorChar || (errorPos < source.length ? source[errorPos] : '')
          const afterError = escapedContext.substring(errorCharIndexInContext + 1)
          const prefixEllipsis = startPos > 0 ? '...' : ''
          const suffixEllipsis = endPos < source.length ? '...' : ''
          const prefixLength = prefixEllipsis.length
          const indicatorPos = prefixLength + beforeError.length
          const errorCharDisplay = errorChar ? `[${errorChar}]` : '?'
          
          store.setPreviewContent(`// ════════════════════════════════════════════════════════════
//  JSON 解析错误
// ════════════════════════════════════════════════════════════
//
// 错误位置
//    第 ${errorInfo.line} 行，第 ${errorInfo.column} 列
//
// 错误原因
//    ${errorInfo.message}
//
// 错误上下文（前后各 ${contextLength} 个字符）
//    ${prefixEllipsis}${beforeError}${errorCharDisplay}${afterError}${suffixEllipsis}
//    ${' '.repeat(indicatorPos)}${'^'.repeat(errorCharDisplay.length)}
//
// ════════════════════════════════════════════════════════════`)
        } else {
          store.setErrorPosition(null)
          store.setPreviewContent(`// JSON 解析错误
//
// 无法解析 JSON，请检查输入
//
${source}`)
        }
        store.setPreviewIsValid(false)
      }
    },
    { immediate: true }
  )
  
  return {
    formatJson,
    minifyJson,
    repairJson,
    diffState,
    deepParseJson
  }
}

