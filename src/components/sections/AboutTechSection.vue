<template>
  <section class="about-tech-section">
    <div class="about-section-head">
      <h2>技术栈</h2>
      <p>项目采用现代化的前端技术栈构建。</p>
    </div>
    <div class="about-tech-grid">
      <div class="about-tech-category">
        <h3>核心框架</h3>
        <ul class="about-tech-list">
          <li>Vue 3.5.22</li>
          <li>TypeScript 5.9.3</li>
          <li>Vite 7.1.14 (rolldown)</li>
          <li>Vue Router 4.6.3</li>
        </ul>
      </div>
      <div class="about-tech-category">
        <h3>编辑器</h3>
        <ul class="about-tech-list">
          <li>Monaco Editor 0.54.0</li>
          <li>monaco-editor-vue3 1.0.4</li>
        </ul>
      </div>
      <div class="about-tech-category">
        <h3>工具库</h3>
        <ul class="about-tech-list">
          <li>jsonrepair 3.13.1</li>
          <li>jsondiffpatch 0.7.3</li>
          <li>browser-image-compression 2.0.2</li>
          <li>exifr 7.1.3</li>
        </ul>
      </div>
      <div class="about-tech-category">
        <h3>样式</h3>
        <ul class="about-tech-list">
          <li>Less 4.4.2</li>
          <li>CSS Variables</li>
        </ul>
      </div>
    </div>
    <div class="about-tech-note">
      <p>
        <strong>说明：</strong>所有数据处理均在浏览器本地完成，不会上传任何数据到服务器。
        使用 IndexedDB 进行本地存储，数据仅保存在您的浏览器中。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang="less">
@import "@/styles/about-sections.less";

.about-tech-section {
  padding: 5.5rem 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  gap: 3.5rem;
}

.about-section-head {
  .about-section-head-mixin();
}

.about-tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.75rem;
  margin-top: 1rem;
}

.about-tech-category {
  .about-card-tech-mixin();
  padding: 2rem;
}


.about-tech-category h3 {
  margin: 0 0 1.25rem;
  font-size: 1.125rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.about-tech-list {
  margin: 0;
  padding-left: 1.5rem;
  display: grid;
  gap: 0.625rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.7;
}

.about-tech-list li {
  position: relative;
  padding-left: 0.25rem;
}

.about-tech-list li::marker {
  color: var(--brand-primary);
  font-weight: 600;
}

.about-tech-note {
  position: relative;
  padding: 2rem 2.25rem;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--brand-primary) 10%, transparent),
    color-mix(in srgb, var(--brand-primary) 8%, transparent)
  );
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent);
  box-shadow: 
    0 4px 24px color-mix(in srgb, var(--brand-primary) 8%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--brand-primary) 15%, transparent);
  backdrop-filter: blur(16px);
  overflow: hidden;
}

.about-tech-note p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.75;
  color: var(--text-secondary);
}

.about-tech-note strong {
  color: var(--text-primary);
  font-weight: 600;
}

@media (max-width: 1024px) {
  .about-tech-section {
    gap: 3rem;
  }

  .about-tech-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 640px) {
  .about-tech-section {
    padding: 4rem 1.2rem;
    gap: 2.5rem;
  }


  .about-tech-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .about-tech-category {
    padding: 1.75rem;
  }

  .about-tech-note {
    padding: 1.75rem 2rem;
  }
}
</style>

