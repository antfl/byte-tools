<script setup lang="ts">
import { computed } from 'vue'
import IconButton from '../base/IconButton.vue'
import ThemeToggle from '../base/ThemeToggle.vue'
import { useTheme } from '@/composables/useTheme'
import type { ToolType } from '@/types/jsonTools'
import { getSidebarActions, type SidebarActionConfig } from '@/config/sidebarActions'

const props = defineProps<{
  toolType: ToolType
  mode: 'format' | 'diff'
}>()

const emit = defineEmits<{
  (e: 'update:mode', mode: 'format' | 'diff'): void
  (e: 'openCacheManager'): void
  (e: 'openAbout'): void
}>()

// 获取侧边栏操作按钮配置，分离主要按钮和工具按钮
const sidebarGroups = computed(() => {
  const groups = getSidebarActions(props.toolType, props.mode)
  return groups.map(group => ({
    ...group,
    actions: group.actions.filter(action => action.key !== 'theme-toggle' && action.key !== 'about')
  }))
})

// 获取关于按钮配置
const aboutAction = computed(() => {
  const groups = getSidebarActions(props.toolType, props.mode)
  for (const group of groups) {
    const action = group.actions.find(a => a.key === 'about')
    if (action) return action
  }
  return null
})

function handleActionClick(action: SidebarActionConfig) {
  if (!action.emit) return

  if (action.emit === 'update:mode:format') {
    emit('update:mode', 'format')
  } else if (action.emit === 'update:mode:diff') {
    emit('update:mode', 'diff')
  } else if (action.emit === 'openCacheManager') {
    emit('openCacheManager')
  } else if (action.emit === 'openAbout') {
    emit('openAbout')
  }
}

function isActionActive(action: SidebarActionConfig): boolean {
  if (action.active) {
    // 使用 useTheme 获取当前主题状态
    const { isDarkTheme } = useTheme()
    return action.active(props.mode, isDarkTheme.value) ?? false
  }
  return false
}
</script>

<template>
  <aside class="side-toolbar">
    <div class="toolbar-section">
      <div class="toolbar-main">
        <div v-for="group in sidebarGroups" :key="group.name" :class="`${group.name}-group`">
          <IconButton
            v-for="action in group.actions"
            :key="action.key"
            :icon="action.icon"
            :title="action.title"
            :active="isActionActive(action)"
            @click="handleActionClick(action)"
          />
        </div>
      </div>
      <div class="toolbar-footer">
        <ThemeToggle />
        <IconButton
          v-if="aboutAction"
          :icon="aboutAction.icon"
          :title="aboutAction.title"
          @click="handleActionClick(aboutAction)"
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

  .toolbar-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    overflow-y: auto;
  }

  .toolbar-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    padding-top: 12px;
    border-top: 1px solid var(--border-subtle);
    width: 100%;
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

    .toolbar-main {
      flex: 1;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      overflow: visible;
    }

    .toolbar-footer {
      flex-direction: row;
      gap: 12px;
      padding-top: 0;
      border-top: none;
      border-left: 1px solid var(--border-subtle);
      padding-left: 12px;
      width: auto;
    }

    .primary-group,
    .utility-group {
      flex-direction: row;
      gap: 12px;
    }
  }
}
</style>
