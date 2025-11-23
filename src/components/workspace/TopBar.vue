<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, provide } from 'vue'
import SvgIcon from '../base/SvgIcon.vue'
import Logo from '../../assets/logo.svg'
import ToolActionButton from './ToolActionButton.vue'
import JsonToggleButtons from './JsonToggleButtons.vue'
import type { ToolAction, ToolType } from '@/types/jsonTools'
import { getToolActionGroups } from '@/config/toolActions'
import type { ToolActionPayload } from '@/types/actions'

const props = defineProps<{
  toolType: ToolType
  mode: 'format' | 'diff'
  activeTool: ToolAction | null
  autoFormat?: boolean
  deepParse?: boolean
  imageInfo?: { width: number; height: number } | null
  canUndo?: boolean
  canRedo?: boolean
}>()

const emit = defineEmits<{
  (e: 'action', payload: ToolActionPayload): void
  (e: 'update:toolType', toolType: ToolType): void
}>()

const dropdownVisible = ref(false)
const dropdownRef = ref<HTMLDivElement | null>(null)

const toolLabels: Record<ToolType, string> = {
  text: '文本',
  image: '图片',
  json: 'JSON'
}

const toolDescriptions: Record<ToolType, string> = {
  text: '纯文本编辑器，支持文本处理和预览',
  image: '图片查看和编辑工具',
  json: 'JSON 格式化、压缩、修复和对比'
}

const tools: ToolType[] = ['text', 'image', 'json']

const actionGroups = computed(() => getToolActionGroups(props.toolType, props.mode))

const openButtonId = ref<symbol | null>(null)

function setOpenButton(id: symbol | null) {
  openButtonId.value = id
}

provide('openButtonId', openButtonId)
provide('setOpenButton', setOpenButton)

function handleToolSelect(tool: ToolType) {
  emit('update:toolType', tool)
  dropdownVisible.value = false
}

function toggleDropdown() {
  dropdownVisible.value = !dropdownVisible.value
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    dropdownVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="top-bar">
    <div class="top-bar-left">
      <div class="logo-container">
        <img class="logo" :src="Logo" alt="Byte Tools" />
      </div>
      <div class="tool-select-wrapper" ref="dropdownRef">
        <button class="tool-switch-button" @click="toggleDropdown" :title="`当前工具: ${toolLabels[toolType]}`">
          <span class="tool-switch-label">{{ toolLabels[toolType] }}</span>
          <SvgIcon name="chevron-down" :class="['tool-switch-icon', { 'tool-switch-icon--open': dropdownVisible }]" :size="16" />
        </button>
        <Transition name="dropdown">
          <div v-if="dropdownVisible" class="tool-dropdown">
            <button
              v-for="tool in tools"
              :key="tool"
              :class="['tool-dropdown-item', { 'tool-dropdown-item--active': toolType === tool }]"
              @click="handleToolSelect(tool)"
            >
              <div class="tool-dropdown-content">
                <div class="tool-dropdown-header">
                  <span class="tool-dropdown-label">{{ toolLabels[tool] }}</span>
                  <SvgIcon v-if="toolType === tool" name="check" class="tool-dropdown-check" :size="16" />
                </div>
                <p class="tool-dropdown-description">{{ toolDescriptions[tool] }}</p>
              </div>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <div v-if="mode === 'format'" class="top-bar-actions">
      <div class="actions-row">
        <div v-if="toolType === 'json'" class="action-group">
          <JsonToggleButtons
            :auto-format="autoFormat"
            :deep-parse="deepParse"
            @action="emit('action', $event)"
          />
        </div>
        
        <template v-for="group in actionGroups" :key="group.name">
          <div class="action-group">
            <ToolActionButton
              v-for="action in group.actions"
              :key="action.key"
              :action="action"
              :tool-type="toolType"
              panel="source"
              :active-tool="activeTool"
              :image-info="imageInfo"
              :can-undo="canUndo"
              :can-redo="canRedo"
              @action="emit('action', $event)"
            />
          </div>
        </template>
      </div>
    </div>

    <div v-else class="top-bar-actions top-bar-actions--diff">
      <div class="actions-group">
        <div class="actions-row">
          <template v-for="group in actionGroups" :key="`source-${group.name}`">
            <div class="action-group">
              <ToolActionButton
                v-for="action in group.actions"
                :key="`source-${action.key}`"
                :action="action"
                :tool-type="toolType"
                panel="source"
                :active-tool="activeTool"
                :image-info="imageInfo"
                @action="emit('action', $event)"
              />
            </div>
          </template>
        </div>
      </div>
      <div class="actions-group">
        <div class="actions-row">
          <template v-for="group in actionGroups" :key="`target-${group.name}`">
            <div class="action-group">
              <ToolActionButton
                v-for="action in group.actions"
                :key="`target-${action.key}`"
                :action="action"
                :tool-type="toolType"
                panel="target"
                :active-tool="activeTool"
                :image-info="imageInfo"
                @action="emit('action', $event)"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="less">
.top-bar {
  position: relative;
  z-index: 100;
  height: 40px;
  display: flex;
  align-items: center;
  background: var(--surface-primary);
  border-bottom: 1px solid var(--border-subtle);
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-container {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 26px;
  height: 26px;
}

.tool-select-wrapper {
  position: relative;
}

.tool-switch-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: var(--radius-base);
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--color-brand);
  }

  &:active {
    transform: scale(0.98);
  }
}

.tool-switch-label {
  user-select: none;
}

.tool-switch-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  &--open {
    transform: rotate(180deg);
  }

  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}

.tool-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 200px;
  padding: 4px;
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-soft);
  z-index: 1000;
  overflow: hidden;
}

.tool-dropdown-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: var(--radius-base);
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--button-hover-bg);
  }

  &--active {
    background: color-mix(in srgb, var(--color-brand) 12%, transparent);
  }
}

.tool-dropdown-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.tool-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tool-dropdown-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  user-select: none;

  .tool-dropdown-item--active & {
    color: var(--color-brand);
  }

  .tool-dropdown-item:hover & {
    color: var(--color-brand);
  }
}

.tool-dropdown-description {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  color: var(--text-secondary);
  user-select: none;
  
  .tool-dropdown-item--active & {
    color: var(--text-secondary);
  }
}

.tool-dropdown-check {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: var(--color-brand);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.top-bar-actions {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 8px 16px;
  overflow: visible;

  &--diff {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 1px;
  border-radius: var(--radius-base);
  background: var(--surface-toolbar);
  transition: background-color 0.2s ease;
  position: relative;
  overflow: visible;

  &:hover {
    background-color: color-mix(in srgb, var(--surface-toolbar) 100%, var(--color-brand) 8%);
  }

}

@media (max-width: 960px) {
  .top-bar-actions {
    padding-left: 8px;

    &--diff {
      grid-template-columns: 1fr;
    }
  }
}
</style>
