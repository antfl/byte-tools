<script setup lang="ts">
import { computed } from 'vue'
import type { DiffState, MessageLevel, PanelKey } from '../../types/jsonTools'

type StatusMessage = { level: MessageLevel; text: string } | null

const props = defineProps<{
  diffState: DiffState
  busyPanel: PanelKey | null
  message: StatusMessage
  cursorPosition: { line: number; column: number } | null
  errorPosition: { line: number; column: number } | null
}>()

const dotClass = computed(() => {
  if (!props.diffState.ok) {
    return 'error'
  }
  if (props.diffState.hasDiff) {
    return 'warn'
  }
  return 'ok'
})
</script>

<template>
  <footer class="status-bar">
    <div class="status-left">
      <span class="dot" :class="dotClass" />
      <span>{{ diffState.message }}</span>
      <span v-if="errorPosition" class="error-info">
        错误位置：第 {{ errorPosition.line }} 行，第 {{ errorPosition.column }} 列
      </span>
      <span v-if="cursorPosition" class="cursor-info">
        行 {{ cursorPosition.line }}, 列 {{ cursorPosition.column }}
      </span>
    </div>
    <div class="status-right">
      <span v-if="busyPanel" class="loading">处理中...</span>
      <span v-else-if="message" :class="['message', message.level]">{{ message.text }}</span>
      <span v-else aria-hidden="true"></span>
    </div>
  </footer>
</template>

<style scoped lang="less">
.status-bar {
  height: 25px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--surface-status);
  border-top: 1px solid var(--border-subtle);
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.error-info {
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid var(--border-subtle);
  color: var(--status-error);
}

.cursor-info {
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 8px;
  background-color: var(--status-neutral);

  &.ok {
    background-color: var(--status-ok);
  }

  &.warn {
    background-color: var(--status-warn);
  }

  &.error {
    background-color: var(--status-error);
  }
}

.loading {
  color: var(--color-brand);
}

.message {
  &.success {
    color: #22c55e;
  }

  &.error {
    color: #ef4444;
  }

  &.info {
    color: var(--color-brand);
  }
}
</style>

