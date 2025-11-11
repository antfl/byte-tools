<script setup lang="ts">
type IconButtonIcon =
  | 'diff'
  | 'import'
  | 'export'
  | 'format'
  | 'minify'
  | 'repair'
  | 'clear'
  | 'save'
  | 'storage'
  | 'sun'
  | 'moon'

export type { IconButtonIcon }

import clearIcon from '../assets/icons/clear.svg?raw'
import diffIcon from '../assets/icons/diff.svg?raw'
import exportIcon from '../assets/icons/export.svg?raw'
import formatIcon from '../assets/icons/format.svg?raw'
import importIcon from '../assets/icons/import.svg?raw'
import minifyIcon from '../assets/icons/minify.svg?raw'
import moonIcon from '../assets/icons/moon.svg?raw'
import repairIcon from '../assets/icons/repair.svg?raw'
import saveIcon from '../assets/icons/save.svg?raw'
import storageIcon from '../assets/icons/storage.svg?raw'
import sunIcon from '../assets/icons/sun.svg?raw'

const props = withDefaults(
  defineProps<{
    icon: IconButtonIcon
    title: string
    active?: boolean
  }>(),
  {
    active: false
  }
)

const emit = defineEmits<{
  (event: 'click'): void
}>()

const ICON_MAP: Record<IconButtonIcon, string> = {
  clear: clearIcon,
  diff: diffIcon,
  export: exportIcon,
  format: formatIcon,
  import: importIcon,
  minify: minifyIcon,
  moon: moonIcon,
  repair: repairIcon,
  save: saveIcon,
  storage: storageIcon,
  sun: sunIcon
}

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <button
    type="button"
    :class="['icon-button', { 'icon-button--active': props.active }]"
    :title="props.title"
    :aria-label="props.title"
    @click="handleClick"
  >
    <span class="icon-button__icon" aria-hidden="true" v-html="ICON_MAP[props.icon]" />
  </button>
</template>

<style scoped lang="less">
.icon-button {
  width: var(--icon-button-size);
  height: var(--icon-button-size);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-base);
  background-color: transparent;
  color: var(--text-primary);
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: var(--button-hover-bg);
  }

  &__icon {
    width: 100%;
    height: 100%;
    transform: scale(1.3);
    display: inline-flex;
    align-items: center;
    justify-content: center;

    :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  &.icon-button--active {
    background-color: var(--button-hover-bg);
    color: var(--color-brand);

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 40%;
      height: 2px;
      border-radius: 999px;
      background-color: var(--color-brand);
      transform: translateX(-50%);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand);
    outline-offset: 3px;
  }
}
</style>

