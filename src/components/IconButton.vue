<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    icon:
      | 'diff'
      | 'import'
      | 'export'
      | 'format'
      | 'minify'
      | 'repair'
      | 'clear'
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
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: none;
  background-color: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.icon-button__icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.icon-button--ghost {
  color: var(--text-primary);
}

.icon-button--ghost:hover,
.icon-button--ghost.icon-button--active {
  background-color: var(--surface-card);
  color: var(--color-brand);
}

.icon-button--primary {
  background-color: var(--accent-surface);
  color: var(--color-brand);
}

.icon-button--primary:hover,
.icon-button--primary.icon-button--active {
  background-color: var(--color-brand);
  color: var(--text-contrast);
}

.icon-button:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
}
</style>

