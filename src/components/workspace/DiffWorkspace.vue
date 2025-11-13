<script setup lang="ts">
import { onUnmounted } from 'vue'
import { DiffEditor } from 'monaco-editor-vue3'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import type { IDisposable } from 'monaco-editor'

defineProps<{
  source: string
  target: string
  editorTheme: string
  diffEditorOptions: MonacoEditorNS.IStandaloneDiffEditorConstructionOptions
}>()

const emit = defineEmits<{
  (e: 'mount', editor: MonacoEditorNS.IStandaloneDiffEditor): void
  (e: 'update:target', value: string): void
  (e: 'cursor-change', position: { line: number; column: number } | null): void
}>()

let sourceCursorDisposable: IDisposable | null = null
let targetCursorDisposable: IDisposable | null = null
let sourceFocusDisposable: IDisposable | null = null
let targetFocusDisposable: IDisposable | null = null

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

function handleEditorDidMount(editor: MonacoEditorNS.IStandaloneDiffEditor) {
  emit('mount', editor)
  
  const originalEditor = editor.getOriginalEditor()
  const modifiedEditor = editor.getModifiedEditor()
  
  // 监听源编辑器（左侧）的焦点变化
  sourceFocusDisposable = originalEditor.onDidFocusEditorWidget(() => {
    // 当源编辑器获得焦点时，监听其光标位置变化
    if (sourceCursorDisposable) {
      sourceCursorDisposable.dispose()
    }
    if (targetCursorDisposable) {
      targetCursorDisposable.dispose()
      targetCursorDisposable = null
    }
    sourceCursorDisposable = originalEditor.onDidChangeCursorPosition(() => {
      updateCursorPosition(originalEditor)
    })
    updateCursorPosition(originalEditor)
  })
  
  // 监听目标编辑器（右侧）的焦点变化
  targetFocusDisposable = modifiedEditor.onDidFocusEditorWidget(() => {
    // 当目标编辑器获得焦点时，监听其光标位置变化
    if (targetCursorDisposable) {
      targetCursorDisposable.dispose()
    }
    if (sourceCursorDisposable) {
      sourceCursorDisposable.dispose()
      sourceCursorDisposable = null
    }
    targetCursorDisposable = modifiedEditor.onDidChangeCursorPosition(() => {
      updateCursorPosition(modifiedEditor)
    })
    updateCursorPosition(modifiedEditor)
  })
  
  // 初始化：监听两个编辑器的光标位置变化（只有当有焦点时才更新）
  sourceCursorDisposable = originalEditor.onDidChangeCursorPosition(() => {
    if (originalEditor.hasTextFocus()) {
      updateCursorPosition(originalEditor)
    }
  })
  
  targetCursorDisposable = modifiedEditor.onDidChangeCursorPosition(() => {
    if (modifiedEditor.hasTextFocus()) {
      updateCursorPosition(modifiedEditor)
    }
  })
  
  // 初始化光标位置
  if (originalEditor.hasTextFocus()) {
    updateCursorPosition(originalEditor)
  } else if (modifiedEditor.hasTextFocus()) {
    updateCursorPosition(modifiedEditor)
  }
}

onUnmounted(() => {
  if (sourceCursorDisposable) {
    sourceCursorDisposable.dispose()
    sourceCursorDisposable = null
  }
  if (targetCursorDisposable) {
    targetCursorDisposable.dispose()
    targetCursorDisposable = null
  }
  if (sourceFocusDisposable) {
    sourceFocusDisposable.dispose()
    sourceFocusDisposable = null
  }
  if (targetFocusDisposable) {
    targetFocusDisposable.dispose()
    targetFocusDisposable = null
  }
})
</script>

<template>
  <div class="editor-pane editor-pane--diff">
    <DiffEditor
      :original="source"
      :value="target"
      :theme="editorTheme"
      language="json"
      class="pane-body diff-body"
      :options="diffEditorOptions"
      @editorDidMount="handleEditorDidMount"
      @update:value="emit('update:target', $event)"
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
}

.pane-body {
  flex: 1;
  min-height: 0;
  width: 100%;

  :deep(.monaco-editor),
  :deep(.monaco-editor-vue3) {
    height: 100%;
  }
}

.diff-body {
  border: none;
}
</style>

