<script setup lang="ts">
import { DiffEditor } from 'monaco-editor-vue3'
import type { editor as MonacoEditorNS } from 'monaco-editor'

defineProps<{
  source: string
  target: string
  editorTheme: string
  diffEditorOptions: MonacoEditorNS.IStandaloneDiffEditorConstructionOptions
}>()

const emit = defineEmits<{
  (e: 'mount', editor: MonacoEditorNS.IStandaloneDiffEditor): void
  (e: 'update:target', value: string): void
}>()

function handleEditorDidMount(editor: MonacoEditorNS.IStandaloneDiffEditor) {
  emit('mount', editor)
}
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

<style scoped>
.editor-pane {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-primary);
  border-radius: 0;
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

.diff-body {
  border: none;
}
</style>

