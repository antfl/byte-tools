<script setup lang="ts">
/**
 * 状态栏组件
 * 显示编辑器状态信息，包括差异状态、消息、光标位置等
 */
import { computed } from 'vue'
import type { DiffState, MessageLevel, PanelKey } from '../../types/jsonTools'

type StatusMessage = { level: MessageLevel; text: string } | null

const props = defineProps<{
  /** 差异状态信息 */
  diffState: DiffState
  /** 正在处理的面板 */
  busyPanel: PanelKey | null
  /** 状态消息 */
  message: StatusMessage
  /** 光标位置 */
  cursorPosition: { line: number; column: number } | null
  /** 错误位置 */
  errorPosition: { line: number; column: number } | null
}>()

/** 根据状态计算状态点的样式类 */
const dotClass = computed(() => {
  if (!props.diffState.ok) {
    return 'error'
  }
  if (props.diffState.hasDiff) {
    return 'warn'
  }
  return 'ok'
})

/** 将状态消息按分隔符拆分为多个部分 */
const messageParts = computed(() => {
  if (!props.diffState.message) return []
  return props.diffState.message.split(' | ').filter(part => part.trim())
})
</script>

<template>
  <footer class="status-bar">
    <div class="status-left">
      <span class="dot" :class="dotClass" />
      <template v-for="(part, index) in messageParts" :key="index">
        <span class="message-part">{{ part }}</span>
      </template>
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
  gap: 16px;
  font-size: 11px;
  color: var(--text-muted);
}

.error-info {
  margin-left: 16px;
  color: var(--status-error);
}

.cursor-info {
  margin-left: 16px;
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
    color: var(--color-brand);
  }

  &.error {
    color: #ef4444;
  }

  &.info {
    color: var(--color-brand);
  }
}
</style>

