<template>
  <section id="highlights" class="feature-section">
    <div class="section-head">
      <h2>JSON 工具的最佳实践合集</h2>
      <p>
        我们把开发者每天最常碰到的操作，拆分成更符合直觉的体验：格式化、对比、修复与导入导出，高效完成。
      </p>
    </div>
    <div class="feature-grid">
      <article
        v-for="feature in features"
        :key="feature.title"
        class="feature-card"
      >
        <div class="feature-icon" aria-hidden="true">
          <component :is="feature.icon" />
        </div>
        <div class="feature-content">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
        <ul v-if="feature.points" class="feature-points">
          <li v-for="point in feature.points" :key="point">{{ point }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineComponent, h, markRaw } from "vue";

const IconFormat = markRaw(
	defineComponent({
		name: "IconFormat",
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
									id: "featureGradientOne",
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
							fill: "url(#featureGradientOne)",
							opacity: "0.16",
						}),
						h("rect", {
							x: "7",
							y: "12",
							width: "18",
							height: "8",
							rx: "2",
							stroke: "url(#featureGradientOne)",
							"stroke-width": "1.6",
						}),
						h("path", {
							d: "M12 7.5V24.5",
							stroke: "url(#featureGradientOne)",
							"stroke-width": "1.6",
							"stroke-linecap": "round",
							"stroke-dasharray": "3 3",
						}),
						h("circle", {
							cx: "12",
							cy: "16",
							r: "1.8",
							fill: "url(#featureGradientOne)",
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

const IconDiff = markRaw(
	defineComponent({
		name: "IconDiff",
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
									id: "featureGradientTwo",
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
							fill: "url(#featureGradientTwo)",
							opacity: "0.16",
						}),
						h("path", {
							d: "M16 6.4 8.3 10.23v5.24c0 5.49 3.46 10.63 7.7 12.6 4.24-1.97 7.7-7.11 7.7-12.6v-5.24L16 6.4Z",
							stroke: "url(#featureGradientTwo)",
							"stroke-width": "1.6",
						}),
						h("path", {
							d: "M12.6 15.3 15.2 17.9l4.2-4.2",
							stroke: "url(#featureGradientTwo)",
							"stroke-width": "1.8",
							"stroke-linecap": "round",
							"stroke-linejoin": "round",
						}),
					],
				);
		},
	}),
);

const IconRepair = markRaw(
	defineComponent({
		name: "IconRepair",
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
									id: "featureGradientThree",
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
							stroke: "url(#featureGradientThree)",
							"stroke-width": "1.6",
						}),
						h("path", {
							d: "M10 18.5 14 14.5l4 4 4-4",
							stroke: "url(#featureGradientThree)",
							"stroke-width": "1.8",
							"stroke-linecap": "round",
							"stroke-linejoin": "round",
						}),
						h("circle", {
							cx: "14",
							cy: "14.5",
							r: "1.2",
							fill: "url(#featureGradientThree)",
						}),
						h("circle", {
							cx: "18",
							cy: "18.5",
							r: "1.2",
							fill: "url(#featureGradientThree)",
						}),
					],
				);
		},
	}),
);

const features = [
	{
		title: "格式化与压缩",
		description:
			"一键格式化 JSON 数据，支持自定义缩进（默认 2 空格）。同时支持压缩功能，将格式化的 JSON 压缩为单行，节省空间。",
		icon: IconFormat,
		points: ["自定义缩进", "格式化输出", "压缩为单行"],
	},
	{
		title: "差异对比",
		description:
			"并排对比两个 JSON 文件，使用 jsondiffpatch 高亮显示差异。支持代码折叠、展开，Monaco Editor 提供专业的编辑体验。",
		icon: IconDiff,
		points: ["并排对比", "差异高亮", "代码折叠"],
	},
	{
		title: "修复与存储",
		description:
			"使用 jsonrepair 智能修复常见的 JSON 错误，包括缺失引号、尾随逗号等。支持本地存储，保存常用 JSON 片段，方便后续使用。",
		icon: IconRepair,
		points: ["自动修复", "本地存储", "导入导出"],
	},
];
</script>

<style scoped>
.feature-section {
  padding: 3.8rem 1.5rem 3.5rem;
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  gap: 2.6rem;
}

.section-head {
  display: grid;
  gap: 0.8rem;
  max-width: 720px;
}

.section-head h2 {
  margin: 0;
  font-size: clamp(2rem, 3.5vw, 2.4rem);
}

.section-head p {
  margin: 0;
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.6rem;
}

.feature-card {
  position: relative;
  display: grid;
  gap: 1.25rem;
  padding: 1.8rem;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  border-radius: 22px;
  border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.16), transparent 55%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-strong);
}

.feature-card:hover::after {
  opacity: 1;
}

.feature-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: color-mix(in srgb, var(--surface-muted) 82%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--border) 50%, transparent);
}

.feature-icon svg {
  width: 60%;
  height: 60%;
}

.feature-content h3 {
  margin: 0 0 0.45rem;
  font-size: 1.2rem;
}

.feature-content p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.7;
}

.feature-points {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.4rem;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.feature-points li {
  position: relative;
}

.feature-points li::marker {
  color: var(--brand-primary);
}

@media (max-width: 640px) {
  .feature-section {
    padding: 3.2rem 1.1rem 3rem;
  }

  .feature-card {
    padding: 1.6rem;
  }
}
</style>

