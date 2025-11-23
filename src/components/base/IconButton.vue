<script setup lang="ts">
import SvgIcon from './SvgIcon.vue'
import type { SvgIconName } from './SvgIcon.vue'

export type IconButtonIcon = SvgIconName

const props = withDefaults(
  defineProps<{
    icon: IconButtonIcon
    title: string
    active?: boolean
    showLabel?: boolean
  }>(),
  {
    active: false,
    showLabel: false
  }
)

const emit = defineEmits<{
  (event: 'click'): void
}>()

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <button
    type="button"
    :class="['icon-button', { 'icon-button--active': props.active, 'icon-button--with-label': props.showLabel }]"
    :title="props.title"
    :aria-label="props.title"
    v-bind="$attrs"
    @click="handleClick"
  >
    <SvgIcon :name="props.icon" class="icon-button__icon" :size="18" aria-hidden="true" />
    <span v-if="props.showLabel" class="icon-button__label">{{ props.title }}</span>
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
    flex-shrink: 0;

    :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  &__label {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }

  &--with-label {
    width: auto;
    height: var(--icon-button-size);
    padding: 0 8px;
    gap: 6px;

    .icon-button__icon {
      width: 18px;
      height: 18px;
      transform: scale(1);
      flex-shrink: 0;
    }
    
    .icon-button__label {
      margin-left: 0;
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

