<template>
  <header ref="headerRef" class="app-header" :style="{ '--header-opacity': headerOpacity }">
    <div class="app-header-inner">
      <RouterLink class="brand-link" to="/">
        <SiteLogo class="brand-logo" />
        <div class="brand-text">
          <span class="brand-name">Byte Tools</span>
          <span class="brand-subtitle">多功能在线工具 · 专注体验</span>
        </div>
      </RouterLink>

      <nav class="app-nav" aria-label="主导航">
        <template v-for="item in navItems" :key="item.label">
          <RouterLink
            v-if="item.type === 'internal'"
            :class="['nav-link', { active: isActive(item) }]"
            :to="{ path: item.path, hash: item.hash ?? '' }"
          >
            {{ item.label }}
          </RouterLink>
          <a
            v-else
            class="nav-link external"
            :href="item.url"
            target="_blank"
            rel="noopener"
          >
            {{ item.label }}
          </a>
        </template>
      </nav>

      <div class="header-actions">
        <ThemeToggle />
        <RouterLink class="launch-button" to="/">开始使用</RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import SiteLogo from "@/components/base/SiteLogo.vue";
import ThemeToggle from "@/components/base/ThemeToggle.vue";

interface InternalNavItem {
  type: "internal";
  label: string;
  path: string;
  hash?: string;
}

interface ExternalNavItem {
  type: "external";
  label: string;
  url: string;
}

type NavItem = InternalNavItem | ExternalNavItem;

const navItems = computed<NavItem[]>(() => [
  { type: "internal", label: "关于", path: "/about" },
  { type: "external", label: "联系", url: "https://byteout.cn/contact" },
  { type: "external", label: "Byteout", url: "https://byteout.cn" },
]);

const route = useRoute();

const isActive = (item: NavItem) => item.type === "internal" && route.path === item.path;

const scrollY = ref(0);
const headerRef = ref<HTMLElement | null>(null);

function handleScroll() {
  scrollY.value = window.scrollY;
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const headerOpacity = computed(() => {
  const maxScroll = 100;
  const opacity = Math.min(scrollY.value / maxScroll, 1);
  return opacity * 0.65;
});
</script>

<style scoped lang="less">
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(24px) saturate(180%);
  background: color-mix(in srgb, var(--surface) calc(var(--header-opacity, 0) * 100%), transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--border) calc(var(--header-opacity, 0) * 20%), transparent);
  transition: background 0.2s ease, border-color 0.2s ease, backdrop-filter 0.2s ease;
  box-shadow: 0 1px 0 color-mix(in srgb, var(--border) calc(var(--header-opacity, 0) * 12%), transparent);
}

.app-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.5rem 1.75rem;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.brand-logo {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.brand-text {
  display: grid;
  gap: 0.2rem;
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-primary);
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-nav {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  transition:
    color 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.nav-link:hover {
  color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--brand-primary) 45%, transparent);
}

.nav-link.active {
  color: #fff;
  background: var(--brand-gradient);
  padding: 0.4rem 0.85rem;
  font-weight: 400;
  box-shadow: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nav-link.active:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px color-mix(in srgb, var(--brand-primary) 25%, transparent);
}

.nav-link.external:hover {
  background: transparent;
  box-shadow: none;
  color: var(--brand-primary);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.launch-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font-weight: 400;
  font-size: 0.9rem;
  text-decoration: none;
  color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 15%, transparent);
  border: 1.5px solid var(--brand-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.launch-button:hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--brand-primary) 15%, transparent);
}

@media (max-width: 980px) {
  .app-nav {
    display: none;
  }

  .launch-button {
    padding: 0.4rem 0.85rem;
  }
}

@media (max-width: 640px) {
  .app-header-inner {
    padding: 0.5rem 1.2rem;
    gap: 0.875rem;
  }

  .brand-logo {
    width: 36px;
    height: 36px;
  }

  .brand-name {
    font-size: 1rem;
  }

  .brand-subtitle {
    font-size: 0.7rem;
  }
}
</style>

