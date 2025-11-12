<script setup lang="ts">
import IconButton from './IconButton.vue'
import type { IconButtonIcon } from './IconButton.vue'
import Logo from '../assets/logo.svg'
import type { PanelKey, ToolAction } from '../types/jsonTools'

type ActionKey = 'import' | 'save' | 'export' | 'format' | 'minify' | 'repair' | 'clear'
type ActionIcon = Extract<IconButtonIcon, 'import' | 'save' | 'export' | 'format' | 'minify' | 'repair' | 'clear'>

const props = defineProps<{
  mode: 'format' | 'diff'
  activeTool: ToolAction | null
  autoFormat?: boolean
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
}>()

const ACTION_ITEMS: Array<{
  key: ActionKey
  icon: ActionIcon
  title: string
}> = [
  { key: 'save', icon: 'save', title: '存储到缓存' },
  { key: 'import', icon: 'import', title: '导入' },
  { key: 'export', icon: 'export', title: '导出' },
  { key: 'format', icon: 'format', title: '格式化' },
  { key: 'minify', icon: 'minify', title: '压缩' },
  { key: 'repair', icon: 'repair', title: '尝试修复' },
  { key: 'clear', icon: 'clear', title: '清空' }
]

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
  }
}

function isActive(panel: PanelKey, action: ActionKey) {
  return props.activeTool === `${panel}-${action}`
}
</script>

<template>
  <header class="top-bar">

    <div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
      <img class="logo" :src="Logo" alt="Byte JSON" />
    </div>

    <div v-if="mode === 'format'" class="top-bar-actions">
      <div class="actions-row">
        <IconButton
          icon="auto"
          :title="autoFormat ? '自动格式化已启用（点击关闭）' : '自动格式化已禁用（点击启用）'"
          :active="autoFormat"
          @click="emit('toggleAutoFormat')"
        />
        <div class="actions-divider"></div>
        <IconButton
          v-for="action in ACTION_ITEMS"
          :key="action.key"
          :icon="action.icon"
          :title="action.title"
          :active="isActive('source', action.key)"
          @click="handleAction(action.key, 'source')"
        />
      </div>
    </div>

    <div v-else class="top-bar-actions top-bar-actions--diff">
      <div class="actions-group">
        <div class="actions-row">
          <IconButton
            v-for="action in ACTION_ITEMS"
            :key="`source-${action.key}`"
            :icon="action.icon"
            :title="action.title"
            :active="isActive('source', action.key)"
            @click="handleAction(action.key, 'source')"
          />
        </div>
      </div>
      <div class="actions-group">
        <div class="actions-row">
          <IconButton
            v-for="action in ACTION_ITEMS"
            :key="`target-${action.key}`"
            :icon="action.icon"
            :title="action.title"
            :active="isActive('target', action.key)"
            @click="handleAction(action.key, 'target')"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="less">
.top-bar {
  height: 40px;
  display: flex;
  align-items: center;
  background: var(--surface-primary);
  border-bottom: 1px solid var(--border-subtle);

  .logo {
    width: 26px;
    height: 26px;
  }
}

.top-bar-actions {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 8px 16px 8px calc(var(--sidebar-width) + 16px);

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
  gap: 18px;
}

.actions-divider {
  width: 1px;
  height: 20px;
  background-color: var(--border-subtle);
  margin: 0 4px;
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

