<template>
  <section class="about-tools-section">
    <div class="about-section-head">
      <h2>功能详情</h2>
      <p>以下是各工具模块的具体功能说明。</p>
    </div>
    <div class="about-tools-list">
      <article
        v-for="tool in tools"
        :key="tool.category"
        class="about-tool-item"
      >
        <h3 class="about-tool-category">{{ tool.category }}</h3>
        <ul class="about-tool-features">
          <li v-for="feature in tool.features" :key="feature">
            {{ feature }}
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const tools = [
  {
    category: "JSON 工具",
    features: [
      "格式化：将 JSON 数据格式化为可读格式，支持自定义缩进（默认 2 空格）",
      "压缩：将格式化的 JSON 压缩为单行，节省空间",
      "修复：使用 jsonrepair 尝试修复常见的 JSON 错误（如缺失引号、尾随逗号等）",
      "差异对比：并排对比两个 JSON 文件，使用 jsondiffpatch 高亮显示差异",
      "本地存储：使用 IndexedDB 保存常用 JSON 片段，支持导入导出",
    ],
  },
  {
    category: "文本工具",
    features: [
      "大小写转换：支持全大写、全小写、标题格式、驼峰命名、帕斯卡命名、蛇形命名、短横线命名",
      "编码解码：支持 Base64 和 URL 编码/解码",
      "去除空白：支持去除所有空白、行首空白、行尾空白、行首尾空白、空行",
      "统计信息：显示字符数、单词数、行数、段落数、字节数等统计信息",
    ],
  },
  {
    category: "图片工具",
    features: [
      "基础编辑：压缩、调整尺寸、裁剪、旋转、翻转",
      "格式转换：支持 PNG、JPG、WebP、ICO、SVG 格式转换，以及转换为 Base64",
      "滤镜效果：灰度、怀旧、反色、模糊",
      "参数调整：亮度、对比度、饱和度调整",
      "操作历史：支持撤销/重做操作（最多 50 步）",
    ],
  },
];
</script>

<style scoped lang="less">
@import "@/styles/about-sections.less";

.about-tools-section {
  padding: 5.5rem 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  gap: 3.5rem;
  background: linear-gradient(
    180deg,
    transparent 0%,
    color-mix(in srgb, var(--surface) 25%, transparent) 50%,
    transparent 100%
  );
}

.about-section-head {
  .about-section-head-mixin();
}

.about-tools-list {
  display: grid;
  gap: 2rem;
  margin-top: 1rem;
}

.about-tool-item {
  .about-card-base-mixin();
  padding: 2.5rem;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--surface) 95%, transparent),
    color-mix(in srgb, var(--surface) 90%, transparent)
  );
}


.about-tool-category {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  position: relative;
  padding-bottom: 0.75rem;
}

.about-tool-category::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 48px;
  height: 3px;
  background: var(--brand-gradient);
  border-radius: 2px;
}

.about-tool-features {
  margin: 0;
  padding-left: 1.75rem;
  display: grid;
  gap: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 0.95rem;
}

.about-tool-features li {
  position: relative;
  padding-left: 0.5rem;
}

.about-tool-features li::marker {
  color: var(--brand-primary);
  font-weight: 600;
}

@media (max-width: 1024px) {
  .about-tools-section {
    gap: 3rem;
  }

  .about-tools-list {
    gap: 1.5rem;
  }
}

@media (max-width: 640px) {
  .about-tools-section {
    padding: 4rem 1.2rem;
    gap: 2.5rem;
  }


  .about-tool-item {
    padding: 2rem;
  }

  .about-tool-category {
    font-size: 1.375rem;
    margin-bottom: 1.25rem;
  }

  .about-tool-features {
    font-size: 0.9rem;
    padding-left: 1.5rem;
    gap: 0.625rem;
  }
}
</style>

