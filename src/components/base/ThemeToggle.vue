<template>
  <div class="theme-toggle-wrapper" ref="wrapperRef">
    <IconButton
      :icon="currentIcon"
      :title="themeToggleTitle"
      @click="toggleDropdown"
    />
    <Teleport to="body">
      <Transition name="dropdown">
        <div
          v-if="dropdownVisible"
          ref="dropdownRef"
          class="theme-dropdown"
          :style="{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }"
          @click.stop
        >
          <button
            v-for="option in themeOptions"
            :key="option.value"
            :class="['theme-option', { 'theme-option--active': theme === option.value }]"
            @click="selectTheme(option.value)"
          >
            <component :is="option.icon" class="theme-option-icon" :size="18" />
            <span class="theme-option-label">{{ option.label }}</span>
            <Check v-if="theme === option.value" class="theme-option-check" :size="16" />
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { Sun, Moon, Monitor, Check } from "lucide-vue-next";
import IconButton from "./IconButton.vue";
import { useTheme } from "@/composables/useTheme";
import type { ThemeMode } from "@/types/jsonTools";
import type { IconButtonIcon } from "./IconButton.vue";

const { theme, effectiveTheme, themeToggleTitle, setTheme } = useTheme();

const dropdownVisible = ref(false);
const wrapperRef = ref<HTMLDivElement | null>(null);
const dropdownRef = ref<HTMLDivElement | null>(null);
const dropdownPosition = ref({ top: 0, left: 0 });

const themeOptions = [
  { value: 'light' as ThemeMode, label: '浅色', icon: Sun },
  { value: 'dark' as ThemeMode, label: '深色', icon: Moon },
  { value: 'system' as ThemeMode, label: '系统', icon: Monitor }
];

const currentIcon = computed<IconButtonIcon>(() => {
  if (theme.value === 'system') {
    return 'monitor';
  }
  return effectiveTheme.value === 'dark' ? 'moon' : 'sun';
});

function updateDropdownPosition() {
  if (!wrapperRef.value || !dropdownRef.value) return;
  
  const buttonRect = wrapperRef.value.getBoundingClientRect();
  const dropdownWidth = dropdownRef.value.offsetWidth || 140;
  const dropdownHeight = dropdownRef.value.offsetHeight || 120;
  
  const centerX = buttonRect.left + buttonRect.width / 2;
  const left = centerX - dropdownWidth / 2;
  const top = buttonRect.top - dropdownHeight - 8;
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 8;
  
  dropdownPosition.value = {
    top: Math.max(padding, Math.min(top, viewportHeight - dropdownHeight - padding)),
    left: Math.max(padding, Math.min(left, viewportWidth - dropdownWidth - padding))
  };
}

async function toggleDropdown() {
  dropdownVisible.value = !dropdownVisible.value;
  if (dropdownVisible.value) {
    await nextTick();
    updateDropdownPosition();
  }
}

function selectTheme(mode: ThemeMode) {
  setTheme(mode);
  dropdownVisible.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node) &&
      dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    dropdownVisible.value = false;
  }
}

function handleResize() {
  if (dropdownVisible.value) {
    updateDropdownPosition();
  }
}

watch(dropdownVisible, async (visible) => {
  if (visible) {
    await nextTick();
    updateDropdownPosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
  } else {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleResize, true);
  }
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleResize, true);
});
</script>

<style scoped>
.theme-toggle-wrapper {
  position: relative;
  display: inline-block;
}
</style>

<style>
.theme-dropdown {
  position: fixed;
  min-width: 140px;
  padding: 4px;
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-soft);
  z-index: 99999;
  overflow: hidden;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: var(--radius-base);
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background: var(--button-hover-bg);
  color: var(--color-brand);
}

.theme-option--active {
  background: color-mix(in srgb, var(--color-brand) 12%, transparent);
  color: var(--color-brand);
}

.theme-option-icon {
  flex-shrink: 0;
  color: inherit;
}

.theme-option-label {
  flex: 1;
  user-select: none;
}

.theme-option-check {
  flex-shrink: 0;
  color: var(--color-brand);
}

.dropdown-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
