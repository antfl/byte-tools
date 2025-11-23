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
  getTextStats
} from '../utils/textTools'
import {
  compressImage,
  resizeImage,
  cropImage,
  rotateImage,
  flipImage,
  convertImageFormat,
  applyFilter,
  adjustImage
} from '../utils/imageTools'
import { IMAGE_CONSTANTS, STORAGE_CONSTANTS, EDITOR_CONSTANTS } from '@/constants'
import { ImageFormat, FilterType, FlipDirection, CaseType, TrimOption, EncodeType } from '@/types/enums'
import type { ToolActionPayload } from '@/types/actions'

const { theme, themeToggleTitle, isDarkTheme, toggleTheme } = useTheme()

const editorTheme = computed(() => `byte-tools-${theme.value}`)
const differ = createDiffer({
  arrays: { detectMove: false, includeValueOnMove: false }
})

const imageWorkspaceRef = ref<InstanceType<typeof ImageWorkspace> | null>(null)
const currentImageInfo = ref<{ width: number; height: number } | null>(null)
const imageHistory = ref<string[]>([])
const imageHistoryIndex = ref(-1)

const config = getConfig()
const toolType = ref<ToolType>(config.defaultTool)

function getStoredSource(tool: ToolType): string {
  try {
    const stored = localStorage.getItem(`${STORAGE_CONSTANTS.SOURCE_KEY_PREFIX}${tool}`)
    if (stored) {
      return stored
    }
  } catch {
    // 读取失败，使用默认值
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
    // 读取失败，使用默认值
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

watch(toolType, (newTool, oldTool) => {
  if (oldTool) {
    try {
      localStorage.setItem(`${STORAGE_CONSTANTS.SOURCE_KEY_PREFIX}${oldTool}`, state.source)
      localStorage.setItem(`${STORAGE_CONSTANTS.TARGET_KEY_PREFIX}${oldTool}`, state.target)
    } catch {
      // 保存失败，静默处理
    }
  }
  
  state.source = getStoredSource(newTool)
  state.target = getStoredTarget(newTool)
  saveConfig({ defaultTool: newTool })
  
  if (newTool !== 'json' && mode.value === 'diff') {
    mode.value = 'format'
  }
  
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

function getEditorLanguage(tool: ToolType): string {
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

watch(editorTheme, (themeName) => {
  monaco.editor.setTheme(themeName)
})

onMounted(() => {
  const storedTheme = localStorage.getItem(STORAGE_CONSTANTS.THEME_KEY)
  const currentTheme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : theme.value
  monaco.editor.setTheme(`byte-tools-${currentTheme}`)
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

watch(
  [() => state.source, () => toolType.value],
  ([source, tool]) => {
    try {
      localStorage.setItem(`${STORAGE_CONSTANTS.SOURCE_KEY_PREFIX}${tool}`, source)
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
    
    const trimmedSource = source.trim()
    if (!trimmedSource) {
      previewContent.value = `// 请输入 JSON 字符串`
      previewIsValid.value = false
      errorPosition.value = null
      return
    }
    
    try {
      let parsed = JSON.parse(source)
      
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
  }, EDITOR_CONSTANTS.MESSAGE_DURATION)
}

function handleFormat(panel: PanelKey, space = EDITOR_CONSTANTS.DEFAULT_JSON_INDENT) {
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

function handleTextCase(panel: PanelKey, caseType: CaseType) {
  if (toolType.value !== 'text') {
    showMessage('info', '大小写转换功能仅适用于文本工具')
    return
  }
  try {
    busyPanel.value = panel
    const result = convertCase(state.source, caseType)
    previewContent.value = result
    showMessage('success', '大小写转换成功')
    activeTool.value = `${panel}-case`
  } catch (error) {
    showMessage('error', '大小写转换失败')
  } finally {
    busyPanel.value = null
  }
}

function handleTextEncode(panel: PanelKey, encodeType: EncodeType) {
  if (toolType.value !== 'text') {
    showMessage('info', '编码功能仅适用于文本工具')
    return
  }
  try {
    busyPanel.value = panel
    let result = ''
    if (encodeType === EncodeType.BASE64) {
      result = encodeBase64(state.source)
    } else if (encodeType === EncodeType.URL) {
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

function handleTextDecode(panel: PanelKey, decodeType: EncodeType) {
  if (toolType.value !== 'text') {
    showMessage('info', '解码功能仅适用于文本工具')
    return
  }
  try {
    busyPanel.value = panel
    let result = ''
    if (decodeType === EncodeType.BASE64) {
      result = decodeBase64(state.source)
    } else if (decodeType === EncodeType.URL) {
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

function handleTextTrim(panel: PanelKey, trimType: TrimOption) {
  if (toolType.value !== 'text') {
    showMessage('info', '去除空白功能仅适用于文本工具')
    return
  }
  try {
    busyPanel.value = panel
    const result = trimWhitespace(state.source, trimType)
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

function initImageHistory(image: string) {
  if (toolType.value !== 'image') return
  imageHistory.value = [image]
  imageHistoryIndex.value = 0
}

function saveImageToHistory(image: string) {
  if (toolType.value !== 'image') return
  
  if (imageHistoryIndex.value < imageHistory.value.length - 1) {
    imageHistory.value = imageHistory.value.slice(0, imageHistoryIndex.value + 1)
  }
  
  imageHistory.value.push(image)
  imageHistoryIndex.value = imageHistory.value.length - 1
  
  if (imageHistory.value.length > IMAGE_CONSTANTS.MAX_HISTORY_SIZE) {
    const removed = imageHistory.value.shift()
    if (removed) {
      imageHistoryIndex.value--
    }
  }
}

function ensureCurrentStateInHistory(panel: PanelKey) {
  if (toolType.value !== 'image' || !state[panel]?.startsWith('data:image/')) {
    return
  }
  
  const currentImage = state[panel]
  
  if (imageHistory.value.length === 0) {
    saveImageToHistory(currentImage)
    return
  }
  
  if (imageHistoryIndex.value >= 0 && imageHistoryIndex.value < imageHistory.value.length) {
    const currentStateInHistory = imageHistory.value[imageHistoryIndex.value] === currentImage
    if (currentStateInHistory) {
      return
    }
  }
  
  saveImageToHistory(currentImage)
}

function handleImageUndo(panel: PanelKey) {
  if (toolType.value !== 'image' || !imageHistory.value || imageHistory.value.length === 0) {
    showMessage('info', '没有可撤销的操作')
    return
  }
  
  if (imageHistoryIndex.value <= 0) {
    showMessage('info', '没有可撤销的操作')
    return
  }
  
  imageHistoryIndex.value--
  const previousImage = imageHistory.value[imageHistoryIndex.value]
  if (previousImage) {
    state[panel] = previousImage
    showMessage('success', '已撤销')
    activeTool.value = `${panel}-undo`
  } else {
    showMessage('error', '撤销失败：历史记录无效')
  }
}

function handleImageRedo(panel: PanelKey) {
  if (toolType.value !== 'image' || !imageHistory.value || imageHistory.value.length === 0) {
    showMessage('info', '没有可重做的操作')
    return
  }
  
  if (imageHistoryIndex.value >= imageHistory.value.length - 1) {
    showMessage('info', '没有可重做的操作')
    return
  }
  
  imageHistoryIndex.value++
  const nextImage = imageHistory.value[imageHistoryIndex.value]
  if (nextImage) {
    state[panel] = nextImage
    showMessage('success', '已重做')
    activeTool.value = `${panel}-redo`
  } else {
    showMessage('error', '重做失败：历史记录无效')
  }
}

async function handleImageCompress(panel: PanelKey, options: { maxSizeMB: number; quality: number; maxWidthOrHeight: number }) {
  if (toolType.value !== 'image' || !state[panel]?.startsWith('data:image/')) {
    showMessage('error', '请先导入图片')
    return
  }
  try {
    busyPanel.value = panel
    ensureCurrentStateInHistory(panel)
    const compressed = await compressImage(state[panel], options)
    state[panel] = compressed
    saveImageToHistory(compressed)
    showMessage('success', '图片压缩成功')
    activeTool.value = `${panel}-compress`
  } catch (error) {
    const message = error instanceof Error ? error.message : '压缩失败'
    showMessage('error', message)
  } finally {
    busyPanel.value = null
  }
}

async function handleImageResize(panel: PanelKey, options: { width?: number; height?: number; maintainAspectRatio: boolean }) {
  if (toolType.value !== 'image' || !state[panel]?.startsWith('data:image/')) {
    showMessage('error', '请先导入图片')
    return
  }
  if (!options.width && !options.height) {
    showMessage('error', '请指定宽度或高度')
    return
  }
  try {
    busyPanel.value = panel
    ensureCurrentStateInHistory(panel)
    const resized = await resizeImage(state[panel], options)
    state[panel] = resized
    saveImageToHistory(resized)
    showMessage('success', '图片尺寸调整成功')
    activeTool.value = `${panel}-resize`
  } catch (error) {
    const message = error instanceof Error ? error.message : '调整尺寸失败'
    showMessage('error', message)
  } finally {
    busyPanel.value = null
  }
}

async function handleImageCrop(panel: PanelKey, options: { x: number; y: number; width: number; height: number }) {
  if (toolType.value !== 'image' || !state[panel]?.startsWith('data:image/')) {
    showMessage('error', '请先导入图片')
    return
  }
  if (!options.width || !options.height) {
    showMessage('error', '请设置裁剪区域')
    return
  }
  try {
    busyPanel.value = panel
    ensureCurrentStateInHistory(panel)
    const cropped = await cropImage(state[panel], options)
    state[panel] = cropped
    saveImageToHistory(cropped)
    showMessage('success', '图片裁剪成功')
    activeTool.value = `${panel}-crop`
  } catch (error) {
    const message = error instanceof Error ? error.message : '裁剪失败'
    showMessage('error', message)
  } finally {
    busyPanel.value = null
  }
}

async function handleImageRotate(panel: PanelKey, angle: number) {
  if (toolType.value !== 'image' || !state[panel]?.startsWith('data:image/')) {
    showMessage('error', '请先导入图片')
    return
  }
  try {
    busyPanel.value = panel
    ensureCurrentStateInHistory(panel)
    const rotated = await rotateImage(state[panel], angle)
    state[panel] = rotated
    saveImageToHistory(rotated)
    showMessage('success', '图片旋转成功')
    activeTool.value = `${panel}-rotate`
  } catch (error) {
    const message = error instanceof Error ? error.message : '旋转失败'
    showMessage('error', message)
  } finally {
    busyPanel.value = null
  }
}

async function handleImageFlip(panel: PanelKey, direction: FlipDirection) {
  if (toolType.value !== 'image' || !state[panel]?.startsWith('data:image/')) {
    showMessage('error', '请先导入图片')
    return
  }
  try {
    busyPanel.value = panel
    ensureCurrentStateInHistory(panel)
    const flipped = await flipImage(state[panel], direction)
    state[panel] = flipped
    saveImageToHistory(flipped)
    showMessage('success', '图片翻转成功')
    activeTool.value = `${panel}-flip`
  } catch (error) {
    const message = error instanceof Error ? error.message : '翻转失败'
    showMessage('error', message)
  } finally {
    busyPanel.value = null
  }
}

async function handleImageConvert(panel: PanelKey, format: ImageFormat) {
  if (toolType.value !== 'image' || !state[panel]?.startsWith('data:image/')) {
    showMessage('error', '请先导入图片')
    return
  }
  try {
    busyPanel.value = panel
    ensureCurrentStateInHistory(panel)
    
    if (format === ImageFormat.BASE64) {
      const base64 = await convertImageFormat(state[panel], format)
      state[panel] = base64
      showMessage('success', '已转换为 Base64 文本')
      activeTool.value = `${panel}-convert`
      return
    }
    
    const converted = await convertImageFormat(state[panel], format)
    state[panel] = converted
    saveImageToHistory(converted)
    showMessage('success', `图片已转换为 ${format.toUpperCase()}`)
    activeTool.value = `${panel}-convert`
  } catch (error) {
    const message = error instanceof Error ? error.message : '格式转换失败'
    showMessage('error', message)
  } finally {
    busyPanel.value = null
  }
}

async function handleImageFilter(panel: PanelKey, filter: FilterType) {
  if (toolType.value !== 'image' || !state[panel]?.startsWith('data:image/')) {
    showMessage('error', '请先导入图片')
    return
  }
  try {
    busyPanel.value = panel
    ensureCurrentStateInHistory(panel)
    const filtered = await applyFilter(state[panel], filter)
    state[panel] = filtered
    saveImageToHistory(filtered)
    showMessage('success', '滤镜应用成功')
    activeTool.value = `${panel}-filter`
  } catch (error) {
    const message = error instanceof Error ? error.message : '应用滤镜失败'
    showMessage('error', message)
  } finally {
    busyPanel.value = null
  }
}

async function handleImageAdjust(panel: PanelKey, options: { brightness: number; contrast: number; saturation: number }) {
  if (toolType.value !== 'image' || !state[panel]?.startsWith('data:image/')) {
    showMessage('error', '请先导入图片')
    return
  }
  try {
    busyPanel.value = panel
    ensureCurrentStateInHistory(panel)
    const adjusted = await adjustImage(state[panel], options)
    state[panel] = adjusted
    saveImageToHistory(adjusted)
    showMessage('success', '图片调整成功')
    activeTool.value = `${panel}-adjust`
  } catch (error) {
    const message = error instanceof Error ? error.message : '调整失败'
    showMessage('error', message)
  } finally {
    busyPanel.value = null
  }
}

function handleImageDownload(panel: PanelKey) {
  if (toolType.value !== 'image' || !state[panel]?.startsWith('data:image/')) {
    showMessage('error', '请先导入图片')
    return
  }
  try {
    const link = document.createElement('a')
    link.href = state[panel]
    const match = state[panel].match(/data:image\/([^;]+);/)
    const format = match ? match[1] : 'png'
    link.download = `image-${Date.now()}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showMessage('success', '图片下载成功')
    activeTool.value = `${panel}-download`
  } catch (error) {
    const message = error instanceof Error ? error.message : '下载失败'
    showMessage('error', message)
  }
}

function handleImageInfo(info: { width: number; height: number } | null) {
  currentImageInfo.value = info
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
      const imageData = String(reader.result ?? '')
      state[panel] = imageData
      // 重置历史记录并添加初始图片
      initImageHistory(imageData)
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

function handleAction(payload: ToolActionPayload) {
  switch (payload.action) {
    case 'triggerImport':
      if (payload.panel) triggerImport(payload.panel)
      break
    case 'save':
      if (payload.panel) handleSave(payload.panel)
      break
    case 'export':
      if (payload.panel) handleExport(payload.panel)
      break
    case 'format':
      if (payload.panel) handleFormat(payload.panel)
      break
    case 'minify':
      if (payload.panel) handleMinify(payload.panel)
      break
    case 'repair':
      if (payload.panel) handleRepair(payload.panel)
      break
    case 'clear':
      if (payload.panel) handleClear(payload.panel)
      break
    case 'toggleAutoFormat':
      handleToggleAutoFormat()
      break
    case 'toggleDeepParse':
      handleToggleDeepParse()
      break
    case 'case':
      if (payload.panel && 'params' in payload && payload.params) {
        handleTextCase(payload.panel, payload.params.caseType as CaseType)
      }
      break
    case 'encode':
      if (payload.panel && 'params' in payload && payload.params) {
        handleTextEncode(payload.panel, payload.params.encodeType as EncodeType)
      }
      break
    case 'decode':
      if (payload.panel && 'params' in payload && payload.params) {
        handleTextDecode(payload.panel, payload.params.decodeType as EncodeType)
      }
      break
    case 'trim':
      if (payload.panel && 'params' in payload && payload.params) {
        handleTextTrim(payload.panel, payload.params.trimType as TrimOption)
      }
      break
    case 'stats':
      if (payload.panel) handleTextStats(payload.panel)
      break
    case 'compress':
      if (payload.panel && 'params' in payload && payload.params) {
        handleImageCompress(payload.panel, payload.params)
      }
      break
    case 'resize':
      if (payload.panel && 'params' in payload && payload.params) {
        handleImageResize(payload.panel, payload.params)
      }
      break
    case 'crop':
      if (payload.panel && 'params' in payload && payload.params) {
        handleImageCrop(payload.panel, payload.params)
      }
      break
    case 'rotate':
      if (payload.panel && 'params' in payload && payload.params) {
        handleImageRotate(payload.panel, payload.params.angle)
      }
      break
    case 'flip':
      if (payload.panel && 'params' in payload && payload.params) {
        handleImageFlip(payload.panel, payload.params.direction as FlipDirection)
      }
      break
    case 'convert':
      if (payload.panel && 'params' in payload && payload.params) {
        handleImageConvert(payload.panel, payload.params.format as ImageFormat)
      }
      break
    case 'filter':
      if (payload.panel && 'params' in payload && payload.params) {
        handleImageFilter(payload.panel, payload.params.filter as FilterType)
      }
      break
    case 'adjust':
      if (payload.panel && 'params' in payload && payload.params) {
        handleImageAdjust(payload.panel, payload.params)
      }
      break
    case 'download':
      if (payload.panel) handleImageDownload(payload.panel)
      break
    case 'undo':
      if (payload.panel) handleImageUndo(payload.panel)
      break
    case 'redo':
      if (payload.panel) handleImageRedo(payload.panel)
      break
  }
}

/**
 * 深度解析 JSON 对象，递归解析所有字符串值中的 JSON
 */
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
</script>

<template>
  <div class="app">
    <TopBar
      :tool-type="toolType"
      :mode="mode"
      :active-tool="activeTool"
      :auto-format="autoFormat"
      :deep-parse="deepParse"
      :image-info="currentImageInfo"
      :can-undo="toolType === 'image' && imageHistory && imageHistoryIndex > 0"
      :can-redo="toolType === 'image' && imageHistory && imageHistoryIndex < imageHistory.length - 1"
      @action="handleAction"
      @update:tool-type="toolType = $event"
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

        <ImageWorkspace
          v-else-if="toolType === 'image'"
          ref="imageWorkspaceRef"
          :source="state.source"
          :preview-content="previewContent"
          @update:source="state.source = $event"
          @image-info="handleImageInfo"
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

