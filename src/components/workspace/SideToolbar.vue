<script setup lang="ts">
import { computed } from 'vue'
import IconButton from '../base/IconButton.vue'
import type { ToolType } from '@/types/jsonTools'
import type { IconButtonIcon } from '../base/IconButton.vue'
import { getSidebarActions, type SidebarActionConfig } from '@/config/sidebarActions'

const props = defineProps<{
  toolType: ToolType
  mode: 'format' | 'diff'
  themeToggleTitle: string
  isDarkTheme: boolean
}>()

const emit = defineEmits<{
  (e: 'update:mode', mode: 'format' | 'diff'): void
  (e: 'toggleTheme'): void
  (e: 'openCacheManager'): void
  (e: 'openAbout'): void
}>()

// 获取侧边栏操作按钮配置
const sidebarGroups = computed(() => getSidebarActions(props.toolType, props.mode))

function handleActionClick(action: SidebarActionConfig) {
  if (!action.emit) return

  if (action.emit === 'update:mode:format') {
    emit('update:mode', 'format')
  } else if (action.emit === 'update:mode:diff') {
    emit('update:mode', 'diff')
  } else if (action.emit === 'toggleTheme') {
    emit('toggleTheme')
  } else if (action.emit === 'openCacheManager') {
    emit('openCacheManager')
  } else if (action.emit === 'openAbout') {
    emit('openAbout')
  }
}

function getActionIcon(action: SidebarActionConfig): IconButtonIcon {
  if (action.key === 'theme-toggle') {
    return props.isDarkTheme ? 'moon' : 'sun'
  }
  return action.icon
}

function getActionTitle(action: SidebarActionConfig): string {
  if (action.key === 'theme-toggle') {
    return props.themeToggleTitle
  }
  return action.title
}

function isActionActive(action: SidebarActionConfig): boolean {
  if (action.active) {
    return action.active(props.mode, props.isDarkTheme) ?? false
  }
  return false
}
</script>

<template>
  <aside class="side-toolbar">
    <div class="toolbar-section">
      <div v-for="group in sidebarGroups" :key="group.name" :class="`${group.name}-group`">
        <IconButton
          v-for="action in group.actions"
          :key="action.key"
          :icon="getActionIcon(action)"
          :title="getActionTitle(action)"
          :active="isActionActive(action)"
          @click="handleActionClick(action)"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped lang="less">
.side-toolbar {
  width: var(--sidebar-width);
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  background: var(--surface-primary);
  border-right: 1px solid var(--border-subtle);
  backdrop-filter: blur(10px);

  .toolbar-section {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 4px 0;
  }

  .primary-group,
  .utility-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
}

@media (max-width: 960px) {
  .side-toolbar {
    width: 100%;
    height: 52px;
    flex-direction: row;
    justify-content: center;
    gap: 12px;
    padding: 6px 12px;
    border-right: none;
    border-bottom: 1px solid var(--border-subtle);

    .toolbar-section {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 16px;
    }

    .primary-group,
    .utility-group {
      flex-direction: row;
      gap: 12px;
    }
  }
}
</style>
