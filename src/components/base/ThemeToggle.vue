<template>
  <button class="theme-toggle" type="button" @click="toggleTheme">
    <span class="sr-only">切换主题</span>
    <Moon v-if="currentTheme === 'dark'" class="moon-icon" :size="20" aria-hidden="true" />
    <Sun v-else class="sun-icon" :size="20" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Moon, Sun } from "lucide-vue-next";
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

