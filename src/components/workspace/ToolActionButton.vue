<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject, watch, type Ref } from 'vue'
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

const openButtonId = inject<Ref<symbol | null>>('openButtonId')
const setOpenButton = inject<(id: symbol | null) => void>('setOpenButton')

const buttonId = Symbol()
const activeSubmenu = ref(false)
const imageToolPanelVisible = ref(false)

if (openButtonId) {
  watch(openButtonId, (id) => {
    if (id !== buttonId) {
      activeSubmenu.value = false
      imageToolPanelVisible.value = false
    }
  }, { immediate: true })
}

const isActive = computed(() => {
  return props.activeTool === `${props.panel}-${props.action.key}`
})

const isImageUndoRedo = computed(() => {
  return props.toolType === 'image' && (props.action.key === 'undo' || props.action.key === 'redo')
})

const isDisabled = computed(() => {
  if (!isImageUndoRedo.value) return false
  return props.action.key === 'undo' ? !props.canUndo : !props.canRedo
})

const isImageToolPanel = computed(() => {
  return props.toolType === 'image' && 
    ['compress', 'resize', 'crop', 'rotate', 'flip', 'adjust'].includes(props.action.key)
})

function handleButtonClick() {
  if (props.action.hasSubmenu) {
    const willOpen = !activeSubmenu.value
    if (willOpen) {
      setOpenButton?.(buttonId)
    } else {
      setOpenButton?.(null)
    }
    activeSubmenu.value = willOpen
    if (props.toolType === 'image') {
      imageToolPanelVisible.value = false
    }
    return
  }

  if (isImageToolPanel.value) {
    const willOpen = !imageToolPanelVisible.value
    if (willOpen) {
      setOpenButton?.(buttonId)
    } else {
      setOpenButton?.(null)
    }
    imageToolPanelVisible.value = willOpen
    activeSubmenu.value = false
    return
  }

  emitAction()
}
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
  closeMenu()
}

function handleImagePanelAction(payload: ToolActionPayload) {
  emit('action', payload)
}

function handleCloseImagePanel() {
  imageToolPanelVisible.value = false
  setOpenButton?.(null)
}

const buttonRef = ref<HTMLDivElement | null>(null)

function handleClickOutside(event: MouseEvent) {
  if (buttonRef.value && !buttonRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

function closeMenu() {
  if (activeSubmenu.value || imageToolPanelVisible.value) {
    activeSubmenu.value = false
    imageToolPanelVisible.value = false
    setOpenButton?.(null)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (openButtonId?.value === buttonId) {
    setOpenButton?.(null)
  }
})
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
    ref="buttonRef"
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

    <!-- 子菜单（所有工具，包括图片工具的子菜单） -->
    <Transition v-if="action.hasSubmenu" name="submenu">
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

