<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { createDefaultOptions } from 'monaco-editor-vue3'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import { jsonrepair } from 'jsonrepair'
import { create as createDiffer } from 'jsondiffpatch'
import TopBar from './components/TopBar.vue'
import SideToolbar from './components/SideToolbar.vue'
import FormatWorkspace from './components/FormatWorkspace.vue'
import DiffWorkspace from './components/DiffWorkspace.vue'
import StatusBar from './components/StatusBar.vue'
import type {
  PanelKey,
  ToolAction,
  MessageLevel,
  ThemeMode,
  DiffState
} from './types/jsonTools'

const THEME_STORAGE_KEY = 'byte-json-theme'
const theme = ref<ThemeMode>('dark')
const editorTheme = computed(() => `byte-json-${theme.value}`)
const differ = createDiffer({
  arrays: { detectMove: false, includeValueOnMove: false }
})

const state = reactive({
  source: `{
  "name": "Byte JSON",
  "description": "一个轻量的 JSON 工具"
}`,
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
let messageTimer: number | null = null

const sourceInput = ref<HTMLInputElement | null>(null)
const targetInput = ref<HTMLInputElement | null>(null)
const previewContent = ref('')
const previewIsValid = ref(true)

const baseEditorOptions = createDefaultOptions('json')
Object.assign(baseEditorOptions, {
  automaticLayout: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  formatOnPaste: true,
  formatOnType: true,
  renderLineHighlight: 'all',
  fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
  fontSize: 14,
  lineHeight: 22,
  wordWrap: 'on',
  padding: { top: 16, bottom: 16 }
})

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

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode
  monaco.editor.setTheme(`byte-json-${mode}`)
}

const themeToggleTitle = computed(() =>
  theme.value === 'dark' ? '切换到浅色主题' : '切换到暗色主题'
)

const isDarkTheme = computed(() => theme.value === 'dark')

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
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

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'dark' || storedTheme === 'light') {
    theme.value = storedTheme
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    theme.value = 'light'
  }

  applyTheme(theme.value)
})

watch(theme, (mode) => {
  applyTheme(mode)
  window.localStorage.setItem(THEME_STORAGE_KEY, mode)
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
  [() => mode.value, () => state.source],
  ([currentMode, source]) => {
    if (currentMode === 'diff') {
      return
    }
    try {
      const parsed = JSON.parse(source)
      previewContent.value = JSON.stringify(parsed, null, 2)
      previewIsValid.value = true
    } catch (error) {
      previewContent.value = '// 无法解析 JSON，请检查输入'
      previewIsValid.value = false
    }
  },
  { immediate: true }
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

function triggerImport(panel: PanelKey) {
  const input = panel === 'source' ? sourceInput.value : targetInput.value
  input?.click()
  activeTool.value = `${panel}-import`
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
  const originalModel = editor.getOriginalEditor().getModel()
  const modifiedModel = editor.getModifiedEditor().getModel()

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
</script>

<template>
  <div class="app">
    <TopBar
      :mode="mode"
      :active-tool="activeTool"
      @trigger-import="triggerImport"
      @export="handleExport"
      @format="handleFormat"
      @minify="handleMinify"
      @repair="handleRepair"
      @clear="handleClear"
    />

    <div class="main-layout">
      <SideToolbar
        :mode="mode"
        :theme-toggle-title="themeToggleTitle"
        :is-dark-theme="isDarkTheme"
        @update:mode="mode = $event"
        @toggleTheme="toggleTheme"
      />

      <section class="workspace" :class="{ 'is-diff': mode === 'diff' }">
        <FormatWorkspace
          v-if="mode === 'format'"
          :source="state.source"
          :preview-content="previewContent"
          :editor-theme="editorTheme"
          :preview-editor-options="previewEditorOptions"
          @update:source="state.source = $event"
        />
        <DiffWorkspace
          v-else
          :source="state.source"
          :target="state.target"
          :editor-theme="editorTheme"
          :diff-editor-options="diffEditorOptions"
          @mount="handleDiffMount"
          @update:target="state.target = $event"
        />
      </section>
    </div>

    <StatusBar
      :diff-state="diffState"
      :busy-panel="busyPanel"
      :message="message"
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
  </div>
</template>

<style scoped>
.app {
  --sidebar-width: 40px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(160deg, var(--app-gradient-start) 0%, var(--app-gradient-end) 100%);
  color: var(--text-primary);
  overflow: hidden;
}

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
  padding: 0;
  box-sizing: border-box;
  min-height: 0;
  overflow: hidden;
}

.workspace.is-diff {
  grid-template-columns: 1fr;
}

.hidden-input {
  display: none;
}

@media (max-width: 1280px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .main-layout {
    flex-direction: column;
  }
}
</style>