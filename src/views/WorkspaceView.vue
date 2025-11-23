<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { createDefaultOptions } from 'monaco-editor-vue3'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import * as monaco from 'monaco-editor'
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
import { useWorkspaceStore } from '@/stores/workspace'
import { useTheme } from '../composables/useTheme'
import { useJsonOperations } from '../composables/useJsonOperations'
import { useActionHandler } from '../composables/useActionHandler'
import type { PanelKey } from '../types/jsonTools'

const { effectiveTheme } = useTheme()
const store = useWorkspaceStore()
const jsonOps = useJsonOperations()
const { handleAction, fileOps, cacheManager } = useActionHandler()

const editorTheme = computed(() => `byte-tools-${effectiveTheme.value}`)
const diffInstance = ref<MonacoEditorNS.IStandaloneDiffEditor | null>(null)
const sourceEditorInstance = ref<MonacoEditorNS.IStandaloneCodeEditor | null>(null)
const imageWorkspaceRef = ref<InstanceType<typeof ImageWorkspace> | null>(null)

const importOptions = ref({
  visible: false,
  panel: 'source' as PanelKey
})

function getEditorLanguage(tool: typeof store.toolType): string {
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
  const options = createDefaultOptions(getEditorLanguage(store.toolType))
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
    wordWrap: 'on' as const,
    padding: { top: 16, bottom: 16 },
    folding: true,
    foldingStrategy: 'indentation' as const,
    showFoldingControls: 'always' as const,
    unfoldOnClickAfterEndOfLine: true
  }
})

const sourceEditorOptions = computed(() => ({
  ...baseEditorOptions.value,
  readOnly: false,
  formatOnPaste: store.toolType === 'json' ? store.autoFormat : false,
  formatOnType: store.toolType === 'json' ? store.autoFormat : false
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

// Monaco 主题配置
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
  monaco.editor.setTheme(`byte-tools-${effectiveTheme.value}`)
})

watch(
  () => store.mode,
  (currentMode) => {
    if (currentMode === 'format') {
      diffInstance.value = null
    } else if (store.previewIsValid) {
      store.setTarget(store.previewContent)
    }
  }
)

// 更新编辑器实例的自动格式化选项
watch(
  () => store.autoFormat,
  (autoFormat) => {
    if (sourceEditorInstance.value) {
      sourceEditorInstance.value.updateOptions({
        formatOnPaste: autoFormat,
        formatOnType: autoFormat
      })
    }
  }
)

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
      store.setSource(originalModel.getValue())
    })
  }
  if (modifiedModel) {
    modifiedModel.onDidChangeContent(() => {
      store.setTarget(modifiedModel.getValue())
    })
  }
}

function handleOpenAbout() {
  window.open('/product', '_blank')
}

function triggerImport(panel: PanelKey) {
  importOptions.value.panel = panel
  importOptions.value.visible = true
}

function startFileImport(panel: PanelKey) {
  const input = panel === 'source' ? fileOps.sourceInput.value : fileOps.targetInput.value
  input?.click()
  store.setActiveTool(`${panel}-import`)
  importOptions.value.visible = false
}

function handleImageInfo(info: { width: number; height: number } | null) {
  store.setCurrentImageInfo(info)
}

// 处理导入操作
function handleImportAction(panel: PanelKey) {
  triggerImport(panel)
}

// 包装 handleAction 以处理导入
function handleActionWrapper(payload: Parameters<typeof handleAction>[0]) {
  if (payload.action === 'triggerImport' && payload.panel) {
    handleImportAction(payload.panel)
    return
  }
  handleAction(payload)
}
</script>

<template>
  <div class="app">
    <TopBar
      :tool-type="store.toolType"
      :mode="store.mode"
      :active-tool="store.activeTool"
      :auto-format="store.autoFormat"
      :deep-parse="store.deepParse"
      :image-info="store.currentImageInfo"
      :can-undo="store.canUndo"
      :can-redo="store.canRedo"
      @action="handleActionWrapper"
      @update:tool-type="store.setToolType"
    />

    <div class="main-layout">
      <SideToolbar
        :tool-type="store.toolType"
        :mode="store.mode"
        @update:mode="store.setMode"
        @open-cache-manager="cacheManager.openCachePicker('source')"
        @open-about="handleOpenAbout"
      />

      <section class="workspace" :class="{ 'is-diff': store.mode === 'diff' && store.toolType === 'json' }">
        <template v-if="store.toolType === 'json'">
          <JsonWorkspace
            v-if="store.mode === 'format'"
            :source="store.source"
            :preview-content="store.previewContent"
            :editor-theme="editorTheme"
            :source-editor-options="sourceEditorOptions"
            :preview-editor-options="previewEditorOptions"
            @update:source="store.setSource"
            @cursor-change="store.setCursorPosition"
            @editor-mounted="sourceEditorInstance = $event"
          />
          <DiffWorkspace
            v-else
            :source="store.source"
            :target="store.target"
            :editor-theme="editorTheme"
            :diff-editor-options="diffEditorOptions"
            @mount="handleDiffMount"
            @update:target="store.setTarget"
            @cursor-change="store.setCursorPosition"
          />
        </template>

        <TextWorkspace
          v-else-if="store.toolType === 'text'"
          :source="store.source"
          :preview-content="store.previewContent"
          :editor-theme="editorTheme"
          :source-editor-options="sourceEditorOptions"
          :preview-editor-options="previewEditorOptions"
          @update:source="store.setSource"
          @cursor-change="store.setCursorPosition"
          @editor-mounted="sourceEditorInstance = $event"
        />

        <ImageWorkspace
          v-else-if="store.toolType === 'image'"
          ref="imageWorkspaceRef"
          :source="store.source"
          :preview-content="store.previewContent"
          @update:source="store.setSource"
          @image-info="handleImageInfo"
        />
      </section>
    </div>

    <StatusBar
      :diff-state="jsonOps.diffState.value"
      :busy-panel="store.busyPanel"
      :message="store.message"
      :cursor-position="store.cursorPosition"
      :error-position="store.mode === 'format' && !store.previewIsValid ? store.errorPosition : null"
    />

    <input
      ref="fileOps.sourceInput"
      type="file"
      :accept="store.toolType === 'image' ? 'image/*' : store.toolType === 'json' ? '.json,application/json' : '*/*'"
      class="hidden-input"
      @change="fileOps.handleImport('source', $event)"
    />
    <input
      ref="fileOps.targetInput"
      type="file"
      :accept="store.toolType === 'image' ? 'image/*' : store.toolType === 'json' ? '.json,application/json' : '*/*'"
      class="hidden-input"
      @change="fileOps.handleImport('target', $event)"
    />

    <StorageDialog
      v-if="cacheManager.storageDialog.value.visible"
      :visible="cacheManager.storageDialog.value.visible"
      :panel="cacheManager.storageDialog.value.panel"
      :initial-title="cacheManager.storageDialog.value.title"
      :size="cacheManager.storageDialog.value.size"
      :content="cacheManager.storageDialog.value.panel === 'source' ? store.source : store.target"
      :loading="cacheManager.storageDialog.value.loading"
      @cancel="cacheManager.cancelSave"
      @confirm="cacheManager.confirmSave"
    />

    <ImportOptionsModal
      v-if="importOptions.visible"
      :visible="importOptions.visible"
      :panel="importOptions.panel"
      @close="importOptions.visible = false"
      @select-file="startFileImport(importOptions.panel)"
      @select-cache="cacheManager.openCachePicker(importOptions.panel)"
    />

    <CachePickerModal
      v-if="cacheManager.cachePicker.value.visible"
      :visible="cacheManager.cachePicker.value.visible"
      :panel="cacheManager.cachePicker.value.panel"
      :loading="cacheManager.cachePicker.value.loading"
      :items="cacheManager.cachePicker.value.items"
      :selected-id="cacheManager.cachePicker.value.selectedId"
      @close="cacheManager.closeCachePicker"
      @select="cacheManager.selectCacheSnippet"
      @delete="cacheManager.deleteCacheSnippet"
      @copy="cacheManager.copyCacheSnippet"
      @preview="cacheManager.previewCacheSnippet"
      @refresh="cacheManager.refreshCacheItems()"
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
