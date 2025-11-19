<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { createDefaultOptions } from 'monaco-editor-vue3'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import { jsonrepair } from 'jsonrepair'
import { create as createDiffer } from 'jsondiffpatch'
import TopBar from '../components/workspace/TopBar.vue'
import SideToolbar from '../components/workspace/SideToolbar.vue'
import JsonWorkspace from '../components/workspace/JsonWorkspace.vue'
import TextWorkspace from '../components/workspace/TextWorkspace.vue'
import ImageWorkspace from '../components/workspace/ImageWorkspace.vue'
import DiffWorkspace from '../components/workspace/DiffWorkspace.vue'
import StatusBar from '../components/workspace/StatusBar.vue'
import StorageDialog from '../components/modals/StorageDialog.vue'
import ImportOptionsModal from '../components/modals/ImportOptionsModal.vue'
import CachePickerModal from '../components/modals/CachePickerModal.vue'
import { deleteSnippet, getSnippet, listSnippets, saveSnippet } from '../services/storageStore'
import type { StoredSnippet } from '../services/storageStore'
import type { PanelKey, ToolAction, MessageLevel, DiffState, ToolType } from '../types/jsonTools'
import { useTheme } from '../composables/useTheme'
import { parseJsonError } from '../utils/format'
import { getConfig, saveConfig } from '../config/app'
import {
  convertCase,
  encodeBase64,
  decodeBase64,
  encodeURL,
  decodeURL,
  trimWhitespace,
  getTextStats,
  type CaseType,
  type TrimOption
} from '../utils/textTools'

const { theme, themeToggleTitle, isDarkTheme, toggleTheme } = useTheme()

const editorTheme = computed(() => `byte-tools-${theme.value}`)
const differ = createDiffer({
  arrays: { detectMove: false, includeValueOnMove: false }
})

// 从配置加载默认工具类型
const config = getConfig()
const toolType = ref<ToolType>(config.defaultTool)

// 从 localStorage 恢复内容
const getStoredSource = (tool: ToolType): string => {
  try {
    const stored = localStorage.getItem(`byte-tools-source-${tool}`)
    if (stored) {
      return stored
    }
  } catch (error) {
    console.warn('无法读取 localStorage:', error)
  }
  
  // 根据工具类型返回默认内容
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

const getStoredTarget = (tool: ToolType): string => {
  try {
    const stored = localStorage.getItem(`byte-tools-target-${tool}`)
    if (stored) {
      return stored
    }
  } catch (error) {
    console.warn('无法读取 localStorage:', error)
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

const state = reactive({
  source: getStoredSource(toolType.value),
  target: getStoredTarget(toolType.value)
})

const mode = ref<'format' | 'diff'>('format')

// 监听工具类型变化，更新内容
watch(toolType, (newTool, oldTool) => {
  // 保存旧工具的内容
  if (oldTool) {
    try {
      localStorage.setItem(`byte-tools-source-${oldTool}`, state.source)
      localStorage.setItem(`byte-tools-target-${oldTool}`, state.target)
    } catch (error) {
      console.warn('无法保存 localStorage:', error)
    }
  }
  
  // 加载新工具的内容
  state.source = getStoredSource(newTool)
  state.target = getStoredTarget(newTool)
  
  // 保存配置
  saveConfig({ defaultTool: newTool })
  
  // JSON 工具才支持 diff 模式
  if (newTool !== 'json' && mode.value === 'diff') {
    mode.value = 'format'
  }
  
  // 重置预览内容
  previewContent.value = ''
  previewIsValid.value = true
})
const activeTool = ref<ToolAction | null>(null)
const busyPanel = ref<PanelKey | null>(null)
const message = ref<{ level: MessageLevel; text: string } | null>(null)
const diffInstance = ref<MonacoEditorNS.IStandaloneDiffEditor | null>(null)
const autoFormat = ref(false)
let messageTimer: number | null = null

const sourceInput = ref<HTMLInputElement | null>(null)
const targetInput = ref<HTMLInputElement | null>(null)
const previewContent = ref('')
const previewIsValid = ref(true)
const cursorPosition = ref<{ line: number; column: number } | null>(null)
const sourceEditorInstance = ref<MonacoEditorNS.IStandaloneCodeEditor | null>(null)
const errorPosition = ref<{ line: number; column: number } | null>(null)
const deepParse = ref(true)

const storageDialog = reactive({
  visible: false,
  panel: 'source' as PanelKey,
  loading: false,
  title: '',
  size: 0
})

const importOptions = reactive({
  visible: false,
  panel: 'source' as PanelKey
})

const cachePicker = reactive({
  visible: false,
  panel: 'source' as PanelKey,
  loading: false,
  items: [] as StoredSnippet[],
  selectedId: null as string | null
})

// 根据工具类型获取编辑器语言
const getEditorLanguage = (tool: ToolType): string => {
  switch (tool) {
    case 'json':
      return 'json'
    case 'text':
      return 'plaintext'
    case 'image':
      return 'plaintext'
    default:
      return 'plaintext'
  }
}

const baseEditorOptions = computed(() => {
  const options = createDefaultOptions(getEditorLanguage(toolType.value))
  return {
    ...options,
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    formatOnPaste: false,
    formatOnType: false,
    renderLineHighlight: 'all',
    fontFamily:
      '"Cascadia Code", "Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
    fontSize: 14,
    lineHeight: 22,
    wordWrap: 'on',
    padding: { top: 16, bottom: 16 },
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    unfoldOnClickAfterEndOfLine: true
  }
})
const sourceEditorOptions = computed(() => ({
  ...baseEditorOptions.value,
  readOnly: false,
  formatOnPaste: toolType.value === 'json' ? autoFormat.value : false,
  formatOnType: toolType.value === 'json' ? autoFormat.value : false
}))

const previewEditorOptions = computed(() => ({
  ...baseEditorOptions.value,
  readOnly: true
}))

const diffEditorOptions = computed<MonacoEditorNS.IStandaloneDiffEditorConstructionOptions>(() => ({
  ...baseEditorOptions.value,
  automaticLayout: true,
  enableSplitViewResizing: true,
  renderSideBySide: true,
  originalEditable: true,
  diffAlgorithm: 'advanced',
  readOnly: false
}))

function estimateContentSize(content: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(content).length
  }
  return content.length
}

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

async function refreshCacheItems(showError = true) {
  cachePicker.loading = true
  let success = true
  try {
    cachePicker.items = await listSnippets()
    if (!cachePicker.items.some((item) => item.id === cachePicker.selectedId)) {
      cachePicker.selectedId = null
    }
  } catch (error) {
    success = false
    if (showError) {
      const message = error instanceof Error ? error.message : '读取缓存失败'
      showMessage('error', message)
    }
  } finally {
    cachePicker.loading = false
  }
  return success
}

onMounted(() => {
  monaco.editor.defineTheme('byte-tools-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', background: '2B2D30', foreground: 'F1F5F9' },
      { token: 'string.key.json', foreground: '60A5FA' },
      { token: 'string.value.json', foreground: 'FBBF24' },
      { token: 'number', foreground: 'F97316' },
      { token: 'keyword.json', foreground: 'A78BFA' },
      { token: 'delimiter', foreground: '94A3B8' }
    ],
    colors: {
      'editor.background': '#2b2d30',
      'editor.foreground': '#f1f5f9',
      'editorCursor.foreground': '#5b8def',
      'editor.lineHighlightBackground': '#35373b',
      'editorLineNumber.foreground': '#8a9099',
      'editorLineNumber.activeForeground': '#f1f5f9',
      'editor.selectionBackground': '#3a3c4240',
      'editor.inactiveSelectionBackground': '#3a3c4226',
      'editorWidget.background': '#313338',
      'editorSuggestWidget.background': '#313338',
      'scrollbarSlider.background': '#4a4d54aa',
      'scrollbarSlider.hoverBackground': '#5c6068cc',
      'diffEditor.insertedTextBackground': '#2f855a33',
      'diffEditor.removedTextBackground': '#9f123933',
      'panel.background': '#2b2d30'
    }
  })

  monaco.editor.defineTheme('byte-tools-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: '', background: 'FFFFFF', foreground: '1E293B' },
      { token: 'string.key.json', foreground: '1D4ED8' },
      { token: 'string.value.json', foreground: 'CA8A04' },
      { token: 'number', foreground: 'C2410C' },
      { token: 'keyword.json', foreground: '6D28D9' },
      { token: 'delimiter', foreground: '64748B' }
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#1e293b',
      'editorCursor.foreground': '#2b6efa',
      'editor.lineHighlightBackground': '#e2e8f0',
      'editorLineNumber.foreground': '#94a3b8',
      'editorLineNumber.activeForeground': '#1e293b',
      'editor.selectionBackground': '#cbd5f51f',
      'editor.inactiveSelectionBackground': '#cbd5f550',
      'editorWidget.background': '#f8fafc',
      'editorSuggestWidget.background': '#f8fafc',
      'scrollbarSlider.background': '#cbd5f580',
      'scrollbarSlider.hoverBackground': '#94a3b899',
      'diffEditor.insertedTextBackground': '#22c55e1f',
      'diffEditor.removedTextBackground': '#f871711f',
      'panel.background': '#ffffff'
    }
  })

  monaco.editor.setTheme(`byte-tools-${theme.value}`)

  watch(
    theme,
    (modeValue) => {
      monaco.editor.setTheme(`byte-tools-${modeValue}`)
    }
  )
})

watch(
  () => mode.value,
  (currentMode) => {
    if (currentMode === 'format') {
      diffInstance.value = null
    } else if (previewIsValid.value) {
      state.target = previewContent.value
    }
  }
)

// 监听 source 变化并保存到 localStorage
watch(
  [() => state.source, () => toolType.value],
  ([source, tool]) => {
    try {
      localStorage.setItem(`byte-tools-source-${tool}`, source)
    } catch (error) {
      console.warn('无法保存到 localStorage:', error)
    }
  }
)

watch(
  [() => mode.value, () => state.source, () => deepParse.value, () => toolType.value],
  ([currentMode, source, isDeepParse, tool]) => {
    if (currentMode === 'diff' || tool !== 'json') {
      return
    }
    
    // 检查是否为空或只有空白字符
    const trimmedSource = source.trim()
    if (!trimmedSource) {
      previewContent.value = `// 请输入 JSON 字符串`
      previewIsValid.value = false
      errorPosition.value = null
      return
    }
    
    try {
      let parsed = JSON.parse(source)
      
      // 如果启用了深度解析，递归解析所有字符串中的 JSON
      if (isDeepParse) {
        parsed = deepParseJson(parsed)
      }
      
      previewContent.value = JSON.stringify(parsed, null, 2)
      previewIsValid.value = true
      errorPosition.value = null
    } catch (error) {
      const errorInfo = parseJsonError(error, source)
      if (errorInfo) {
        errorPosition.value = {
          line: errorInfo.line,
          column: errorInfo.column
        }
        
        // 提取错误位置前后各20个字符的上下文
        const contextLength = 20
        const errorPos = errorInfo.position
        const startPos = Math.max(0, errorPos - contextLength)
        const endPos = Math.min(source.length, errorPos + contextLength + 1)
        const context = source.substring(startPos, endPos)
        const errorCharIndexInContext = errorPos - startPos
        
        // 转义特殊字符以便在注释中显示
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
        
        // 如果前面有内容，添加省略号
        const prefixEllipsis = startPos > 0 ? '...' : ''
        // 如果后面有内容，添加省略号
        const suffixEllipsis = endPos < source.length ? '...' : ''
        
        // 计算指示器位置（考虑前缀省略号）
        const prefixLength = prefixEllipsis.length
        const indicatorPos = prefixLength + beforeError.length
        const errorCharDisplay = errorChar ? `[${errorChar}]` : '?'
        
        // 构建美观的错误提示
        previewContent.value = `// ════════════════════════════════════════════════════════════
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
// ════════════════════════════════════════════════════════════`
      } else {
        errorPosition.value = null
        previewContent.value = `// JSON 解析错误
//
// 无法解析 JSON，请检查输入
//
${source}`
      }
      previewIsValid.value = false
    }
  },
  { immediate: true }
)

function handleToggleDeepParse() {
  deepParse.value = !deepParse.value
  showMessage('success', deepParse.value ? '已启用深度解析' : '已禁用深度解析')
}

watch(
  [() => storageDialog.visible, () => storageDialog.panel, () => state.source, () => state.target],
  () => {
    if (!storageDialog.visible) {
      return
    }
    storageDialog.size = estimateContentSize(state[storageDialog.panel])
  }
)

const diffState = computed<DiffState>(() => {
  if (mode.value === 'format') {
    return previewIsValid.value
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
    const left = JSON.parse(state.source)
    const right = JSON.parse(state.target)
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

function showMessage(level: MessageLevel, text: string) {
  message.value = { level, text }
  if (messageTimer) {
    window.clearTimeout(messageTimer)
  }
  messageTimer = window.setTimeout(() => {
    message.value = null
    messageTimer = null
  }, 2800)
}

function handleFormat(panel: PanelKey, space = 2) {
  if (toolType.value !== 'json') {
    showMessage('info', '格式化功能仅适用于 JSON 工具')
    return
  }
  try {
    busyPanel.value = panel
    const source = state[panel]
    const parsed = JSON.parse(source)
    state[panel] = JSON.stringify(parsed, null, space)
    showMessage('success', panel === 'source' ? '源 JSON 已格式化' : '目标 JSON 已格式化')
    activeTool.value = `${panel}-format`
  } catch (error) {
    showMessage('error', '格式化失败，请检查 JSON 是否有效')
  } finally {
    busyPanel.value = null
  }
}

function handleMinify(panel: PanelKey) {
  if (toolType.value !== 'json') {
    showMessage('info', '压缩功能仅适用于 JSON 工具')
    return
  }
  try {
    busyPanel.value = panel
    const parsed = JSON.parse(state[panel])
    state[panel] = JSON.stringify(parsed)
    showMessage('success', panel === 'source' ? '源 JSON 已压缩' : '目标 JSON 已压缩')
    activeTool.value = `${panel}-minify`
  } catch (error) {
    showMessage('error', '压缩失败，JSON 格式无效')
  } finally {
    busyPanel.value = null
  }
}

function handleRepair(panel: PanelKey) {
  if (toolType.value !== 'json') {
    showMessage('info', '修复功能仅适用于 JSON 工具')
    return
  }
  try {
    busyPanel.value = panel
    const repaired = jsonrepair(state[panel])
    state[panel] = JSON.stringify(JSON.parse(repaired), null, 2)
    showMessage('success', panel === 'source' ? '尝试修复源 JSON 成功' : '尝试修复目标 JSON 成功')
    activeTool.value = `${panel}-repair`
  } catch (error) {
    showMessage('error', '修复失败，无法自动识别问题')
  } finally {
    busyPanel.value = null
  }
}

function handleTextCase(panel: PanelKey, caseType: string) {
  if (toolType.value !== 'text') {
    showMessage('info', '大小写转换功能仅适用于文本工具')
    return
  }
  try {
    busyPanel.value = panel
    const result = convertCase(state.source, caseType as CaseType)
    previewContent.value = result
    showMessage('success', '大小写转换成功')
    activeTool.value = `${panel}-case`
  } catch (error) {
    showMessage('error', '大小写转换失败')
  } finally {
    busyPanel.value = null
  }
}

function handleTextEncode(panel: PanelKey, encodeType: string) {
  if (toolType.value !== 'text') {
    showMessage('info', '编码功能仅适用于文本工具')
    return
  }
  try {
    busyPanel.value = panel
    let result = ''
    if (encodeType === 'base64') {
      result = encodeBase64(state.source)
    } else if (encodeType === 'url') {
      result = encodeURL(state.source)
    }
    previewContent.value = result
    showMessage('success', `${encodeType.toUpperCase()} 编码成功`)
    activeTool.value = `${panel}-encode`
  } catch (error) {
    const message = error instanceof Error ? error.message : '编码失败'
    showMessage('error', message)
  } finally {
    busyPanel.value = null
  }
}

function handleTextDecode(panel: PanelKey, decodeType: string) {
  if (toolType.value !== 'text') {
    showMessage('info', '解码功能仅适用于文本工具')
    return
  }
  try {
    busyPanel.value = panel
    let result = ''
    if (decodeType === 'base64') {
      result = decodeBase64(state.source)
    } else if (decodeType === 'url') {
      result = decodeURL(state.source)
    }
    previewContent.value = result
    showMessage('success', `${decodeType.toUpperCase()} 解码成功`)
    activeTool.value = `${panel}-decode`
  } catch (error) {
    const message = error instanceof Error ? error.message : '解码失败'
    showMessage('error', message)
  } finally {
    busyPanel.value = null
  }
}

function handleTextTrim(panel: PanelKey, trimType: string) {
  if (toolType.value !== 'text') {
    showMessage('info', '去除空白功能仅适用于文本工具')
    return
  }
  try {
    busyPanel.value = panel
    const result = trimWhitespace(state.source, trimType as TrimOption)
    previewContent.value = result
    showMessage('success', '去除空白成功')
    activeTool.value = `${panel}-trim`
  } catch (error) {
    showMessage('error', '去除空白失败')
  } finally {
    busyPanel.value = null
  }
}

function handleTextStats(panel: PanelKey) {
  if (toolType.value !== 'text') {
    showMessage('info', '统计功能仅适用于文本工具')
    return
  }
  try {
    const stats = getTextStats(state.source)
    // 格式化统计信息，显示在右侧预览区域
    const statsText = `文本统计信息
═══════════════════════════════════════

字符数（含空格）: ${stats.characters.toLocaleString()}
字符数（不含空格）: ${stats.charactersNoSpaces.toLocaleString()}
单词数: ${stats.words.toLocaleString()}
行数: ${stats.lines.toLocaleString()}
段落数: ${stats.paragraphs.toLocaleString()}
字节数: ${stats.bytes.toLocaleString()}

═══════════════════════════════════════`
    previewContent.value = statsText
    showMessage('success', '统计信息已显示在右侧预览区域')
    activeTool.value = `${panel}-stats`
  } catch (error) {
    showMessage('error', '统计失败')
  }
}

function handleSave(panel: PanelKey) {
  storageDialog.panel = panel
  storageDialog.title = createSuggestedTitle(panel)
  storageDialog.size = estimateContentSize(state[panel])
  storageDialog.visible = true
}

async function handleConfirmSave(title: string) {
  if (!storageDialog.visible || storageDialog.loading) {
    return
  }
  const panel = storageDialog.panel
  const content = state[panel]
  
  // 检查内容是否为空
  if (!content || !content.trim()) {
    showMessage('error', '空文本不允许保存')
    return
  }
  
  storageDialog.loading = true
  try {
    await saveSnippet(panel, title, content)
    showMessage('success', '内容已保存到缓存')
    activeTool.value = `${panel}-save`
    storageDialog.visible = false
    if (cachePicker.visible) {
      await refreshCacheItems(false)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存失败，请重试'
    showMessage('error', message)
  } finally {
    storageDialog.loading = false
  }
}

function handleCancelSave() {
  if (storageDialog.loading) {
    return
  }
  storageDialog.visible = false
}

function triggerImport(panel: PanelKey) {
  importOptions.panel = panel
  importOptions.visible = true
}

function startFileImport(panel: PanelKey) {
  const input = panel === 'source' ? sourceInput.value : targetInput.value
  input?.click()
  activeTool.value = `${panel}-import`
  importOptions.visible = false
}

async function openCachePicker(panel: PanelKey) {
  cachePicker.panel = panel
  cachePicker.visible = true
  cachePicker.selectedId = null
  importOptions.visible = false
  const success = await refreshCacheItems()
  if (!success) {
    cachePicker.visible = false
  }
}

async function handleOpenCacheManager() {
  importOptions.visible = false
  cachePicker.visible = true
  cachePicker.selectedId = null
  const success = await refreshCacheItems()
  if (!success) {
    cachePicker.visible = false
  }
}

function handleCloseCachePicker() {
  if (cachePicker.loading) {
    return
  }
  cachePicker.visible = false
  cachePicker.selectedId = null
}

async function handleSelectCacheSnippet(id: string) {
  try {
    const snippet = await getSnippet(id)
    if (!snippet) {
      showMessage('error', '未找到对应的缓存记录')
      await refreshCacheItems()
      return
    }
    state[cachePicker.panel] = snippet.content
    activeTool.value = `${cachePicker.panel}-import`
    showMessage('success', `已从缓存加载：${snippet.title}`)
    cachePicker.visible = false
    cachePicker.selectedId = null
  } catch (error) {
    const message = error instanceof Error ? error.message : '读取缓存失败'
    showMessage('error', message)
  }
}

async function handleDeleteCacheSnippet(id: string) {
  try {
    await deleteSnippet(id)
    cachePicker.items = cachePicker.items.filter((item) => item.id !== id)
    if (cachePicker.selectedId === id) {
      cachePicker.selectedId = null
    }
    showMessage('success', '缓存已删除')
    if (!cachePicker.items.length) {
      await refreshCacheItems(false)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除缓存失败'
    showMessage('error', message)
  }
}

function handlePreviewCacheSnippet(id: string | null) {
  cachePicker.selectedId = id
}

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

async function handleCopyCacheSnippet(id: string) {
  const snippet = cachePicker.items.find((item) => item.id === id)
  if (!snippet) {
    showMessage('error', '未找到对应的缓存记录')
    await refreshCacheItems()
    return
  }

  try {
    await copyToClipboard(snippet.content)
    showMessage('success', '内容已复制到剪贴板')
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '复制失败，请检查浏览器权限'
    showMessage('error', message)
  }
}

function handleImport(panel: PanelKey, event: Event) {
  const input = event.target as HTMLInputElement
  const fileList = input.files
  if (!fileList || fileList.length === 0) {
    input.value = ''
    return
  }
  const file = fileList.item(0)
  if (!file) {
    showMessage('error', '未能读取文件，请重试')
    input.value = ''
    return
  }

  // 图片工具：读取为 base64
  if (toolType.value === 'image' && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = () => {
      state[panel] = String(reader.result ?? '')
      showMessage('success', `${file.name} 已加载到${panel === 'source' ? '源' : '目标'}面板`)
      input.value = ''
      activeTool.value = `${panel}-import`
    }
    reader.onerror = () => {
      showMessage('error', '导入失败，请重试')
      input.value = ''
    }
    reader.readAsDataURL(file)
    return
  }

  // 文本和 JSON 工具：读取为文本
  const reader = new FileReader()
  reader.onload = () => {
    state[panel] = String(reader.result ?? '')
    showMessage('success', `${file.name} 已加载到${panel === 'source' ? '源' : '目标'}面板`)
    input.value = ''
    activeTool.value = `${panel}-import`
  }
  reader.onerror = () => {
    showMessage('error', '导入失败，请重试')
    input.value = ''
  }
  reader.readAsText(file, 'utf-8')
}

function handleExport(panel: PanelKey) {
  try {
    let blob: Blob
    let filename: string
    const now = new Date()
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
    
    if (toolType.value === 'image' && state[panel].startsWith('data:')) {
      // 图片：从 base64 转换为 blob
      const base64Data = state[panel].split(',')[1]
      if (!base64Data) {
        showMessage('error', '无效的图片数据')
        return
      }
      const mimeType = state[panel].match(/data:([^;]+)/)?.[1] || 'image/png'
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      blob = new Blob([byteArray], { type: mimeType })
      const ext = mimeType.split('/')[1] || 'png'
      filename = `image-${timestamp}.${ext}`
    } else if (toolType.value === 'json') {
      blob = new Blob([state[panel]], { type: 'application/json;charset=utf-8' })
      filename = `json-${timestamp}.json`
    } else {
      blob = new Blob([state[panel]], { type: 'text/plain;charset=utf-8' })
      filename = `text-${timestamp}.txt`
    }
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    showMessage('success', '导出成功')
    activeTool.value = `${panel}-export`
  } catch (error) {
    showMessage('error', '导出失败')
  }
}

function handleClear(panel: PanelKey) {
  state[panel] = '{\n\n}'
  activeTool.value = `${panel}-clear`
}

const MODEL_PATCH_FLAG = '__byteJsonPatchedSetValue__'
type PatchedTextModel = monaco.editor.ITextModel & {
  __byteJsonPatchedSetValue__?: boolean
}

function patchModelSetValue(model: monaco.editor.ITextModel | null) {
  if (!model) {
    return
  }
  const flaggedModel = model as PatchedTextModel
  if (flaggedModel[MODEL_PATCH_FLAG]) {
    return
  }
  const originalSetValue = model.setValue.bind(model)
  flaggedModel[MODEL_PATCH_FLAG] = true
  model.setValue = ((newValue: string) => {
    if (model.getValue() === newValue) {
      return
    }
    originalSetValue(newValue)
  }) as typeof model.setValue
}

function handleDiffMount(editor: MonacoEditorNS.IStandaloneDiffEditor) {
  diffInstance.value = editor
  const originalEditor = editor.getOriginalEditor()
  const modifiedEditor = editor.getModifiedEditor()
  const originalModel = originalEditor.getModel()
  const modifiedModel = modifiedEditor.getModel()

  // 为两个编辑器单独配置折叠选项
  originalEditor.updateOptions({
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    unfoldOnClickAfterEndOfLine: true
  })
  modifiedEditor.updateOptions({
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    unfoldOnClickAfterEndOfLine: true
  })

  patchModelSetValue(originalModel)
  patchModelSetValue(modifiedModel)

  if (originalModel) {
    originalModel.onDidChangeContent(() => {
      state.source = originalModel.getValue()
    })
  }
  if (modifiedModel) {
    modifiedModel.onDidChangeContent(() => {
      state.target = modifiedModel.getValue()
    })
  }
}

function handleOpenAbout() {
  window.open('/product', '_blank')
}

function handleToggleAutoFormat() {
  autoFormat.value = !autoFormat.value
  if (sourceEditorInstance.value) {
    sourceEditorInstance.value.updateOptions({
      formatOnPaste: autoFormat.value,
      formatOnType: autoFormat.value
    })
  }
  showMessage('success', autoFormat.value ? '已启用自动格式化' : '已禁用自动格式化')
}

/**
 * 深度解析 JSON 对象，递归解析所有字符串值中的 JSON
 */
function deepParseJson(obj: any): any {
  if (typeof obj === 'string') {
    // 尝试解析字符串中的 JSON
    const trimmed = obj.trim()
    // 检查是否看起来像 JSON（以 { 或 [ 开头）
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        const parsed = JSON.parse(trimmed)
        // 如果解析成功，递归处理解析后的对象
        return deepParseJson(parsed)
      } catch {
        // 解析失败，返回原字符串
        return obj
      }
    }
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepParseJson(item))
  }

  if (obj !== null && typeof obj === 'object') {
    const result: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = deepParseJson(obj[key])
      }
    }
    return result
  }

  return obj
}
</script>

<template>
  <div class="app">
    <TopBar
      :tool-type="toolType"
      :mode="mode"
      :active-tool="activeTool"
      :auto-format="autoFormat"
      :deep-parse="deepParse"
      @trigger-import="triggerImport"
      @save="handleSave"
      @export="handleExport"
      @format="handleFormat"
      @minify="handleMinify"
      @repair="handleRepair"
      @clear="handleClear"
      @toggle-auto-format="handleToggleAutoFormat"
      @toggle-deep-parse="handleToggleDeepParse"
      @update:tool-type="toolType = $event"
      @text-case="handleTextCase"
      @text-encode="handleTextEncode"
      @text-decode="handleTextDecode"
      @text-trim="handleTextTrim"
      @text-stats="handleTextStats"
    />

    <div class="main-layout">
      <SideToolbar
        :tool-type="toolType"
        :mode="mode"
        :theme-toggle-title="themeToggleTitle"
        :is-dark-theme="isDarkTheme"
        @update:mode="mode = $event"
        @toggleTheme="toggleTheme"
        @open-cache-manager="handleOpenCacheManager"
        @open-about="handleOpenAbout"
      />

      <section class="workspace" :class="{ 'is-diff': mode === 'diff' && toolType === 'json' }">
        <!-- JSON 工具 -->
        <template v-if="toolType === 'json'">
          <JsonWorkspace
            v-if="mode === 'format'"
            :source="state.source"
            :preview-content="previewContent"
            :editor-theme="editorTheme"
            :source-editor-options="sourceEditorOptions"
            :preview-editor-options="previewEditorOptions"
            @update:source="state.source = $event"
            @cursor-change="cursorPosition = $event"
            @editor-mounted="sourceEditorInstance = $event"
          />
          <DiffWorkspace
            v-else
            :source="state.source"
            :target="state.target"
            :editor-theme="editorTheme"
            :diff-editor-options="diffEditorOptions"
            @mount="handleDiffMount"
            @update:target="state.target = $event"
            @cursor-change="cursorPosition = $event"
          />
        </template>

        <!-- 文本工具 -->
        <TextWorkspace
          v-else-if="toolType === 'text'"
          :source="state.source"
          :preview-content="previewContent"
          :editor-theme="editorTheme"
          :source-editor-options="sourceEditorOptions"
          :preview-editor-options="previewEditorOptions"
          @update:source="state.source = $event"
          @cursor-change="cursorPosition = $event"
          @editor-mounted="sourceEditorInstance = $event"
        />

        <!-- 图片工具 -->
        <ImageWorkspace
          v-else-if="toolType === 'image'"
          :source="state.source"
          :preview-content="previewContent"
          @update:source="state.source = $event"
        />
      </section>
    </div>

    <StatusBar
      :diff-state="diffState"
      :busy-panel="busyPanel"
      :message="message"
      :cursor-position="cursorPosition"
      :error-position="mode === 'format' && !previewIsValid ? errorPosition : null"
    />

    <input
      ref="sourceInput"
      type="file"
      :accept="toolType === 'image' ? 'image/*' : toolType === 'json' ? '.json,application/json' : '*/*'"
      class="hidden-input"
      @change="handleImport('source', $event)"
    />
    <input
      ref="targetInput"
      type="file"
      :accept="toolType === 'image' ? 'image/*' : toolType === 'json' ? '.json,application/json' : '*/*'"
      class="hidden-input"
      @change="handleImport('target', $event)"
    />

    <StorageDialog
      v-if="storageDialog.visible"
      :visible="storageDialog.visible"
      :panel="storageDialog.panel"
      :initial-title="storageDialog.title"
      :size="storageDialog.size"
      :content="state[storageDialog.panel]"
      :loading="storageDialog.loading"
      @cancel="handleCancelSave"
      @confirm="handleConfirmSave"
    />

    <ImportOptionsModal
      v-if="importOptions.visible"
      :visible="importOptions.visible"
      :panel="importOptions.panel"
      @close="importOptions.visible = false"
      @select-file="startFileImport(importOptions.panel)"
      @select-cache="openCachePicker(importOptions.panel)"
    />

    <CachePickerModal
      v-if="cachePicker.visible"
      :visible="cachePicker.visible"
      :panel="cachePicker.panel"
      :loading="cachePicker.loading"
      :items="cachePicker.items"
      :selected-id="cachePicker.selectedId"
      @close="handleCloseCachePicker"
      @select="handleSelectCacheSnippet"
      @delete="handleDeleteCacheSnippet"
      @copy="handleCopyCacheSnippet"
      @preview="handlePreviewCacheSnippet"
      @refresh="refreshCacheItems()"
    />
  </div>
</template>

<style scoped lang="less">
.app {
  --sidebar-width: 40px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  color: var(--text-primary);
  background: linear-gradient(160deg, var(--app-gradient-start) 0%, var(--app-gradient-end) 100%);
  overflow: hidden;

  .main-layout {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  .workspace {
    flex: 1;
    display: grid;
    grid-template-columns: 0.4fr 0.6fr;
    gap: 0;
    min-height: 0;
    overflow: hidden;

    &.is-diff {
      grid-template-columns: 1fr;
    }
  }

  .hidden-input {
    display: none;
  }
}

@media (max-width: 1280px) {
  .app .workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .app .main-layout {
    flex-direction: column;
  }
}
</style>

