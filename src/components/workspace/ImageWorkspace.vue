<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import SvgIcon from '../base/SvgIcon.vue'
import {
  getImageInfo,
  formatFileSize,
  type ImageInfo
} from '@/utils/imageTools'
import { IMAGE_CONSTANTS } from '@/constants'

const props = defineProps<{
  source: string
  previewContent?: string
}>()

const emit = defineEmits<{
  (e: 'update:source', value: string): void
  (e: 'imageInfo', value: ImageInfo | null): void
}>()

const imageInfo = ref<ImageInfo | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const imageDisplaySize = computed(() => {
  if (!imageInfo.value) return { width: 0, height: 0 }
  const ratio = Math.min(
    IMAGE_CONSTANTS.PREVIEW_MAX_WIDTH / imageInfo.value.width,
    IMAGE_CONSTANTS.PREVIEW_MAX_HEIGHT / imageInfo.value.height,
    1
  )
  return {
    width: Math.round(imageInfo.value.width * ratio),
    height: Math.round(imageInfo.value.height * ratio)
  }
})

async function loadImageInfo() {
  if (!props.source || !props.source.startsWith('data:image/')) {
    imageInfo.value = null
    emit('imageInfo', null)
    return
  }

  try {
    loading.value = true
    error.value = null
    imageInfo.value = await getImageInfo(props.source)
    emit('imageInfo', imageInfo.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载图片信息失败'
    imageInfo.value = null
    emit('imageInfo', null)
  } finally {
    loading.value = false
  }
}

watch(() => props.source, loadImageInfo, { immediate: true })

onMounted(() => {
  loadImageInfo()
})
</script>

<template>
  <div class="image-workspace">
    <div v-if="!props.source || !props.source.startsWith('data:image/')" class="image-placeholder">
      <div class="placeholder-content">
        <SvgIcon name="import" class="placeholder-icon" :size="64" />
        <p class="placeholder-text">请导入图片开始编辑</p>
        <p class="placeholder-hint">支持 JPG、PNG、WebP 等格式</p>
      </div>
    </div>

    <div v-else class="image-container">
      <div class="image-preview">
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>处理中...</p>
        </div>
        <img
          v-if="imageInfo"
          :src="props.source"
          :style="{
            maxWidth: `${imageDisplaySize.width}px`,
            maxHeight: `${imageDisplaySize.height}px`
          }"
          alt="预览图片"
          class="preview-image"
        />
        <div v-if="error" class="error-message">
          <p>{{ error }}</p>
        </div>
      </div>


      <!-- 图片信息 -->
      <div v-if="imageInfo" class="image-info">
        <div class="info-item">
          <span class="info-label">尺寸:</span>
          <span class="info-value">{{ imageInfo.width }} × {{ imageInfo.height }} px</span>
        </div>
        <div class="info-item">
          <span class="info-label">大小:</span>
          <span class="info-value">{{ formatFileSize(imageInfo.size) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">格式:</span>
          <span class="info-value">{{ imageInfo.format.toUpperCase() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.image-workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-primary);
}

.image-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.placeholder-content {
  text-align: center;
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: var(--text-tertiary);
  opacity: 0.5;
}

.placeholder-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.placeholder-hint {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.image-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  gap: 20px;
  overflow: visible;
}

.image-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  position: relative;
  background: var(--surface-secondary);
  border-radius: var(--radius-base);
  overflow: auto;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
  color: var(--text-primary);
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-subtle);
  border-top-color: var(--color-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--radius-base);
}

.error-message {
  padding: 16px;
  background: var(--status-error);
  color: white;
  border-radius: var(--radius-base);
  text-align: center;
}

.image-info {
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  background: var(--surface-toolbar);
  border-radius: var(--radius-base);
  font-size: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
}

.info-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  color: var(--text-primary);
}
</style>
