<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import CodeEditor, { DiffEditor, createDefaultOptions } from 'monaco-editor-vue3'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import { jsonrepair } from 'jsonrepair'
import { create as createDiffer } from 'jsondiffpatch'
import IconButton from './components/IconButton.vue'
import Logo from '../src/assets/logo.svg'

type PanelKey = 'source' | 'target'
type MessageLevel = 'success' | 'error' | 'info'

type ThemeMode = 'dark' | 'light'
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
type ToolAction = `${PanelKey}-${'import' | 'export' | 'format' | 'minify' | 'repair' | 'clear'}`
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
      { token: '', background: '0F172A', foreground: 'E2E8F0' },
      { token: 'string.key.json', foreground: '60A5FA' },
      { token: 'string.value.json', foreground: 'FBBF24' },
      { token: 'number', foreground: 'F97316' },
      { token: 'keyword.json', foreground: 'A78BFA' },
      { token: 'delimiter', foreground: '94A3B8' }
    ],
    colors: {
      'editor.background': '#0f172a',
      'editor.foreground': '#e2e8f0',
      'editorCursor.foreground': '#2b6efa',
      'editor.lineHighlightBackground': '#1e293b',
      'editorLineNumber.foreground': '#475569',
      'editorLineNumber.activeForeground': '#e2e8f0',
      'editor.selectionBackground': '#1d4ed81f',
      'editor.inactiveSelectionBackground': '#1e293b40',
      'editorWidget.background': '#111827',
      'editorSuggestWidget.background': '#111827',
      'scrollbarSlider.background': '#33415599',
      'scrollbarSlider.hoverBackground': '#475569aa',
      'diffEditor.insertedTextBackground': '#16653433',
      'diffEditor.removedTextBackground': '#7f1d1d33',
      'panel.background': '#0f172a'
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

const diffState = computed(() => {
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

function handleDiffMount(editor: MonacoEditorNS.IStandaloneDiffEditor) {
  diffInstance.value = editor
  const originalModel = editor.getOriginalEditor().getModel()
  const modifiedModel = editor.getModifiedEditor().getModel()

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
    <header class="top-bar">
        <img class="logo" :src="Logo" alt="">
      <div class="top-bar-right">
        <button
          type="button"
          class="theme-toggle"
          :title="themeToggleTitle"
          :aria-label="themeToggleTitle"
          @click="toggleTheme"
        >
          <svg v-if="isDarkTheme" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              d="M20 15.5A8 8 0 1 1 12.5 4c-.33.75-.5 1.57-.5 2.41A6.09 6.09 0 0 0 18.09 12c.84 0 1.66-.17 2.41-.5z"
            />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="4.5" />
            <line x1="12" y1="2.5" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="21.5" />
            <line x1="4.5" y1="12" x2="7" y2="12" />
            <line x1="17" y1="12" x2="19.5" y2="12" />
            <line x1="5.8" y1="5.8" x2="7.6" y2="7.6" />
            <line x1="16.4" y1="16.4" x2="18.2" y2="18.2" />
            <line x1="5.8" y1="18.2" x2="7.6" y2="16.4" />
            <line x1="16.4" y1="7.6" x2="18.2" y2="5.8" />
          </svg>
        </button>
      </div>
    </header>

    <div class="main-layout">
      <aside class="side-toolbar">
        <div class="toolbar-section toolbar-section--mode">
          <IconButton
            icon="format"
            :variant="mode === 'format' ? 'primary' : 'ghost'"
            :active="mode === 'format'"
            title="JSON 预览模式"
            @click="mode = 'format'"
          />
          <IconButton
            icon="diff"
            :variant="mode === 'diff' ? 'primary' : 'ghost'"
            :active="mode === 'diff'"
            title="对比"
            @click="mode = 'diff'"
          />
        </div>
      </aside>

      <section class="workspace" :class="{ 'is-diff': mode === 'diff' }">
        <template v-if="mode === 'format'">
          <div class="editor-pane editor-pane--source text-input-pane">
            <textarea v-model="state.source" placeholder="在此粘贴或输入 JSON 字符串"></textarea>
          </div>
          <div class="editor-pane editor-pane--target">
            <div class="pane-header">
              <div class="pane-actions">
                <IconButton
                  icon="import"
                  title="导入"
                  :active="activeTool === 'source-import'"
                  @click="triggerImport('source')"
                />
                <IconButton
                  icon="export"
                  title="导出"
                  :active="activeTool === 'source-export'"
                  @click="handleExport('source')"
                />
                <IconButton
                  icon="format"
                  title="格式化"
                  :active="activeTool === 'source-format'"
                  @click="handleFormat('source')"
                />
                <IconButton
                  icon="minify"
                  title="压缩"
                  :active="activeTool === 'source-minify'"
                  @click="handleMinify('source')"
                />
                <IconButton
                  icon="repair"
                  title="尝试修复"
                  :active="activeTool === 'source-repair'"
                  @click="handleRepair('source')"
                />
                <IconButton
                  icon="clear"
                  title="清空"
                  :active="activeTool === 'source-clear'"
                  @click="handleClear('source')"
                />
              </div>
            </div>
            <CodeEditor
              v-model:value="previewContent"
              :theme="editorTheme"
              language="json"
              class="pane-body"
              :options="previewEditorOptions"
            />
          </div>
        </template>

        <div v-else-if="mode === 'diff'" class="editor-pane editor-pane--diff">
          <div class="pane-header pane-header--dual">
            <div class="pane-group">
              <div class="pane-actions">
                <IconButton
                  icon="import"
                  title="导入"
                  :active="activeTool === 'source-import'"
                  @click="triggerImport('source')"
                />
                <IconButton
                  icon="export"
                  title="导出"
                  :active="activeTool === 'source-export'"
                  @click="handleExport('source')"
                />
                <IconButton
                  icon="format"
                  title="格式化"
                  :active="activeTool === 'source-format'"
                  @click="handleFormat('source')"
                />
                <IconButton
                  icon="minify"
                  title="压缩"
                  :active="activeTool === 'source-minify'"
                  @click="handleMinify('source')"
                />
                <IconButton
                  icon="repair"
                  title="尝试修复"
                  :active="activeTool === 'source-repair'"
                  @click="handleRepair('source')"
                />
                <IconButton
                  icon="clear"
                  title="清空"
                  :active="activeTool === 'source-clear'"
                  @click="handleClear('source')"
                />
              </div>
            </div>
            <div class="pane-group">
              <div class="pane-actions">
                <IconButton
                  icon="import"
                  title="导入"
                  :active="activeTool === 'target-import'"
                  @click="triggerImport('target')"
                />
                <IconButton
                  icon="export"
                  title="导出"
                  :active="activeTool === 'target-export'"
                  @click="handleExport('target')"
                />
                <IconButton
                  icon="format"
                  title="格式化"
                  :active="activeTool === 'target-format'"
                  @click="handleFormat('target')"
                />
                <IconButton
                  icon="minify"
                  title="压缩"
                  :active="activeTool === 'target-minify'"
                  @click="handleMinify('target')"
                />
                <IconButton
                  icon="repair"
                  title="尝试修复"
                  :active="activeTool === 'target-repair'"
                  @click="handleRepair('target')"
                />
                <IconButton
                  icon="clear"
                  title="清空"
                  :active="activeTool === 'target-clear'"
                  @click="handleClear('target')"
                />
              </div>
            </div>
          </div>
          <DiffEditor
            :original="state.source"
            :value="state.target"
            :theme="editorTheme"
            language="json"
            class="pane-body diff-body"
            :options="diffEditorOptions"
            @editorDidMount="handleDiffMount"
            @update:value="state.target = $event"
          />
        </div>
      </section>
    </div>

    <footer class="status-bar">
      <div class="status-left">
        <span class="dot" :class="diffState.ok ? (diffState.hasDiff ? 'warn' : 'ok') : 'error'" />
        <span>{{ diffState.message }}</span>
      </div>
      <div class="status-right">
        <span v-if="busyPanel" class="loading">处理中...</span>
        <span v-else-if="message" :class="['message', message.level]">{{ message.text }}</span>
        <span v-else aria-hidden="true"></span>
      </div>
    </footer>

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
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(160deg, var(--app-gradient-start) 0%, var(--app-gradient-end) 100%);
  color: var(--text-primary);
  overflow: hidden;
}

.top-bar {
  height: 40px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface-secondary);
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--border-button);
  background: var(--surface-card);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-strong);
}

.theme-toggle svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.theme-toggle:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
  box-shadow: var(--shadow-accent-medium);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
}


.logo {
  width: 20px;
  height: 20px;
}

.main-layout {
  flex: 1;
  display: flex;
  min-height: 0;
}

.side-toolbar {
  width: 40px;
  padding: 6px 4px;
  background: var(--surface-toolbar);
  border-right: 1px solid var(--border-subtle);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  box-shadow: var(--shadow-toolbar);
}

.toolbar-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.side-toolbar :deep(.icon-button) {
  width: 28px;
  height: 28px;
  border-radius: 10px;
}

.side-toolbar :deep(.icon-button:not(:last-child)) {
  margin-bottom: 4px;
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

.editor-pane {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-primary);
  border-radius: 0;
}

.editor-pane:not(.editor-pane--source) {
  border: 1px solid var(--border-strong);
  box-shadow: none;
}

.text-input-pane {
  position: relative;
  border: 1px solid var(--border-strong);
}

.text-input-pane textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--text-primary);
  font-family: '"Cascadia Code", "Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace';
  font-size: 14px;
  line-height: 22px;
  padding: 16px;
  box-sizing: border-box;
}

.text-input-pane textarea::placeholder {
  color: var(--text-muted);
}

.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--surface-secondary);
  border-bottom: 1px solid var(--border-subtle);
  gap: 12px;
}

.pane-header--dual {
  gap: 24px;
}

.pane-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.pane-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pane-body {
  flex: 1;
  min-height: 0;
  width: 100%;
}

.pane-body :deep(.monaco-editor),
.pane-body :deep(.monaco-editor-vue3) {
  height: 100%;
}

.diff-body {
  border: none;
}

.status-bar {
  height: 30px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-status);
  flex-shrink: 0;
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 8px;
  background-color: var(--status-neutral);
  box-shadow: var(--status-neutral-shadow);
}

.dot.ok {
  background-color: var(--status-ok);
  box-shadow: var(--status-ok-shadow);
}

.dot.warn {
  background-color: var(--status-warn);
  box-shadow: var(--status-warn-shadow);
}

.dot.error {
  background-color: var(--status-error);
  box-shadow: var(--status-error-shadow);
}

.loading {
  color: var(--color-brand);
}

.message.success {
  color: #22c55e;
}

.message.error {
  color: #ef4444;
}

.message.info {
  color: var(--color-brand);
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

  .side-toolbar {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    gap: 12px;
    padding: 4px 8px;
    border-right: none;
    border-bottom: 1px solid var(--border-subtle);
    box-shadow: var(--shadow-toolbar-mobile);
    height: 40px;
  }

  .toolbar-section {
    flex-direction: row;
    gap: 8px;
    justify-content: center;
  }

  .toolbar-divider {
    width: 1px;
    height: 44px;
    background: linear-gradient(180deg, transparent, var(--border-subtle), transparent);
  }

  .section-label {
    writing-mode: initial;
    transform: none;
    letter-spacing: 0.16em;
    margin-right: 6px;
  }

  .side-toolbar :deep(.icon-button) {
    width: 28px;
    height: 28px;
  }

  .side-toolbar :deep(.icon-button:not(:last-child)) {
    margin-bottom: 0;
  }
}
</style>