<template>
  <button class="theme-toggle" type="button" @click="toggleTheme">
    <span class="sr-only">切换主题</span>
    <svg
      v-if="currentTheme === 'dark'"
      class="moon-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
    <svg
      v-else
      class="sun-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "@/composables/useTheme";

const { theme, toggleTheme } = useTheme();
const currentTheme = computed(() => theme.value);
</script>

<style scoped>
.theme-toggle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
  background: color-mix(in srgb, var(--surface) 80%, transparent);
  cursor: pointer;
  transition: all 0.25s ease;
  color: var(--text-secondary);
}

.theme-toggle:hover {
  transform: translateY(-1px);
  color: var(--text-primary);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
}

.theme-toggle svg {
  width: 1.35rem;
  height: 1.35rem;
}

.moon-icon,
.sun-icon {
  width: 1.3rem;
  height: 1.3rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

