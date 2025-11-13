<template>
  <header class="app-header">
    <div class="app-header-inner">
      <RouterLink class="brand-link" to="/">
        <SiteLogo class="brand-logo" />
        <div class="brand-text">
          <span class="brand-name">Byte JSON</span>
          <span class="brand-subtitle">轻量 JSON 工具 · 专注体验</span>
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
import { computed } from "vue";
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
  { type: "internal", label: "产品介绍", path: "/product" },
  { type: "external", label: "关于", url: "https://byteout.cn/about" },
  { type: "external", label: "Byteout", url: "https://byteout.cn" },
]);

const route = useRoute();

const isActive = (item: NavItem) => item.type === "internal" && route.path === item.path;
</script>

<style scoped lang="less">
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(18px);
  background: color-mix(in srgb, var(--surface-strong) 90%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--border) 20%, transparent);
}

.app-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0.85rem 1.75rem;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  text-decoration: none;
}

.brand-logo {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.brand-text {
  display: grid;
  gap: 0.2rem;
}

.brand-name {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-primary);
}

.brand-subtitle {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-nav {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  transition:
    color 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--brand-primary) 45%, transparent);
}

.nav-link.external:hover {
  background: transparent;
  box-shadow: none;
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 4px;
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
  padding: 0.55rem 1.4rem;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  color: #fff;
  background: var(--brand-gradient);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.launch-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(45, 112, 250, 0.25);
}

@media (max-width: 980px) {
  .app-nav {
    display: none;
  }

  .launch-button {
    padding: 0.5rem 1.1rem;
  }
}

@media (max-width: 640px) {
  .app-header-inner {
    padding: 0.75rem 1.2rem;
    gap: 1rem;
  }

  .brand-logo {
    width: 42px;
    height: 42px;
  }

  .brand-name {
    font-size: 1.05rem;
  }

  .brand-subtitle {
    font-size: 0.72rem;
  }
}
</style>

