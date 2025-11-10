<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    icon:
      | 'swap'
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
      v-if="props.icon === 'swap'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 7h10" />
      <polyline points="14 4 17 7 14 10" />
      <path d="M17 17H7" />
      <polyline points="10 14 7 17 10 20" />
    </svg>

    <svg
      v-else-if="props.icon === 'diff'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="5" y="5" width="6" height="14" rx="1.6" />
      <rect x="13" y="5" width="6" height="14" rx="1.6" />
      <path d="M9 9h-1.5" />
      <path d="M9 12h-1.5" />
      <path d="M9 15h-1.5" />
      <path d="M16 9h-1.5" />
      <path d="M16 12h-1.5" />
      <path d="M16 15h-1.5" />
    </svg>

    <svg
      v-else-if="props.icon === 'import'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 4v10" />
      <polyline points="9.5 11.5 12 14 14.5 11.5" />
      <path d="M5 18h14" />
      <path d="M7 19.5h10" />
    </svg>

    <svg
      v-else-if="props.icon === 'export'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 20V10" />
      <polyline points="14.5 12.5 12 10 9.5 12.5" />
      <path d="M5 6h14" />
      <path d="M7 4.5h10" />
    </svg>

    <svg
      v-else-if="props.icon === 'format'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M9 5c-2 0-3 1.5-3 3v1c0 1.2-.8 2.1-2 2.5 1.2.4 2 1.3 2 2.5v1c0 1.5 1 3 3 3"
      />
      <path
        d="M15 5c2 0 3 1.5 3 3v1c0 1.2.8 2.1 2 2.5-1.2.4-2 1.3-2 2.5v1c0 1.5-1 3-3 3"
      />
    </svg>

    <svg
      v-else-if="props.icon === 'minify'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points="6 7 12 13 18 7" />
      <polyline points="6 17 12 11 18 17" />
      <line x1="4.5" y1="19" x2="19.5" y2="19" />
      <line x1="4.5" y1="5" x2="19.5" y2="5" />
    </svg>

    <svg
      v-else-if="props.icon === 'repair'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M19 4.5a4 4 0 0 1-4.6 4.3l-8.9 8.9 2.8 2.8 8.9-8.9A4 4 0 0 1 21 14"
      />
      <path d="M5.5 17.5 3 20l1 .9L6.5 18" />
    </svg>

    <svg
      v-else-if="props.icon === 'clear'"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 5h6" />
      <path d="M5 7h14" />
      <path d="M8 7v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7" />
      <line x1="10" y1="10" x2="10" y2="16" />
      <line x1="14" y1="10" x2="14" y2="16" />
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
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(15, 23, 42, 0.65);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(2, 6, 23, 0.35);
}

.icon-button svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.icon-button--ghost:hover {
  border-color: rgba(56, 189, 248, 0.7);
  color: #38bdf8;
  box-shadow: 0 8px 18px rgba(56, 189, 248, 0.18);
}

.icon-button--ghost.icon-button--active {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.9);
  box-shadow: 0 10px 24px rgba(56, 189, 248, 0.32);
}

.icon-button--primary {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.85), rgba(56, 189, 248, 0.9));
  border: none;
  color: #0b1120;
}

.icon-button--primary svg {
  stroke-width: 1.8;
}

.icon-button--primary:hover {
  filter: brightness(1.08);
  box-shadow: 0 10px 22px rgba(56, 189, 248, 0.28);
}

.icon-button--primary.icon-button--active {
  filter: brightness(1.12);
  box-shadow: 0 12px 26px rgba(56, 189, 248, 0.34);
}

.icon-button:focus-visible {
  outline: 2px solid rgba(56, 189, 248, 0.85);
  outline-offset: 3px;
}
</style>

