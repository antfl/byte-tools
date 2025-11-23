<template>
  <section class="about-features-section">
    <div class="about-section-head">
      <h2>核心功能</h2>
      <p>
        Byte Tools 提供三种工具模式，覆盖日常开发中最常用的数据处理场景。
      </p>
    </div>
    <div class="about-features-grid">
      <article
        v-for="feature in features"
        :key="feature.title"
        class="about-feature-card"
      >
        <div class="about-feature-icon" aria-hidden="true">
          <component :is="feature.icon" />
        </div>
        <div class="about-feature-content">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
        <ul v-if="feature.points" class="about-feature-points">
          <li v-for="point in feature.points" :key="point">{{ point }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent, h, markRaw } from "vue";

const IconJson = markRaw(
  defineComponent({
    name: "IconJson",
    setup() {
      return () =>
        h(
          "svg",
          { viewBox: "0 0 32 32", fill: "none", "aria-hidden": "true" },
          [
            h(
              "defs",
              null,
              h(
                "linearGradient",
                {
                  id: "jsonGradient",
                  x1: "6",
                  y1: "4",
                  x2: "28",
                  y2: "28",
                },
                [
                  h("stop", {
                    offset: "0%",
                    "stop-color": "var(--brand-primary)",
                  }),
                  h("stop", {
                    offset: "100%",
                    "stop-color": "var(--brand-accent)",
                  }),
                ],
              ),
            ),
            h("path", {
              d: "M8 7h16a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3Z",
              fill: "url(#jsonGradient)",
              opacity: "0.16",
            }),
            h("rect", {
              x: "7",
              y: "12",
              width: "18",
              height: "8",
              rx: "2",
              stroke: "url(#jsonGradient)",
              "stroke-width": "1.6",
            }),
            h("path", {
              d: "M12 7.5V24.5",
              stroke: "url(#jsonGradient)",
              "stroke-width": "1.6",
              "stroke-linecap": "round",
              "stroke-dasharray": "3 3",
            }),
            h("circle", {
              cx: "12",
              cy: "16",
              r: "1.8",
              fill: "url(#jsonGradient)",
            }),
            h("circle", {
              cx: "20",
              cy: "16",
              r: "1.8",
              fill: "var(--text-primary)",
              opacity: "0.3",
            }),
          ],
        );
    },
  }),
);

const IconText = markRaw(
  defineComponent({
    name: "IconText",
    setup() {
      return () =>
        h(
          "svg",
          { viewBox: "0 0 32 32", fill: "none", "aria-hidden": "true" },
          [
            h(
              "defs",
              null,
              h(
                "linearGradient",
                {
                  id: "textGradient",
                  x1: "8",
                  y1: "6",
                  x2: "26",
                  y2: "26",
                },
                [
                  h("stop", {
                    offset: "0%",
                    "stop-color": "var(--brand-primary)",
                  }),
                  h("stop", {
                    offset: "90%",
                    "stop-color": "var(--brand-accent)",
                  }),
                ],
              ),
            ),
            h("path", {
              d: "M16 4 6.5 8.84v6.63c0 6.38 4.02 12.35 9.73 14.53 5.71-2.18 9.73-8.15 9.73-14.53V8.84L16 4Z",
              fill: "url(#textGradient)",
              opacity: "0.16",
            }),
            h("path", {
              d: "M16 6.4 8.3 10.23v5.24c0 5.49 3.46 10.63 7.7 12.6 4.24-1.97 7.7-7.11 7.7-12.6v-5.24L16 6.4Z",
              stroke: "url(#textGradient)",
              "stroke-width": "1.6",
            }),
            h("path", {
              d: "M12.6 15.3 15.2 17.9l4.2-4.2",
              stroke: "url(#textGradient)",
              "stroke-width": "1.8",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            }),
          ],
        );
    },
  }),
);

const IconImage = markRaw(
  defineComponent({
    name: "IconImage",
    setup() {
      return () =>
        h(
          "svg",
          { viewBox: "0 0 32 32", fill: "none", "aria-hidden": "true" },
          [
            h(
              "defs",
              null,
              h(
                "linearGradient",
                {
                  id: "imageGradient",
                  x1: "6",
                  y1: "26",
                  x2: "28",
                  y2: "6",
                },
                [
                  h("stop", {
                    offset: "0%",
                    "stop-color": "var(--brand-accent)",
                  }),
                  h("stop", {
                    offset: "100%",
                    "stop-color": "var(--brand-primary)",
                  }),
                ],
              ),
            ),
            h("rect", {
              x: "6",
              y: "8",
              width: "20",
              height: "16",
              rx: "3",
              stroke: "url(#imageGradient)",
              "stroke-width": "1.6",
            }),
            h("path", {
              d: "M10 18.5 14 14.5l4 4 4-4",
              stroke: "url(#imageGradient)",
              "stroke-width": "1.8",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            }),
            h("circle", {
              cx: "14",
              cy: "14.5",
              r: "1.2",
              fill: "url(#imageGradient)",
            }),
            h("circle", {
              cx: "18",
              cy: "18.5",
              r: "1.2",
              fill: "url(#imageGradient)",
            }),
          ],
        );
    },
  }),
);

const features = [
  {
    title: "JSON 工具",
    description:
      "支持 JSON 格式化、压缩和修复。提供并排差异对比功能，使用 jsondiffpatch 高亮显示差异。支持本地存储常用 JSON 片段。",
    icon: IconJson,
    points: ["格式化与压缩", "差异对比", "错误修复", "本地存储"],
  },
  {
    title: "文本工具",
    description:
      "提供大小写转换（7种格式）、Base64/URL 编码解码、文本去空白和统计信息等功能，满足日常文本处理需求。",
    icon: IconText,
    points: ["大小写转换", "编码解码", "文本清理", "统计信息"],
  },
  {
    title: "图片工具",
    description:
      "支持图片压缩、尺寸调整、裁剪、旋转、翻转等基础编辑。提供格式转换、滤镜效果和参数调整。支持撤销/重做操作。",
    icon: IconImage,
    points: ["基础编辑", "格式转换", "滤镜调整", "操作历史"],
  },
];
</script>

<style scoped lang="less">
@import "@/styles/about-sections.less";

.about-features-section {
  padding: 5.5rem 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  gap: 3.5rem;
}

.about-section-head {
  .about-section-head-mixin();
}

.about-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}

.about-feature-card {
  .about-card-base-mixin();
  display: grid;
  gap: 1.5rem;
  padding: 2.25rem;
}


.about-feature-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at top right,
    color-mix(in srgb, var(--brand-primary) 8%, transparent),
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
}

.about-feature-card:hover {
  transform: translateY(-8px);
}

.about-feature-card:hover::after {
  opacity: 1;
}

.about-feature-icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--brand-primary) 12%, transparent),
    color-mix(in srgb, var(--brand-primary) 8%, transparent)
  );
  box-shadow: 
    inset 0 0 0 1px color-mix(in srgb, var(--brand-primary) 20%, transparent),
    0 4px 12px color-mix(in srgb, var(--brand-primary) 8%, transparent);
  transition: transform 0.3s ease;
}

.about-feature-card:hover .about-feature-icon {
  transform: scale(1.05);
}

.about-feature-icon svg {
  width: 60%;
  height: 60%;
}

.about-feature-content h3 {
  margin: 0 0 0.75rem;
  font-size: 1.375rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.3;
  color: var(--text-primary);
}

.about-feature-content p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.75;
  font-size: 0.95rem;
}

.about-feature-points {
  margin: 0.5rem 0 0;
  padding-left: 1.5rem;
  display: grid;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
}

.about-feature-points li {
  position: relative;
}

.about-feature-points li::marker {
  color: var(--brand-primary);
  font-weight: 600;
}

@media (max-width: 1024px) {
  .about-features-section {
    gap: 3rem;
  }

  .about-features-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 640px) {
  .about-features-section {
    padding: 4rem 1.2rem;
    gap: 2.5rem;
  }


  .about-features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .about-feature-card {
    padding: 1.875rem;
    gap: 1.25rem;
  }

  .about-feature-icon {
    width: 56px;
    height: 56px;
  }

  .about-feature-content h3 {
    font-size: 1.25rem;
  }
}
</style>

