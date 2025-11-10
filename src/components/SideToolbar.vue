<script setup lang="ts">
import { computed } from 'vue'
import IconButton from './IconButton.vue'

const props = defineProps<{
  mode: 'format' | 'diff'
  themeToggleTitle: string
  isDarkTheme: boolean
}>()

const emit = defineEmits<{
  (e: 'update:mode', mode: 'format' | 'diff'): void
  (e: 'toggleTheme'): void
}>()

const isFormatMode = computed(() => props.mode === 'format')
const themeIcon = computed(() => (props.isDarkTheme ? 'moon' : 'sun'))
</script>

<template>
  <aside class="side-toolbar">
    <div class="toolbar-section">
      <div class="mode-switch">
        <IconButton
          icon="format"
          :variant="isFormatMode ? 'primary' : 'ghost'"
          :active="isFormatMode"
          title="JSON 预览模式"
          @click="emit('update:mode', 'format')"
        />
        <IconButton
          icon="diff"
          :variant="!isFormatMode ? 'primary' : 'ghost'"
          :active="!isFormatMode"
          title="对比"
          @click="emit('update:mode', 'diff')"
        />
      </div>

      <button
        type="button"
        class="theme-toggle"
        :title="themeToggleTitle"
        :aria-label="themeToggleTitle"
        @click="emit('toggleTheme')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <use :href="`#icon-${themeIcon}`" :xlink:href="`#icon-${themeIcon}`" />
        </svg>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.side-toolbar {
  width: var(--sidebar-width);
  padding: 6px 4px;
  background: var(--surface-toolbar);
  border-right: 1px solid var(--border-subtle);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.toolbar-section {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mode-switch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.side-toolbar :deep(.icon-button) {
  width: 28px;
  height: 28px;
  border-radius: 10px;
}

.theme-toggle {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.theme-toggle svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.theme-toggle:hover {
  background-color: var(--surface-card);
  color: var(--color-brand);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
}

@media (max-width: 960px) {
  .side-toolbar {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    gap: 12px;
    padding: 4px 8px;
    border-right: none;
    border-bottom: 1px solid var(--border-subtle);
    height: 40px;
  }

  .toolbar-section {
    flex-direction: row;
    gap: 12px;
    justify-content: center;
  }

  .mode-switch {
    flex-direction: row;
  }
}
</style>

