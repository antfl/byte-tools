<script setup lang="ts">
import CodeEditor from 'monaco-editor-vue3'

defineProps<{
  source: string
  previewContent: string
  editorTheme: string
  previewEditorOptions: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'update:source', value: string): void
}>()
</script>

<template>
  <div class="editor-pane editor-pane--source text-input-pane">
    <textarea
      :value="source"
      placeholder="在此粘贴或输入 JSON 字符串"
      @input="emit('update:source', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
  <div class="editor-pane editor-pane--target">
    <CodeEditor
      :value="previewContent"
      :theme="editorTheme"
      language="json"
      class="pane-body"
      :options="previewEditorOptions"
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
}

.editor-pane:not(.editor-pane--source) {
  box-shadow: none;
}

.text-input-pane {
  position: relative;
  border-right: 1px solid var(--border-strong);
}

.text-input-pane textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--text-primary);
  font-family: '"Cascadia Code", "Fira Code", "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',serif;
  font-size: 14px;
  line-height: 22px;
  padding: 16px;
  box-sizing: border-box;
}

.text-input-pane textarea::placeholder {
  color: var(--text-muted);
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

