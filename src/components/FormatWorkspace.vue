<script setup lang="ts">
import { onUnmounted } from 'vue'
import CodeEditor from 'monaco-editor-vue3'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import type { IDisposable } from 'monaco-editor'

defineProps<{
  source: string
  previewContent: string
  editorTheme: string
  sourceEditorOptions: Record<string, unknown>
  previewEditorOptions: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'update:source', value: string): void
  (e: 'cursor-change', position: { line: number; column: number } | null): void
  (e: 'editor-mounted', editor: MonacoEditorNS.IStandaloneCodeEditor): void
}>()

let sourceCursorChangeDisposable: IDisposable | null = null
let previewCursorChangeDisposable: IDisposable | null = null
let sourceFocusDisposable: IDisposable | null = null
let previewFocusDisposable: IDisposable | null = null

function updateCursorPosition(editor: MonacoEditorNS.IStandaloneCodeEditor) {
  const position = editor.getPosition()
  if (position) {
    emit('cursor-change', {
      line: position.lineNumber,
      column: position.column
    })
  } else {
    emit('cursor-change', null)
  }
}

function handleSourceEditorMount(editor: MonacoEditorNS.IStandaloneCodeEditor) {
  emit('editor-mounted', editor)
  
  // 监听源编辑器焦点变化
  sourceFocusDisposable = editor.onDidFocusEditorWidget(() => {
    // 当源编辑器获得焦点时，监听其光标位置变化
    if (sourceCursorChangeDisposable) {
      sourceCursorChangeDisposable.dispose()
    }
    if (previewCursorChangeDisposable) {
      previewCursorChangeDisposable.dispose()
      previewCursorChangeDisposable = null
    }
    sourceCursorChangeDisposable = editor.onDidChangeCursorPosition(() => {
      updateCursorPosition(editor)
    })
    updateCursorPosition(editor)
  })
  
  // 初始化：监听源编辑器光标位置变化（如果它当前有焦点）
  sourceCursorChangeDisposable = editor.onDidChangeCursorPosition(() => {
    // 只有当源编辑器有焦点时才更新
    if (editor.hasTextFocus()) {
      updateCursorPosition(editor)
    }
  })
  
  // 初始化光标位置
  if (editor.hasTextFocus()) {
    updateCursorPosition(editor)
  }
}

function handlePreviewEditorMount(editor: MonacoEditorNS.IStandaloneCodeEditor) {
  
  // 监听预览编辑器焦点变化
  previewFocusDisposable = editor.onDidFocusEditorWidget(() => {
    // 当预览编辑器获得焦点时，监听其光标位置变化
    if (previewCursorChangeDisposable) {
      previewCursorChangeDisposable.dispose()
    }
    if (sourceCursorChangeDisposable) {
      sourceCursorChangeDisposable.dispose()
      sourceCursorChangeDisposable = null
    }
    previewCursorChangeDisposable = editor.onDidChangeCursorPosition(() => {
      updateCursorPosition(editor)
    })
    updateCursorPosition(editor)
  })
  
  // 初始化：监听预览编辑器光标位置变化（如果它当前有焦点）
  previewCursorChangeDisposable = editor.onDidChangeCursorPosition(() => {
    // 只有当预览编辑器有焦点时才更新
    if (editor.hasTextFocus()) {
      updateCursorPosition(editor)
    }
  })
  
  // 初始化光标位置
  if (editor.hasTextFocus()) {
    updateCursorPosition(editor)
  }
}

onUnmounted(() => {
  if (sourceCursorChangeDisposable) {
    sourceCursorChangeDisposable.dispose()
    sourceCursorChangeDisposable = null
  }
  if (previewCursorChangeDisposable) {
    previewCursorChangeDisposable.dispose()
    previewCursorChangeDisposable = null
  }
  if (sourceFocusDisposable) {
    sourceFocusDisposable.dispose()
    sourceFocusDisposable = null
  }
  if (previewFocusDisposable) {
    previewFocusDisposable.dispose()
    previewFocusDisposable = null
  }
})
</script>

<template>
  <div class="editor-pane editor-pane--source">
    <CodeEditor
      :value="source"
      :theme="editorTheme"
      language="json"
      class="pane-body"
      :options="sourceEditorOptions"
      @update:value="emit('update:source', $event)"
      @editorDidMount="handleSourceEditorMount"
    />
  </div>
  <div class="editor-pane editor-pane--target">
    <CodeEditor
      :value="previewContent"
      :theme="editorTheme"
      language="json"
      class="pane-body"
      :options="previewEditorOptions"
      @editorDidMount="handlePreviewEditorMount"
    />
  </div>
</template>

<style scoped lang="less">
.editor-pane {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-primary);
  border-radius: 0;
}

.editor-pane--source {
  border-right: 1px solid var(--border-strong);
}

.editor-pane:not(.editor-pane--source) {
  box-shadow: none;
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
</style>

