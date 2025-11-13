<template>
  <section id="hero" class="hero-section">
    <div class="hero-background"></div>
    <div class="hero-inner">
      <div class="hero-content">
        <span class="hero-badge">JSON 工具 · Byte JSON</span>
        <h1 class="hero-title">为开发者打造的高效率 JSON 工具</h1>
        <p class="hero-subtitle">
          Byte JSON 集成格式化、压缩、修复、对比与导入导出功能，基于 Monaco Editor 提供专业的代码编辑体验。支持本地存储，实时预览，让你高效处理 JSON 数据。
        </p>
        <div class="hero-actions">
          <RouterLink class="hero-action hero-action-primary" to="/">开始使用</RouterLink>
          <a class="hero-action" href="https://github.com/antfl" target="_blank" rel="noopener">
            访问 GitHub
          </a>
        </div>
        <dl class="hero-metrics" aria-label="产品功能指标">
          <div class="hero-metric-item">
            <dt>核心功能</dt>
            <dd>6+ 工具</dd>
          </div>
          <div class="hero-metric-item">
            <dt>编辑器</dt>
            <dd>Monaco</dd>
          </div>
          <div class="hero-metric-item">
            <dt>数据存储</dt>
            <dd>本地缓存</dd>
          </div>
        </dl>
      </div>

      <div class="hero-visual">
        <div class="hero-logo-card">
          <SiteLogo />
          <div class="hero-logo-info">
            <p>Byte JSON</p>
            <span>专业的 JSON 处理工具</span>
          </div>
        </div>
        <div class="hero-screenshot-frame">
          <pre class="hero-code-preview"><code><span class="json-brace">{</span>
  <span class="json-key">"name"</span>: <span class="json-string">"Byte JSON"</span>,
  <span class="json-key">"description"</span>: <span class="json-string">"专业的 JSON 工具"</span>,
  <span class="json-key">"features"</span>: <span class="json-brace">{</span>
    <span class="json-key">"format"</span>: <span class="json-string">"格式化 JSON 数据"</span>,
    <span class="json-key">"minify"</span>: <span class="json-string">"压缩为单行"</span>,
    <span class="json-key">"repair"</span>: <span class="json-string">"自动修复错误"</span>,
    <span class="json-key">"diff"</span>: <span class="json-string">"差异对比"</span>,
    <span class="json-key">"import"</span>: <span class="json-string">"文件导入"</span>,
    <span class="json-key">"export"</span>: <span class="json-string">"文件导出"</span>
  <span class="json-brace">}</span>,
  <span class="json-key">"editor"</span>: <span class="json-string">"Monaco Editor"</span>,
  <span class="json-key">"storage"</span>: <span class="json-string">"本地缓存"</span>
<span class="json-brace">}</span></code></pre>
        </div>
        <div class="hero-floating-card">
          <p class="hero-floating-title">专业编辑器</p>
          <p class="hero-floating-desc">基于 Monaco Editor，提供语法高亮、代码折叠、实时预览等专业功能。</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import SiteLogo from "@/components/base/SiteLogo.vue";
</script>

<style scoped>
.hero-section {
  position: relative;
  margin-top: 0;
  padding: 5.5rem 1.5rem 4.5rem;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.hero-background {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 20%, rgba(59, 130, 255, 0.25), transparent 55%),
    radial-gradient(circle at 85% 15%, rgba(37, 102, 248, 0.18), transparent 50%),
    radial-gradient(circle at 50% 90%, rgba(71, 131, 255, 0.22), transparent 60%);
  opacity: 0.9;
  pointer-events: none;
  animation: hero-pulse 12s ease-in-out infinite alternate;
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: center;
}

.hero-content {
  display: grid;
  gap: 1.6rem;
}

.hero-badge {
  width: fit-content;
  padding: 0.45rem 1.1rem;
  border-radius: 999px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--border) 45%, transparent);
}

.hero-title {
  margin: 0;
  font-size: clamp(1.8rem, 5vw, 2.7rem);
  line-height: 1.35;
  font-weight: 500;
}

.hero-subtitle {
  margin: 0;
  max-width: 36rem;
  font-size: 1.05rem;
  line-height: 1.75;
  color: var(--text-secondary);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: center;
}

.hero-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.78rem 1.6rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.98rem;
  text-decoration: none;
  border: 1px solid color-mix(in srgb, var(--border) 55%, transparent);
  color: var(--text-primary);
  background: color-mix(in srgb, var(--surface) 80%, transparent);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.hero-action:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--brand-primary) 38%, transparent);
  box-shadow: 0 16px 32px rgba(37, 99, 235, 0.14);
}

.hero-action-primary {
  border: none;
  background: var(--brand-gradient);
  color: #fff;
  box-shadow: 0 24px 48px rgba(79, 70, 229, 0.28);
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.2rem;
  margin: 0;
}

.hero-metric-item {
  display: grid;
  gap: 0.45rem;
}

.hero-metric-item dt {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-tertiary);
}

.hero-metric-item dd {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.hero-visual {
  position: relative;
  display: grid;
  gap: 1.6rem;
  align-content: start;
}

.hero-logo-card {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.2rem 1.4rem;
  border-radius: 20px;
  background: color-mix(in srgb, var(--surface-strong) 86%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
  box-shadow: var(--shadow-soft);
  animation: float-up 10s ease-in-out infinite;
}

.hero-logo-info {
  display: grid;
  gap: 0.3rem;
}

.hero-logo-info p {
  margin: 0;
  font-weight: 600;
  color: var(--text-primary);
}

.hero-logo-info span {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.hero-screenshot-frame {
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface-card);
  border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
}

.hero-code-preview {
  margin: 0;
  padding: 1.5rem;
  background: var(--surface-card);
  border-radius: 8px;
  overflow-x: auto;
  font-family: var(--font-code);
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-primary);
}

.hero-code-preview code {
  display: block;
  white-space: pre;
  color: inherit;
}

.hero-code-preview .json-key {
  color: var(--brand-primary);
}

.hero-code-preview .json-string {
  color: #fbbf24;
}

[data-theme='light'] .hero-code-preview .json-string {
  color: #ca8a04;
}

.hero-code-preview .json-brace {
  color: var(--text-secondary);
  font-weight: 500;
}

.hero-floating-card {
  position: absolute;
  top: -3.5rem;
  right: -0.2rem;
  padding: 0.9rem 1.2rem;
  border-radius: 16px;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 55%, transparent);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  max-width: 220px;
  animation: float-card 9s ease-in-out infinite;
}

.hero-floating-title {
  margin: 0 0 0.35rem;
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--text-primary);
}

.hero-floating-desc {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

@keyframes hero-pulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);
  }
}

@keyframes float-up {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes float-card {
  0% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-10px) translateX(-6px);
  }
  100% {
    transform: translateY(0) translateX(0);
  }
}

@media (max-width: 960px) {
  .hero-section {
    padding: 4.5rem 1.2rem 3.8rem;
  }

  .hero-floating-card {
    position: relative;
    top: 0;
    right: 0;
    margin-top: -1rem;
  }
}

@media (max-width: 640px) {
  .hero-section {
    padding: 4rem 1.1rem 3.5rem;
  }

  .hero-title {
    font-size: clamp(2.2rem, 7vw, 2.6rem);
  }

  .hero-code-preview {
    font-size: 0.8rem;
    padding: 1.2rem;
  }
}
</style>

