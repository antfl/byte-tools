<script setup lang="ts">
import IconButton from '../base/IconButton.vue'
import type { IconButtonIcon } from '../base/IconButton.vue'
import Logo from '../../assets/logo.svg'
import type { PanelKey, ToolAction } from '../../types/jsonTools'

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

// 按功能类型分组按钮
const DATA_ACTIONS: Array<{
  key: ActionKey
  icon: ActionIcon
  title: string
}> = [
  { key: 'save', icon: 'save', title: '存储到缓存' },
  { key: 'import', icon: 'import', title: '导入' },
  { key: 'export', icon: 'export', title: '导出' }
]

const FORMAT_ACTIONS: Array<{
  key: ActionKey
  icon: ActionIcon
  title: string
}> = [
  { key: 'format', icon: 'format', title: '格式化' },
  { key: 'minify', icon: 'minify', title: '压缩' },
  { key: 'repair', icon: 'repair', title: '尝试修复' }
]

const CLEAR_ACTION = { key: 'clear' as ActionKey, icon: 'clear' as ActionIcon, title: '清空' }

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
        <!-- 自动格式化组 -->
        <div class="action-group">
          <IconButton
            icon="auto"
            :title="autoFormat ? '自动格式化已启用（点击关闭）' : '自动格式化已禁用（点击启用）'"
            :active="autoFormat"
            @click="emit('toggleAutoFormat')"
          />
        </div>
        <!-- 数据管理组 -->
        <div class="action-group">
          <IconButton
            v-for="action in DATA_ACTIONS"
            :key="action.key"
            :icon="action.icon"
            :title="action.title"
            :active="isActive('source', action.key)"
            :show-label="action.key === 'import' || action.key === 'export'"
            @click="handleAction(action.key, 'source')"
          />
        </div>
        <!-- 格式化工具组 -->
        <div class="action-group">
          <IconButton
            v-for="action in FORMAT_ACTIONS"
            :key="action.key"
            :icon="action.icon"
            :title="action.title"
            :active="isActive('source', action.key)"
            @click="handleAction(action.key, 'source')"
          />
        </div>
        <!-- 清空组 -->
        <div class="action-group">
          <IconButton
            :icon="CLEAR_ACTION.icon"
            :title="CLEAR_ACTION.title"
            :active="isActive('source', CLEAR_ACTION.key)"
            @click="handleAction(CLEAR_ACTION.key, 'source')"
          />
        </div>
      </div>
    </div>

    <div v-else class="top-bar-actions top-bar-actions--diff">
      <div class="actions-group">
        <div class="actions-row">
          <!-- 数据管理组 -->
          <div class="action-group">
            <IconButton
              v-for="action in DATA_ACTIONS"
              :key="`source-${action.key}`"
              :icon="action.icon"
              :title="action.title"
              :active="isActive('source', action.key)"
              :show-label="action.key === 'import' || action.key === 'export'"
              @click="handleAction(action.key, 'source')"
            />
          </div>
          <!-- 格式化工具组 -->
          <div class="action-group">
            <IconButton
              v-for="action in FORMAT_ACTIONS"
              :key="`source-${action.key}`"
              :icon="action.icon"
              :title="action.title"
              :active="isActive('source', action.key)"
              @click="handleAction(action.key, 'source')"
            />
          </div>
          <!-- 清空组 -->
          <div class="action-group">
            <IconButton
              :key="`source-${CLEAR_ACTION.key}`"
              :icon="CLEAR_ACTION.icon"
              :title="CLEAR_ACTION.title"
              :active="isActive('source', CLEAR_ACTION.key)"
              @click="handleAction(CLEAR_ACTION.key, 'source')"
            />
          </div>
        </div>
      </div>
      <div class="actions-group">
        <div class="actions-row">
          <!-- 数据管理组 -->
          <div class="action-group">
            <IconButton
              v-for="action in DATA_ACTIONS"
              :key="`target-${action.key}`"
              :icon="action.icon"
              :title="action.title"
              :active="isActive('target', action.key)"
              :show-label="action.key === 'import' || action.key === 'export'"
              @click="handleAction(action.key, 'target')"
            />
          </div>
          <!-- 格式化工具组 -->
          <div class="action-group">
            <IconButton
              v-for="action in FORMAT_ACTIONS"
              :key="`target-${action.key}`"
              :icon="action.icon"
              :title="action.title"
              :active="isActive('target', action.key)"
              @click="handleAction(action.key, 'target')"
            />
          </div>
          <!-- 清空组 -->
          <div class="action-group">
            <IconButton
              :key="`target-${CLEAR_ACTION.key}`"
              :icon="CLEAR_ACTION.icon"
              :title="CLEAR_ACTION.title"
              :active="isActive('target', CLEAR_ACTION.key)"
              @click="handleAction(CLEAR_ACTION.key, 'target')"
            />
          </div>
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

