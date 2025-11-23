<script setup lang="ts">
import IconButton from '../base/IconButton.vue'
import type { ToolActionPayload } from '@/types/actions'

defineProps<{
  autoFormat?: boolean
  deepParse?: boolean
}>()

const emit = defineEmits<{
  (e: 'action', payload: ToolActionPayload): void
}>()

function handleToggleAutoFormat() {
  emit('action', { action: 'toggleAutoFormat' })
}

function handleToggleDeepParse() {
  emit('action', { action: 'toggleDeepParse' })
}
</script>

<template>
  <div class="json-toggle-buttons">
    <IconButton
      icon="auto"
      :title="autoFormat ? '自动格式化已启用（点击关闭）' : '自动格式化已禁用（点击启用）'"
      :active="autoFormat"
      @click="handleToggleAutoFormat"
    />
    <IconButton
      icon="deep"
      :title="deepParse ? '深度解析已启用（点击关闭）' : '深度解析已禁用（点击启用）'"
      :active="deepParse"
      @click="handleToggleDeepParse"
    />
  </div>
</template>

<style scoped lang="less">
.json-toggle-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border-radius: 0;
  background: transparent;
  transition: none;

  &:hover {
    background-color: transparent;
  }
}
</style>

