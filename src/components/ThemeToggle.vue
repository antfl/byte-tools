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
    <svg v-else viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.25a.75.75 0 0 1 .74.64l.02.11v1.5a.75.75 0 0 1-1.49.11l-.01-.11v-1.5a.75.75 0 0 1 .75-.75Zm5.66 2.12a.75.75 0 0 1 1.05 1.07l-1.06 1.05a.75.75 0 0 1-1.16-.95l.08-.1 1.09-1.07ZM12 7.25a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5Zm0 1.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5ZM5 11.25a.75.75 0 0 1 .11 1.49L5 12.75H3.5a.75.75 0 0 1-.11-1.49l.11-.01H5Zm15.5 0a.75.75 0 0 1 .11 1.49l-.11.01H19a.75.75 0 0 1-.11-1.49L19 11.25h1.5Zm-2.62 6.02a.75.75 0 0 1 1.05 1.07l-1.06 1.05a.75.75 0 0 1-1.16-.95l.08-.1 1.09-1.07ZM12 18.75a.75.75 0 0 1 .74.64l.02.11v1.5a.75.75 0 0 1-1.49.11l-.01-.11v-1.5a.75.75 0 0 1 .75-.75Zm-6.11-1.48.09.1a.75.75 0 0 1-.95 1.16l-1.1-1.07a.75.75 0 0 1 1.03-1.1l.08.08 1.05 1.07ZM7.5 5.22a.75.75 0 0 1 1.05 1.07L7.5 7.34a.75.75 0 0 1-1.16-.95l.08-.1 1.09-1.07Z"
        fill="currentColor"
      />
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

.moon-icon {
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

