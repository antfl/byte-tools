<template>
  <footer class="app-footer">
    <div class="app-footer-inner">
      <div class="footer-brand">
        <SiteLogo class="footer-logo" />
        <div class="footer-brand-text">
          <p class="footer-brand-name">Byte JSON</p>
          <p class="footer-brand-desc">在线 JSON 工具 · 让结构化数据处理更简单</p>
        </div>
      </div>
      <div class="footer-meta">
        <p>© {{ year }} Byte JSON. 保留所有权利。</p>
        <p>
          <a href="https://github.com/antfl" target="_blank" rel="noreferrer">GitHub</a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import SiteLogo from "@/components/base/SiteLogo.vue";

const year = new Date().getFullYear();
</script>

<style scoped>
.app-footer {
  padding: 3rem 1.5rem 2.2rem;
  border-top: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
  background: color-mix(in srgb, var(--surface-strong) 94%, transparent);
}

.app-footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  color: var(--text-tertiary);
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-logo {
  width: 44px;
  height: 44px;
}

.footer-brand-text {
  display: grid;
  gap: 0.25rem;
}

.footer-brand-name {
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-secondary);
}

.footer-brand-desc {
  margin: 0;
  font-size: 0.85rem;
}

.footer-meta {
  display: grid;
  gap: 0.45rem;
  font-size: 0.88rem;
  line-height: 1.6;
}

.footer-meta a {
  color: var(--brand-primary);
  text-decoration: none;
}

.footer-meta a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .app-footer {
    padding: 2.5rem 1.2rem 2rem;
  }

  .footer-brand {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

