<script setup lang="ts">
import { ref, computed } from 'vue'
import IconButton from '../base/IconButton.vue'
import ImageToolPanel from './ImageToolPanel.vue'
import type { PanelKey, ToolAction, ToolType } from '@/types/jsonTools'
import type { ToolActionPayload } from '@/types/actions'
import type { ActionKey, ActionConfig } from '@/config/toolActions'
import { Transition } from 'vue'

const props = defineProps<{
  action: ActionConfig
  toolType: ToolType
  panel: PanelKey
  activeTool: ToolAction | null
  imageInfo?: { width: number; height: number } | null
  canUndo?: boolean
  canRedo?: boolean
}>()

const emit = defineEmits<{
  (e: 'action', payload: ToolActionPayload): void
}>()

// 子菜单显示状态
const activeSubmenu = ref(false)

// 图片工具面板显示状态
const imageToolPanelVisible = ref(false)

// 是否激活
const isActive = computed(() => {
  return props.activeTool === `${props.panel}-${props.action.key}`
})

// 是否是图片工具的撤销/重做按钮
const isImageUndoRedo = computed(() => {
  return props.toolType === 'image' && (props.action.key === 'undo' || props.action.key === 'redo')
})

// 是否需要禁用
const isDisabled = computed(() => {
  if (!isImageUndoRedo.value) return false
  return props.action.key === 'undo' ? !props.canUndo : !props.canRedo
})

// 是否是图片工具的操作面板按钮
const isImageToolPanel = computed(() => {
  return props.toolType === 'image' && 
    ['compress', 'resize', 'crop', 'rotate', 'flip', 'adjust'].includes(props.action.key)
})

// 处理按钮点击
function handleButtonClick() {
  // 如果有子菜单，切换子菜单显示
  if (props.action.hasSubmenu) {
    activeSubmenu.value = !activeSubmenu.value
    // 如果是图片工具的子菜单，关闭图片面板
    if (props.toolType === 'image') {
      imageToolPanelVisible.value = false
    }
    return
  }

  // 如果是图片工具面板按钮，切换面板显示
  if (isImageToolPanel.value) {
    imageToolPanelVisible.value = !imageToolPanelVisible.value
    activeSubmenu.value = false
    return
  }

  // 普通按钮，直接触发 action
  emitAction()
}

// 触发 action
function emitAction() {
  switch (props.action.key) {
    case 'import':
      emit('action', { action: 'triggerImport', panel: props.panel })
      break
    case 'export':
      emit('action', { action: 'export', panel: props.panel })
      break
    case 'save':
      emit('action', { action: 'save', panel: props.panel })
      break
    case 'format':
      emit('action', { action: 'format', panel: props.panel })
      break
    case 'minify':
      emit('action', { action: 'minify', panel: props.panel })
      break
    case 'repair':
      emit('action', { action: 'repair', panel: props.panel })
      break
    case 'clear':
      emit('action', { action: 'clear', panel: props.panel })
      break
    case 'stats':
      emit('action', { action: 'stats', panel: props.panel })
      break
    case 'download':
      emit('action', { action: 'download', panel: props.panel })
      break
    case 'undo':
      emit('action', { action: 'undo', panel: props.panel })
      break
    case 'redo':
      emit('action', { action: 'redo', panel: props.panel })
      break
  }
}

// 处理子菜单项点击
function handleSubmenuItem(value: string) {
  switch (props.action.key) {
    case 'case':
      emit('action', { action: 'case', panel: props.panel, params: { caseType: value } })
      break
    case 'encode':
      emit('action', { action: 'encode', panel: props.panel, params: { encodeType: value } })
      break
    case 'decode':
      emit('action', { action: 'decode', panel: props.panel, params: { decodeType: value } })
      break
    case 'trim':
      emit('action', { action: 'trim', panel: props.panel, params: { trimType: value } })
      break
    case 'convert':
      if (props.toolType === 'image') {
        emit('action', { action: 'convert', panel: props.panel, params: { format: value } })
      }
      break
    case 'filter':
      if (props.toolType === 'image') {
        emit('action', { action: 'filter', panel: props.panel, params: { filter: value } })
      }
      break
  }
  activeSubmenu.value = false
  imageToolPanelVisible.value = false
}

// 处理图片工具面板的 action
function handleImagePanelAction(payload: ToolActionPayload) {
  emit('action', payload)
}

// 关闭图片工具面板
function handleCloseImagePanel() {
  imageToolPanelVisible.value = false
}

// 计算按钮激活状态
const buttonActive = computed(() => {
  if (props.action.hasSubmenu) {
    return isActive.value || activeSubmenu.value
  }
  if (isImageToolPanel.value) {
    return isActive.value || imageToolPanelVisible.value
  }
  return isActive.value
})
</script>

<template>
  <div 
    class="tool-action-button" 
    :class="{ 
      'tool-action-button--with-menu': action.hasSubmenu || isImageToolPanel,
      'tool-action-button--disabled': isDisabled
    }"
    @click.stop
  >
    <IconButton
      :icon="action.icon"
      :title="action.title"
      :active="buttonActive"
      :disabled="isDisabled"
      :show-label="action.showLabel"
      @click="handleButtonClick"
    />

    <!-- 子菜单（文本工具） -->
    <Transition v-if="action.hasSubmenu && toolType !== 'image'" name="submenu">
      <div v-if="activeSubmenu" class="action-submenu" @click.stop>
        <button
          v-for="item in action.submenuItems"
          :key="item.value"
          class="submenu-item"
          @click.stop="handleSubmenuItem(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </Transition>

    <!-- 图片工具操作面板 -->
    <Transition v-if="isImageToolPanel" name="submenu">
      <div v-if="imageToolPanelVisible" class="action-submenu">
        <ImageToolPanel
          :action-key="action.key as ActionKey"
          :panel="panel"
          :image-info="imageInfo"
          @action="handleImagePanelAction"
          @close="handleCloseImagePanel"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="less">
.tool-action-button {
  position: relative;
  display: inline-flex;
  align-items: center;

  &--with-menu {
    overflow: visible;
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.action-submenu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 160px;
  padding: 4px;
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-soft);
  z-index: 10000 !important;
  display: flex !important;
  flex-direction: column;
  gap: 2px;
  visibility: visible !important;
  opacity: 1 !important;
}

.submenu-item {
  padding: 8px 12px;
  border: none;
  border-radius: var(--radius-base);
  background: transparent;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--button-hover-bg);
    color: var(--color-brand);
  }
}

.submenu-enter-active,
.submenu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.submenu-enter-from,
.submenu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

