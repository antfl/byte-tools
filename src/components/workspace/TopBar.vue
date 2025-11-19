<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import IconButton from '../base/IconButton.vue'
import SvgIcon from '../base/SvgIcon.vue'
import Logo from '../../assets/logo.svg'
import type { PanelKey, ToolAction, ToolType } from '@/types/jsonTools'
import { getToolActionGroups, type ActionKey } from '@/config/toolActions'

const props = defineProps<{
  toolType: ToolType
  mode: 'format' | 'diff'
  activeTool: ToolAction | null
  autoFormat?: boolean
  deepParse?: boolean
}>()

const emit = defineEmits<{
  (e: 'triggerImport', panel: PanelKey): void
  (e: 'save', panel: PanelKey): void
  (e: 'export', panel: PanelKey): void
  (e: 'format', panel: PanelKey): void
  (e: 'minify', panel: PanelKey): void
  (e: 'repair', panel: PanelKey): void
  (e: 'clear', panel: PanelKey): void
  (e: 'toggleAutoFormat'): void
  (e: 'toggleDeepParse'): void
  (e: 'update:toolType', toolType: ToolType): void
  (e: 'textCase', panel: PanelKey, caseType: string): void
  (e: 'textEncode', panel: PanelKey, encodeType: string): void
  (e: 'textDecode', panel: PanelKey, decodeType: string): void
  (e: 'textTrim', panel: PanelKey, trimType: string): void
  (e: 'textStats', panel: PanelKey): void
}>()

const dropdownVisible = ref(false)
const dropdownRef = ref<HTMLDivElement | null>(null)
const activeSubmenu = ref<string | null>(null)

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

// 获取当前工具的操作按钮配置
const actionGroups = computed(() => getToolActionGroups(props.toolType, props.mode))

function handleToolSelect(tool: ToolType) {
  emit('update:toolType', tool)
  dropdownVisible.value = false
}

function toggleDropdown() {
  dropdownVisible.value = !dropdownVisible.value
}

let clickTimeout: ReturnType<typeof setTimeout> | null = null

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    dropdownVisible.value = false
  }
  
  if (clickTimeout) {
    clearTimeout(clickTimeout)
  }
  
  clickTimeout = setTimeout(() => {
    const target = event.target as HTMLElement
    const isClickOnSubmenu = target.closest('.action-submenu')
    const isClickOnSubmenuButton = target.closest('.action-group--with-menu')
    
    if (!isClickOnSubmenu && !isClickOnSubmenuButton) {
      activeSubmenu.value = null
    }
  }, 10)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (clickTimeout) {
    clearTimeout(clickTimeout)
  }
})

function handleAction(action: ActionKey, panel: PanelKey) {
  switch (action) {
    case 'import':
      emit('triggerImport', panel)
      break
    case 'export':
      emit('export', panel)
      break
    case 'save':
      emit('save', panel)
      break
    case 'format':
      emit('format', panel)
      break
    case 'minify':
      emit('minify', panel)
      break
    case 'repair':
      emit('repair', panel)
      break
    case 'clear':
      emit('clear', panel)
      break
    case 'case':
    case 'encode':
    case 'decode':
    case 'trim':
      if (activeSubmenu.value === action) {
        activeSubmenu.value = null
      } else {
        activeSubmenu.value = action
      }
      break
    case 'stats':
      emit('textStats', panel)
      break
  }
}

function handleSubmenuAction(action: ActionKey, value: string, panel: PanelKey) {
  switch (action) {
    case 'case':
      emit('textCase', panel, value)
      break
    case 'encode':
      emit('textEncode', panel, value)
      break
    case 'decode':
      emit('textDecode', panel, value)
      break
    case 'trim':
      emit('textTrim', panel, value)
      break
  }
  activeSubmenu.value = null
}

function isActive(panel: PanelKey, action: ActionKey) {
  return props.activeTool === `${panel}-${action}`
}
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
          <SvgIcon name="chevron-down" :class="['tool-switch-icon', { 'tool-switch-icon--open': dropdownVisible }]" />
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
                  <SvgIcon v-if="toolType === tool" name="check" class="tool-dropdown-check" />
                </div>
                <p class="tool-dropdown-description">{{ toolDescriptions[tool] }}</p>
              </div>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Format 模式 -->
    <div v-if="mode === 'format'" class="top-bar-actions">
      <template v-if="toolType !== 'image'">
        <div class="actions-row">
          <!-- 自动格式化组（仅 JSON 工具） -->
          <div v-if="toolType === 'json'" class="action-group">
            <IconButton
              icon="auto"
              :title="autoFormat ? '自动格式化已启用（点击关闭）' : '自动格式化已禁用（点击启用）'"
              :active="autoFormat"
              @click="emit('toggleAutoFormat')"
            />
            <IconButton
              icon="deep"
              :title="deepParse ? '深度解析已启用（点击关闭）' : '深度解析已禁用（点击启用）'"
              :active="deepParse"
              @click="emit('toggleDeepParse')"
            />
          </div>
          
          <!-- 根据配置渲染操作按钮组 -->
          <template v-for="group in actionGroups" :key="group.name">
            <template v-for="action in group.actions" :key="action.key">
              <div v-if="action.hasSubmenu" class="action-group action-group--with-menu" @click.stop>
                <IconButton
                  :icon="action.icon"
                  :title="action.title"
                  :active="isActive('source', action.key) || activeSubmenu === action.key"
                  @click="handleAction(action.key, 'source')"
                />
                <Transition name="submenu">
                  <div v-if="activeSubmenu === action.key" class="action-submenu" @click.stop>
                    <button
                      v-for="item in action.submenuItems"
                      :key="item.value"
                      class="submenu-item"
                      @click.stop="handleSubmenuAction(action.key, item.value, 'source')"
                    >
                      {{ item.label }}
                    </button>
                  </div>
                </Transition>
              </div>
              <div v-else class="action-group">
                <IconButton
                  :icon="action.icon"
                  :title="action.title"
                  :active="isActive('source', action.key)"
                  :show-label="action.showLabel"
                  @click="handleAction(action.key, 'source')"
                />
              </div>
            </template>
          </template>
        </div>
      </template>
    </div>

    <!-- Diff 模式 -->
    <div v-else class="top-bar-actions top-bar-actions--diff">
      <template v-if="toolType !== 'image'">
        <div class="actions-group">
          <div class="actions-row">
            <template v-for="group in actionGroups" :key="`source-${group.name}`">
              <div class="action-group">
                <IconButton
                  v-for="action in group.actions"
                  :key="`source-${action.key}`"
                  :icon="action.icon"
                  :title="action.title"
                  :active="isActive('source', action.key)"
                  :show-label="action.showLabel"
                  @click="handleAction(action.key, 'source')"
                />
              </div>
            </template>
          </div>
        </div>
        <div class="actions-group">
          <div class="actions-row">
            <template v-for="group in actionGroups" :key="`target-${group.name}`">
              <div class="action-group">
                <IconButton
                  v-for="action in group.actions"
                  :key="`target-${action.key}`"
                  :icon="action.icon"
                  :title="action.title"
                  :active="isActive('target', action.key)"
                  :show-label="action.showLabel"
                  @click="handleAction(action.key, 'target')"
                />
              </div>
            </template>
          </div>
        </div>
      </template>
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
  padding: 0 8px;
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

  &--with-menu {
    overflow: visible;
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

@media (max-width: 960px) {
  .top-bar-actions {
    padding-left: 8px;

    &--diff {
      grid-template-columns: 1fr;
    }
  }
}
</style>
