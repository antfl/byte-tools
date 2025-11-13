<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { createDefaultOptions } from 'monaco-editor-vue3'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import { jsonrepair } from 'jsonrepair'
import { create as createDiffer } from 'jsondiffpatch'
import TopBar from '../components/workspace/TopBar.vue'
import SideToolbar from '../components/workspace/SideToolbar.vue'
import FormatWorkspace from '../components/workspace/FormatWorkspace.vue'
import DiffWorkspace from '../components/workspace/DiffWorkspace.vue'
import StatusBar from '../components/workspace/StatusBar.vue'
import StorageDialog from '../components/modals/StorageDialog.vue'
import ImportOptionsModal from '../components/modals/ImportOptionsModal.vue'
import CachePickerModal from '../components/modals/CachePickerModal.vue'
import { deleteSnippet, getSnippet, listSnippets, saveSnippet } from '../services/storageStore'
import type { StoredSnippet } from '../services/storageStore'
import type { PanelKey, ToolAction, MessageLevel, DiffState } from '../types/jsonTools'
import { useTheme } from '../composables/useTheme'
import { parseJsonError } from '../utils/format'

const { theme, themeToggleTitle, isDarkTheme, toggleTheme } = useTheme()

const editorTheme = computed(() => `byte-json-${theme.value}`)
const differ = createDiffer({
  arrays: { detectMove: false, includeValueOnMove: false }
})

// 从 localStorage 恢复左侧 JSON 字符串
const getStoredSource = (): string => {
  try {
    const stored = localStorage.getItem('byte-json-source')
    if (stored) {
      return stored
    }
  } catch (error) {
    console.warn('无法读取 localStorage:', error)
  }
  return `{
  "name": "Byte JSON",
  "description": "一个轻量的 JSON 工具"
}`
}

const state = reactive({
  source: getStoredSource(),
  target: `{
  "name": "Byte JSON",
  "description": "一个轻量的 JSON 工具",
  "features": ["对比", "格式化", "修复", "导入导出"]
}`
})

const mode = ref<'format' | 'diff'>('format')
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

const baseEditorOptions = createDefaultOptions('json')
Object.assign(baseEditorOptions, {
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
})

const sourceEditorOptions = computed(() => ({
  ...baseEditorOptions,
  readOnly: false,
  formatOnPaste: autoFormat.value,
  formatOnType: autoFormat.value
}))

const previewEditorOptions = computed(() => ({
  ...baseEditorOptions,
  readOnly: true
}))

const diffEditorOptions: MonacoEditorNS.IStandaloneDiffEditorConstructionOptions = {
  ...baseEditorOptions,
  automaticLayout: true,
  enableSplitViewResizing: true,
  renderSideBySide: true,
  originalEditable: true,
  diffAlgorithm: 'advanced',
  readOnly: false
}

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
  monaco.editor.defineTheme('byte-json-dark', {
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

  monaco.editor.defineTheme('byte-json-light', {
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

  monaco.editor.setTheme(`byte-json-${theme.value}`)

  watch(
    theme,
    (modeValue) => {
      monaco.editor.setTheme(`byte-json-${modeValue}`)
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
  () => state.source,
  (source) => {
    try {
      localStorage.setItem('byte-json-source', source)
    } catch (error) {
      console.warn('无法保存到 localStorage:', error)
    }
  }
)

watch(
  [() => mode.value, () => state.source],
  ([currentMode, source]) => {
    if (currentMode === 'diff') {
      return
    }
    try {
      const parsed = JSON.parse(source)
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
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
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
    const blob = new Blob([state[panel]], { type: 'application/json;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = panel === 'source' ? 'source.json' : 'target.json'
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
</script>

<template>
  <div class="app">
    <TopBar
      :mode="mode"
      :active-tool="activeTool"
      :auto-format="autoFormat"
      @trigger-import="triggerImport"
      @save="handleSave"
      @export="handleExport"
      @format="handleFormat"
      @minify="handleMinify"
      @repair="handleRepair"
      @clear="handleClear"
      @toggle-auto-format="handleToggleAutoFormat"
    />

    <div class="main-layout">
      <SideToolbar
        :mode="mode"
        :theme-toggle-title="themeToggleTitle"
        :is-dark-theme="isDarkTheme"
        @update:mode="mode = $event"
        @toggleTheme="toggleTheme"
        @open-cache-manager="handleOpenCacheManager"
        @open-about="handleOpenAbout"
      />

      <section class="workspace" :class="{ 'is-diff': mode === 'diff' }">
        <FormatWorkspace
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
      accept=".json,application/json,.txt"
      class="hidden-input"
      @change="handleImport('source', $event)"
    />
    <input
      ref="targetInput"
      type="file"
      accept=".json,application/json,.txt"
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

