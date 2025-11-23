<script setup lang="ts">
/**
 * 图片工作区组件
 * 提供图片预览、编辑、转换等功能
 */
import { ref, computed, watch, onMounted } from 'vue'
import SvgIcon from '../base/SvgIcon.vue'
import {
  getImageInfo,
  type ImageInfo
} from '@/utils/imageTools'
import { IMAGE_CONSTANTS } from '@/constants'
import { useWorkspaceStore } from '@/stores/workspace'
import { useMessage } from '@/composables/useMessage'
import { convertImageFormat, resizeImage } from '@/utils/imageTools'
import { ImageFormat } from '@/types/enums'

const props = defineProps<{
  /** 图片源数据（Base64 格式） */
  source: string
  /** 预览内容 */
  previewContent?: string
}>()

const emit = defineEmits<{
  /** 更新图片源 */
  (e: 'update:source', value: string): void
  /** 图片信息更新 */
  (e: 'imageInfo', value: ImageInfo | null): void
}>()

const store = useWorkspaceStore()
const { showSuccess, showError } = useMessage()

/** 图片信息 */
const imageInfo = ref<ImageInfo | null>(null)
/** 加载状态 */
const loading = ref(false)
/** 错误信息 */
const error = ref<string | null>(null)
/** 复制状态 */
const copying = ref(false)
/** 调整尺寸状态 */
const resizing = ref(false)

/** 调整后的宽度 */
const resizeWidth = ref<number | null>(null)
/** 调整后的高度 */
const resizeHeight = ref<number | null>(null)
/** 是否保持宽高比 */
const maintainAspectRatio = ref(true)

/** 文件输入框引用 */
const fileInputRef = ref<HTMLInputElement | null>(null)
/** 是否正在拖拽 */
const isDragging = ref(false)

/** 计算图片显示尺寸（根据最大预览尺寸缩放） */
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

/**
 * 验证文件是否为图片文件
 * @param file - 文件对象
 * @returns 是否为图片文件
 */
function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/') || 
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|tif)$/i.test(file.name)
}

/**
 * 加载图片信息
 */
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

/**
 * 复制结果文本到剪贴板
 */
async function copyResultText() {
  if (!store.resultText) {
    showError('没有可复制的内容')
    return
  }
  
  try {
    copying.value = true
    if ('clipboard' in navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(store.resultText)
    } else {
      // 降级方案：使用 execCommand
      const textarea = document.createElement('textarea')
      textarea.value = store.resultText
      textarea.setAttribute('readonly', 'true')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      textarea.setSelectionRange(0, textarea.value.length)
      const successful = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (!successful) {
        throw new Error('浏览器不允许访问剪贴板')
      }
    }
    showSuccess('已复制到剪贴板')
  } catch (error) {
    showError(error instanceof Error ? error.message : '复制失败')
  } finally {
    copying.value = false
  }
}

/**
 * 下载结果图片
 */
function downloadResultImage() {
  if (!store.resultImageData) {
    showError('没有可下载的图片')
    return
  }
  
  try {
    const link = document.createElement('a')
    link.href = store.resultImageData
    const format = store.resultFormat.toLowerCase() || 'png'
    link.download = `image-${Date.now()}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showSuccess('图片下载成功')
  } catch (error) {
    showError(error instanceof Error ? error.message : '下载失败')
  }
}

/** 是否有转换结果 */
const hasResult = computed(() => {
  return store.resultLoading || (store.resultType !== null && (store.resultText || store.resultImageData))
})

/** 是否可以调整尺寸（仅当结果为图片且已转换时） */
const canResize = computed(() => {
  return store.resultType === 'image' && store.resultImageData && store.currentConvertFormat
})

watch(() => store.resultImageData, async (imageData) => {
  if (imageData && store.resultType === 'image') {
    try {
      const info = await getImageInfo(imageData)
      resizeWidth.value = info.width
      resizeHeight.value = info.height
    } catch {
      // 忽略错误
    }
  }
}, { immediate: true })

/**
 * 处理占位符点击事件，触发文件选择
 */
function handlePlaceholderClick() {
  fileInputRef.value?.click()
}

/**
 * 处理文件选择
 * @param event - 文件选择事件
 */
function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const fileList = input.files
  if (!fileList || fileList.length === 0) {
    input.value = ''
    return
  }
  
  const file = fileList.item(0)
  if (!file) {
    showError('未能读取文件，请重试')
    input.value = ''
    return
  }
  
  if (!isValidImageFile(file)) {
    showError('请选择有效的图片文件（JPG、PNG、GIF、WebP、SVG 等）')
    input.value = ''
    return
  }
  
  const reader = new FileReader()
  reader.onload = () => {
    const imageData = String(reader.result ?? '')
    if (!imageData || !imageData.startsWith('data:image/')) {
      showError('无效的图片文件')
      input.value = ''
      return
    }
    emit('update:source', imageData)
    store.initImageHistory(imageData)
    store.clearResultState()
    showSuccess(`${file.name} 已加载`)
    input.value = ''
  }
  reader.onerror = (error) => {
    console.error('图片导入错误:', error)
    showError('导入失败，请检查文件是否损坏或格式不支持')
    input.value = ''
  }
  reader.onabort = () => {
    showError('导入已取消')
    input.value = ''
  }
  reader.readAsDataURL(file)
}

/**
 * 处理拖拽悬停事件
 * @param event - 拖拽事件
 */
function handleDragOver(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = true
}

/**
 * 处理拖拽离开事件
 * @param event - 拖拽事件
 */
function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = false
}

/**
 * 处理文件拖放事件
 * @param event - 拖拽事件
 */
function handleDrop(event: DragEvent) {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) {
    return
  }
  
  const file = files[0]
  if (!file) {
    return
  }
  
  if (!isValidImageFile(file)) {
    showError('请拖拽有效的图片文件（JPG、PNG、GIF、WebP、SVG 等）')
    return
  }
  
  const reader = new FileReader()
  reader.onload = () => {
    const imageData = String(reader.result ?? '')
    if (!imageData || !imageData.startsWith('data:image/')) {
      showError('无效的图片文件')
      return
    }
    emit('update:source', imageData)
    store.initImageHistory(imageData)
    store.clearResultState()
    showSuccess(`${file.name} 已加载`)
  }
  reader.onerror = (error) => {
    console.error('图片导入错误:', error)
    showError('导入失败，请检查文件是否损坏或格式不支持')
  }
  reader.readAsDataURL(file)
}

/**
 * 使用新的尺寸重新转换图片
 */
async function reconvertWithResize() {
  if (!store.originalImageForConvert || !store.currentConvertFormat) {
    showError('无法重新转换，请先进行格式转换')
    return
  }
  
  if (!resizeWidth.value && !resizeHeight.value) {
    showError('请指定宽度或高度')
    return
  }
  
  try {
    resizing.value = true
    store.setResultLoading(true)
    
    let imageToConvert = store.originalImageForConvert
    if (resizeWidth.value || resizeHeight.value) {
      imageToConvert = await resizeImage(store.originalImageForConvert, {
        width: resizeWidth.value || undefined,
        height: resizeHeight.value || undefined,
        maintainAspectRatio: maintainAspectRatio.value
      })
    }
    
    const format = store.currentConvertFormat as ImageFormat
    const converted = await convertImageFormat(imageToConvert, format)
    const base64Text = converted.replace(/^data:image\/[^;]+;base64,/, '')
    
    store.setResultImageData(converted)
    store.setResultText(base64Text)
    store.setResultLoading(false)
    resizing.value = false
    
    showSuccess('已重新转换')
  } catch (error) {
    store.setResultLoading(false)
    resizing.value = false
    showError(error instanceof Error ? error.message : '重新转换失败')
  }
}
</script>

<template>
  <!-- 左侧面板：源图片 -->
  <div class="image-pane image-pane--source">
    <div 
      v-if="!props.source || !props.source.startsWith('data:image/')" 
      class="image-placeholder"
      :class="{ 'is-dragging': isDragging }"
      @click="handlePlaceholderClick"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="placeholder-content">
        <SvgIcon name="import" class="placeholder-icon" :size="64" />
        <p class="placeholder-text">请导入图片开始编辑</p>
        <p class="placeholder-hint">支持 JPG、PNG、WebP 等格式</p>
        <p class="placeholder-action">点击或拖拽图片到此处</p>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden-file-input"
        @change="handleFileSelect"
      />
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
    </div>
  </div>

  <!-- 右侧面板：结果展示 -->
  <div class="image-pane image-pane--target result-panel" :class="{ 'result-panel--empty': !hasResult && !store.resultLoading }">
    <!-- 结果头部（始终显示，如果有结果或正在加载） -->
    <div v-if="hasResult || store.resultLoading" class="result-header">
      <h3 class="result-title">
        {{ store.resultType === 'base64' ? 'Base64 编码' : store.resultLoading ? '转换中...' : `${store.resultFormat} 转换结果` }}
      </h3>
      <div class="result-actions">
        <!-- 尺寸调整区域（仅当 resultType 为 image 时显示） -->
        <div v-if="canResize && !store.resultLoading" class="resize-controls">
          <input
            type="number"
            v-model.number="resizeWidth"
            class="resize-input-inline"
            placeholder="宽"
            min="1"
            :disabled="resizing"
          />
          <span class="resize-separator">×</span>
          <input
            type="number"
            v-model.number="resizeHeight"
            class="resize-input-inline"
            placeholder="高"
            min="1"
            :disabled="resizing"
          />
          <label class="resize-checkbox-inline">
            <input
              type="checkbox"
              v-model="maintainAspectRatio"
            />
            <span>比例</span>
          </label>
        </div>
        <div v-if="!store.resultLoading" class="action-group">
          <button
            v-if="canResize"
            type="button"
            class="result-action-button"
            :disabled="resizing || (!resizeWidth && !resizeHeight)"
            :title="resizing ? '转换中...' : '重新转换'"
            @click="reconvertWithResize"
          >
            <SvgIcon name="convert" :size="18" />
          </button>
          <button
            v-if="store.resultImageData"
            type="button"
            class="result-action-button"
            :title="'下载图片'"
            @click="downloadResultImage"
          >
            <SvgIcon name="download" :size="18" />
          </button>
          <button
            v-if="store.resultType === 'base64'"
            type="button"
            class="result-action-button"
            :disabled="copying"
            :title="copying ? '复制中...' : '复制 Base64'"
            @click="copyResultText"
          >
            <SvgIcon name="copy" :size="18" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- 结果内容区域 -->
    <div class="result-content-area">
      <!-- 加载状态（仅显示在内容区域） -->
      <div v-if="store.resultLoading" class="result-loading">
        <div class="result-loading-content">
          <div class="result-loading-spinner"></div>
          <p class="result-loading-text">转换中...</p>
        </div>
      </div>
      
      <!-- 图片预览（仅当 resultType 为 image 时显示） -->
      <div v-else-if="store.resultType === 'image' && store.resultImageData" class="result-image-preview">
        <img
          :src="store.resultImageData"
          alt="转换结果预览"
          class="result-preview-image"
        />
      </div>
      
      <!-- 文本内容（仅当 resultType 为 base64 时显示） -->
      <template v-else-if="store.resultType === 'base64'">
        <div class="result-content">
          <textarea
            :value="store.resultText"
            readonly
            class="result-textarea"
            placeholder="Base64 编码将显示在这里..."
          ></textarea>
        </div>
        <div class="result-footer">
          <span class="result-length">长度: {{ store.resultText.length }} 字符</span>
        </div>
      </template>
    </div>
    
    <!-- 当没有结果时，显示占位符 -->
    <div v-if="!hasResult && !store.resultLoading" class="result-placeholder">
      <SvgIcon name="info" class="placeholder-icon" :size="48" />
      <p class="placeholder-text">转换结果将显示在这里</p>
    </div>
  </div>
</template>

<style scoped lang="less">
.image-pane {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  border-radius: 0;
}

[data-theme='light'] .image-pane {
  background: #ffffff;
}

.image-pane--source {
  border-right: 1px solid var(--border-strong);
}

.image-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  border: 2px dashed var(--border-subtle);
  border-radius: 0;
  
  &:hover {
    border-color: var(--color-brand);
    background: rgba(77, 107, 255, 0.05);
  }
  
  &.is-dragging {
    border-color: var(--color-brand);
    background: rgba(77, 107, 255, 0.1);
    transform: scale(1.02);
  }
}

.placeholder-content {
  text-align: center;
  pointer-events: none;
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  color: var(--text-tertiary);
  opacity: 0.5;
  transition: all 0.2s;
}

.image-placeholder:hover .placeholder-icon {
  color: var(--color-brand);
  opacity: 0.8;
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
  margin: 0 0 4px;
}

.placeholder-action {
  font-size: 12px;
  color: var(--color-brand);
  margin: 8px 0 0;
  font-weight: 500;
}

.hidden-file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.image-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
}

.image-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  position: relative;
  background: transparent;
  border-radius: 0;
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
  border-radius: 0;
}

.error-message {
  padding: 16px;
  background: var(--status-error);
  color: white;
  border-radius: 0;
  text-align: center;
}

.image-info {
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  background: transparent;
  border-radius: 0;
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

.result-panel {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow: hidden;
}

[data-theme='light'] .result-panel {
  background: #ffffff;
}

.result-panel--empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-placeholder {
  text-align: center;
  padding: 40px;
}

.result-placeholder .placeholder-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: var(--text-tertiary);
  opacity: 0.5;
}

.result-placeholder .placeholder-text {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.result-content-area {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.result-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 40px;
}

.result-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.result-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-subtle);
  border-top-color: var(--color-brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.result-loading-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.result-title {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: var(--text-primary);
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.resize-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 4px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 1px;
  border-radius: var(--radius-base);
  background: var(--surface-toolbar);
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: color-mix(in srgb, var(--surface-toolbar) 100%, var(--color-brand) 8%);
  }
}

.resize-input-inline {
  width: 60px;
  padding: 4px 6px;
  background: var(--surface-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-primary);
  font-family: var(--font-code);
  transition: border-color 0.2s, background 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--color-brand);
    background: var(--surface-primary);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
}

.resize-separator {
  font-size: 12px;
  color: var(--text-tertiary);
  user-select: none;
}

.resize-checkbox-inline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  
  input[type="checkbox"] {
    width: 14px;
    height: 14px;
    cursor: pointer;
    accent-color: var(--color-brand);
  }
  
  span {
    user-select: none;
  }
}

.result-action-button {
  width: var(--icon-button-size);
  height: var(--icon-button-size);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-base);
  background-color: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: var(--button-hover-bg);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  :deep(svg) {
    width: 18px;
    height: 18px;
    display: block;
  }
}

.result-image-preview {
  flex: 1;
  padding: 16px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  overflow: auto;
}

[data-theme='light'] .result-image-preview {
  background: #ffffff;
}

.result-preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0;
}

.result-content {
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow: hidden;
}

.result-textarea {
  width: 100%;
  height: 100%;
  min-height: 200px;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: 0;
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-primary);
  resize: none;
  outline: none;
  overflow-y: auto;

  &:focus {
    border-color: var(--color-brand);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
}

.result-footer {
  padding: 8px 16px;
  border-top: 1px solid var(--border-subtle);
  font-size: 11px;
  color: var(--text-secondary);
}

.result-length {
  font-weight: 500;
}

</style>
