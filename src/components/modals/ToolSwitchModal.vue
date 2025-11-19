<script setup lang="ts">
import type { ToolType } from '../../types/jsonTools'

defineProps<{
  visible: boolean
  currentTool: ToolType
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'select', tool: ToolType): void
}>()

const tools: Array<{ type: ToolType; label: string; description: string }> = [
  {
    type: 'text',
    label: '文本',
    description: '纯文本编辑器，支持文本处理和预览'
  },
  {
    type: 'image',
    label: '图片',
    description: '图片查看和编辑工具'
  },
  {
    type: 'json',
    label: 'JSON',
    description: 'JSON 格式化、压缩、修复和对比'
  }
]

function handleSelect(tool: ToolType) {
  emit('select', tool)
  emit('update:visible', false)
}

function handleClose() {
  emit('update:visible', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">选择工具</h3>
            <button class="modal-close" @click="handleClose" aria-label="关闭">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-content">
            <div class="tool-list">
              <button
                v-for="tool in tools"
                :key="tool.type"
                :class="['tool-item', { 'tool-item--active': currentTool === tool.type }]"
                @click="handleSelect(tool.type)"
              >
                <div class="tool-item-content">
                  <div class="tool-item-header">
                    <span class="tool-item-label">{{ tool.label }}</span>
                    <span v-if="currentTool === tool.type" class="tool-item-badge">当前</span>
                  </div>
                  <p class="tool-item-description">{{ tool.description }}</p>
                </div>
                <svg v-if="currentTool === tool.type" class="tool-item-check" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="less">
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-container {
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--surface-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-base);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--button-hover-bg);
    color: var(--text-primary);
  }
}

.modal-content {
  padding: 16px;
  overflow-y: auto;
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-base);
  background: var(--surface-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: var(--color-brand);
    background: var(--surface-hover);
  }

  &--active {
    border-color: var(--color-brand);
    background: color-mix(in srgb, var(--color-brand) 10%, transparent);
  }
}

.tool-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tool-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-item-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tool-item-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-brand);
  background: color-mix(in srgb, var(--color-brand) 15%, transparent);
}

.tool-item-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.tool-item-check {
  flex-shrink: 0;
  margin-left: 12px;
  color: var(--color-brand);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}
</style>

