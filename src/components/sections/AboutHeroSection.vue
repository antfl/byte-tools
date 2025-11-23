<template>
  <section class="about-hero-section">
    <div class="about-hero-background">
      <div class="about-hero-gradient-orb about-hero-gradient-orb-1"></div>
      <div class="about-hero-gradient-orb about-hero-gradient-orb-2"></div>
      <div class="about-hero-gradient-orb about-hero-gradient-orb-3"></div>
    </div>
    <div class="about-hero-inner">
      <div class="about-hero-content">
        <div class="about-hero-title-section">
          <h1 class="about-hero-title">
            <span class="about-hero-title-first">一个简单实用的</span>
            <span class="about-hero-title-second">在线工具集</span>
          </h1>
        </div>
        <div class="about-hero-description">
          <p class="about-hero-text">
            基于 Monaco Editor 提供代码编辑体验，支持本地存储，帮助开发者快速处理日常工作中的数据。
          </p>
        </div>
        <div class="about-hero-actions">
          <RouterLink class="about-hero-btn about-hero-btn-primary" to="/">
            开始使用
          </RouterLink>
          <a
            class="about-hero-btn about-hero-btn-secondary"
            href="https://github.com/antfl"
            target="_blank"
            rel="noopener"
          >
            访问 Github
          </a>
        </div>
      </div>

      <div class="about-hero-visual">
        <div class="about-hero-visual-content">
          <p class="about-hero-visual-text">
            Byte Tools 是一个专注于 <span class="about-hero-highlight">JSON、文本和图片处理</span> 的在线工具平台。
          </p>
        </div>
        <div class="about-hero-preview-wrapper">
          <div class="about-hero-preview-glow"></div>
          <img
            v-if="effectiveTheme === 'light'"
            class="about-hero-preview"
            :src="previewLight"
            alt="Byte Tools Preview"
          />
          <img
            v-else
            class="about-hero-preview"
            :src="previewDark"
            alt="Byte Tools Preview"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useTheme } from "@/composables/useTheme";
import previewLight from "@/assets/preview-light.png";
import previewDark from "@/assets/preview-dark.png";

const { effectiveTheme } = useTheme();
</script>

<style scoped lang="less">
.about-hero-section {
  position: relative;
  margin-top: 0;
  padding: 8rem 1.75rem 6rem;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  min-height: 85vh;
  display: flex;
  align-items: center;
}

.about-hero-background {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--brand-primary) 10%, transparent), transparent 50%),
    radial-gradient(circle at 80% 20%, color-mix(in srgb, var(--brand-accent) 8%, transparent), transparent 50%),
    radial-gradient(circle at 50% 80%, color-mix(in srgb, var(--brand-primary) 10%, transparent), transparent 55%);
  opacity: 1;
  pointer-events: none;
}

.about-hero-gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  pointer-events: none;
}

.about-hero-gradient-orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 30%, transparent), transparent 70%);
  top: 10%;
  left: 10%;
}

.about-hero-gradient-orb-2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-accent) 25%, transparent), transparent 70%);
  top: 50%;
  right: 15%;
}

.about-hero-gradient-orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 20%, transparent), transparent 70%);
  bottom: 15%;
  left: 50%;
}

.about-hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.75rem;
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: clamp(4rem, 8vw, 7rem);
  align-items: center;
}

.about-hero-content {
  display: grid;
  gap: 2.75rem;
  max-width: 100%;
}

.about-hero-title-section {
  position: relative;
  display: grid;
  gap: 0.875rem;
}

.about-hero-title {
  margin: 0;
  font-size: clamp(2rem, 6vw, 3rem);
  line-height: 1.4;
  font-weight: 400;
  letter-spacing: -0.04em;
  color: var(--text-primary);
}

.about-hero-title-first {
  display: inline;
}

.about-hero-title-second {
  display: inline;
}

.about-hero-description {
  display: grid;
  gap: 1.375rem;
  max-width: 100%;
}

.about-hero-text {
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.85;
  color: var(--text-secondary);
  font-weight: 400;
}

.about-hero-highlight {
  color: var(--text-primary);
  font-weight: 500;
  position: relative;
  background: linear-gradient(
    135deg,
    var(--brand-primary),
    var(--brand-accent)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.about-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-top: 0.5rem;
}

.about-hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1.6rem;
  border-radius: 999px;
  font-weight: 400;
  font-size: 0.95rem;
  text-decoration: none;
  border: 1.5px solid color-mix(in srgb, var(--border) 35%, transparent);
  color: var(--text-primary);
  background: color-mix(in srgb, var(--surface) 75%, transparent);
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 12px color-mix(in srgb, var(--border) 10%, transparent),
    0 1px 3px color-mix(in srgb, var(--border) 6%, transparent);
  position: relative;
  overflow: hidden;
}

.about-hero-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--brand-primary) 8%, transparent),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.about-hero-btn:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
  box-shadow: 
    0 8px 24px color-mix(in srgb, var(--brand-accent) 15%, transparent),
    0 3px 8px color-mix(in srgb, var(--brand-accent) 10%, transparent);
}

.about-hero-btn:hover::before {
  opacity: 1;
}

.about-hero-btn-primary {
  border: 1.5px solid var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 15%, transparent);
  color: var(--brand-primary);
  padding: 0.7rem 1.6rem;
  font-size: 0.95rem;
  font-weight: 400;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none;
}

.about-hero-btn-primary::before {
  display: none;
}

.about-hero-btn-primary:hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--brand-primary) 15%, transparent);
}

.about-hero-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
}

.about-hero-visual-content {
  width: 100%;
}

.about-hero-visual-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-secondary);
  font-weight: 400;
}

.about-hero-preview-wrapper {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.about-hero-preview-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--brand-primary) 20%, transparent),
    transparent 70%
  );
  filter: blur(40px);
  opacity: 0.6;
  z-index: -1;
  border-radius: 50%;
}

.about-hero-preview {
  width: 100%;
  height: auto;
  border-radius: 5px;
  transform: translateY(-4px) scale(1.01);
  box-shadow: 
    0 28px 80px color-mix(in srgb, var(--brand-primary) 20%, transparent),
    0 12px 32px color-mix(in srgb, var(--brand-primary) 15%, transparent),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 25%, transparent);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
  position: relative;
  z-index: 1;
}


@media (max-width: 1024px) {
  .about-hero-section {
    padding: 6rem 1.75rem 4.5rem;
    min-height: auto;
  }

  .about-hero-inner {
    grid-template-columns: 1fr;
    gap: 4rem;
    text-align: center;
  }

  .about-hero-content {
    max-width: 100%;
    margin: 0 auto;
    gap: 2.25rem;
  }

  .about-hero-text {
    max-width: 100%;
  }

  .about-hero-actions {
    justify-content: center;
  }

  .about-hero-visual {
    padding-top: 1.5rem;
    align-items: center;
  }

  .about-hero-visual-text {
    text-align: center;
  }

  .about-hero-gradient-orb-1,
  .about-hero-gradient-orb-2,
  .about-hero-gradient-orb-3 {
    width: 250px;
    height: 250px;
  }
}

@media (max-width: 640px) {
  .about-hero-section {
    padding: 5rem 0 3.5rem;
  }

  .about-hero-inner {
    padding: 0 1.2rem;
    gap: 3rem;
  }

  .about-hero-content {
    gap: 2rem;
  }

  .about-hero-title {
    font-size: clamp(1.75rem, 7vw, 2.5rem);
    gap: 0.375rem;
  }

  .about-hero-text {
    font-size: 1.05rem;
    line-height: 1.8;
  }

  .about-hero-btn {
    padding: 0.65rem 1.4rem;
    font-size: 0.9rem;
  }

  .about-hero-preview {
    border-radius: 5px;
  }

  .about-hero-preview-glow {
    inset: -15px;
    filter: blur(30px);
  }
}
</style>

