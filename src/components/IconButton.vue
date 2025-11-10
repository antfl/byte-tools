<script setup lang="ts">
type IconButtonIcon =
  | 'diff'
  | 'import'
  | 'export'
  | 'format'
  | 'minify'
  | 'repair'
  | 'clear'
  | 'sun'
  | 'moon'

export type { IconButtonIcon }

const props = withDefaults(
  defineProps<{
    icon: IconButtonIcon
    title: string
    variant?: 'ghost' | 'primary'
    active?: boolean
  }>(),
  {
    variant: 'ghost',
    active: false
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
    :class="['icon-button', `icon-button--${props.variant}`, { 'icon-button--active': props.active }]"
    :title="props.title"
    :aria-label="props.title"
    @click="handleClick"
  >
    <svg class="icon-button__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <use :href="`#icon-${props.icon}`" :xlink:href="`#icon-${props.icon}`" />
    </svg>
  </button>
</template>

<style scoped>
.icon-button {
  width: var(--icon-button-size);
  height: var(--icon-button-size);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-base);
  border: none;
  background-color: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.icon-button__icon {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  transform: scale(1.5);
  transform-origin: center;
}

.icon-button--ghost {
  color: var(--text-primary);
}

.icon-button--ghost:hover {
  background-color: var(--button-hover-bg);
}

.icon-button--ghost.icon-button--active {
  background-color: var(--button-active-bg);
  color: var(--button-active-color);
}

.icon-button--primary {
  background-color: var(--accent-surface);
  color: var(--color-brand);
}

.icon-button--primary:hover,
.icon-button--primary.icon-button--active {
  background-color: var(--button-active-bg);
  color: var(--button-active-color);
}

.icon-button:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
}
</style>

