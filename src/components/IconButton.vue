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
    <svg
      v-if="props.icon === 'diff'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="4" width="6" height="16" rx="2" />
      <rect x="14" y="4" width="6" height="16" rx="2" />
      <path d="M7 9h2" />
      <path d="M7 12h2" />
      <path d="M7 15h2" />
      <path d="M16 9h2" />
      <path d="M16 12h2" />
      <path d="M16 15h2" />
    </svg>

    <svg
      v-else-if="props.icon === 'import'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5v9" />
      <polyline points="8.5 11.5 12 15 15.5 11.5" />
      <path d="M5 19h14" />
    </svg>

    <svg
      v-else-if="props.icon === 'export'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 19v-9" />
      <polyline points="8.5 12.5 12 9 15.5 12.5" />
      <path d="M5 5h14" />
    </svg>

    <svg
      v-else-if="props.icon === 'format'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 6H6.5a1.5 1.5 0 0 0-1.5 1.5v2c0 .8-.5 1.5-1.5 1.5 1 0 1.5.7 1.5 1.5v2A1.5 1.5 0 0 0 6.5 16H8" />
      <path d="M16 6h1.5A1.5 1.5 0 0 1 19 7.5v2c0 .8.5 1.5 1.5 1.5-1 0-1.5.7-1.5 1.5v2a1.5 1.5 0 0 1-1.5 1.5H16" />
      <line x1="11" y1="6" x2="11" y2="18" />
      <line x1="13" y1="6" x2="13" y2="18" />
    </svg>

    <svg
      v-else-if="props.icon === 'minify'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 7h14" />
      <path d="M5 17h14" />
      <polyline points="9 9 6 12 9 15" />
      <polyline points="15 9 18 12 15 15" />
      <line x1="11" y1="12" x2="13" y2="12" />
    </svg>

    <svg
      v-else-if="props.icon === 'repair'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.5 6.5a4.5 4.5 0 0 1-5.6 5.4l-7.7 7.7-2.5-2.5 7.7-7.7A4.5 4.5 0 0 1 8.8 6" />
      <path d="M4.2 18.8 3 20" />
    </svg>

    <svg
      v-else-if="props.icon === 'clear'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 5h6" />
      <path d="M5 8h14" />
      <path d="M8 8v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8" />
      <line x1="11" y1="11" x2="11" y2="17" />
      <line x1="13" y1="11" x2="13" y2="17" />
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
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: none;
}

.icon-button svg {
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

.icon-button--ghost:hover {
  background: var(--surface-card);
  color: var(--color-brand);
  box-shadow: var(--shadow-accent-soft);
}

.icon-button--ghost.icon-button--active {
  background: var(--surface-card);
  color: var(--color-brand);
  box-shadow: var(--shadow-accent-medium);
}

.icon-button--primary {
  color: var(--color-brand);
}

.icon-button--primary:hover {
  background: linear-gradient(135deg, var(--color-brand-secondary), var(--color-brand));
  color: var(--text-contrast);
  box-shadow: var(--shadow-accent-medium);
}

.icon-button--primary.icon-button--active {
  background: linear-gradient(135deg, var(--color-brand-secondary), var(--color-brand));
  color: var(--text-contrast);
  box-shadow: var(--shadow-accent-strong);
}

.icon-button:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 3px;
}
</style>

