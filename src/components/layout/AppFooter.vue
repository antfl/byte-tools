<template>
  <footer class="app-footer">
    <div class="app-footer-inner">
      <div class="footer-brand">
        <SiteLogo class="footer-logo" />
        <div class="footer-brand-text">
          <p class="footer-brand-name">Byte Tools</p>
          <div class="footer-brand-desc-wrapper">
            <p class="footer-brand-desc">多功能在线工具 · 让数据处理更简单</p>
            <p class="footer-copyright">© {{ year }} Byte Tools. 保留所有权利。</p>
          </div>
        </div>
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
  padding: 2rem 1.5rem 1.5rem;
  border-top: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
  background: color-mix(in srgb, var(--surface) 60%, transparent);
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
  width: 36px;
  height: 36px;
}

.footer-brand-text {
  display: grid;
  gap: 0.25rem;
  flex: 1;
}

.footer-brand-name {
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.footer-brand-desc-wrapper {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.footer-brand-desc {
  margin: 0;
  font-size: 0.8rem;
}

.footer-copyright {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

@media (max-width: 640px) {
  .app-footer {
    padding: 1.75rem 1.2rem 1.25rem;
  }

  .footer-brand {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.875rem;
  }

  .footer-brand-desc-wrapper {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>

