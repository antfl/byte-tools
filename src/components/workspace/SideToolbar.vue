<script setup lang="ts">
import { computed } from 'vue'
import IconButton from '../base/IconButton.vue'

const props = defineProps<{
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

const isFormatMode = computed(() => props.mode === 'format')
const themeIcon = computed(() => (props.isDarkTheme ? 'moon' : 'sun'))
</script>

<template>
  <aside class="side-toolbar">
    <div class="toolbar-section">
      <div class="primary-group">
        <div class="mode-switch">
          <IconButton
            icon="format"
            :active="isFormatMode"
            title="JSON 预览模式"
            @click="emit('update:mode', 'format')"
          />
          <IconButton
            icon="diff"
            :active="!isFormatMode"
            title="对比"
            @click="emit('update:mode', 'diff')"
          />
        </div>

        <IconButton
          icon="storage"
          title="缓存管理"
          @click="emit('openCacheManager')"
        />
      </div>

      <div class="utility-group">
        <IconButton
          icon="info"
          title="了解 Byte JSON"
          @click="emit('openAbout')"
        />
        <IconButton
          :icon="themeIcon"
          :title="themeToggleTitle"
          @click="emit('toggleTheme')"
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

  .mode-switch {
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

    .mode-switch {
      flex-direction: row;
    }
  }
}
</style>

