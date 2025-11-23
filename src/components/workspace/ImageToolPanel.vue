<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PanelKey } from '@/types/jsonTools'
import type { ToolActionPayload } from '@/types/actions'
import { FlipDirection } from '@/types/enums'
import type { ActionKey } from '@/config/toolActions'

const props = defineProps<{
  actionKey: ActionKey
  panel: PanelKey
  imageInfo?: { width: number; height: number } | null
}>()

const emit = defineEmits<{
  (e: 'action', payload: ToolActionPayload): void
  (e: 'close'): void
}>()

// 压缩选项
const compressOptions = ref({
  maxSizeMB: 1,
  quality: 0.8,
  maxWidthOrHeight: 1920
})

// 调整尺寸选项
const resizeOptions = ref({
  width: undefined as number | undefined,
  height: undefined as number | undefined,
  maintainAspectRatio: true
})

// 裁剪选项
const cropOptions = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0
})

// 旋转角度
const rotateAngle = ref(0)

// 调整选项（亮度、对比度、饱和度）
const adjustOptions = ref({
  brightness: 1,
  contrast: 1,
  saturation: 1
})

// 初始化选项
watch(() => props.actionKey, (actionKey) => {
  if (actionKey === 'resize' && props.imageInfo) {
    resizeOptions.value = {
      width: props.imageInfo.width,
      height: props.imageInfo.height,
      maintainAspectRatio: true
    }
  } else if (actionKey === 'crop' && props.imageInfo) {
    cropOptions.value = {
      x: 0,
      y: 0,
      width: props.imageInfo.width,
      height: props.imageInfo.height
    }
  }
}, { immediate: true })

function handleApply() {
  switch (props.actionKey) {
    case 'compress':
      emit('action', {
        action: 'compress',
        panel: props.panel,
        params: { ...compressOptions.value }
      })
      emit('close')
      break
    case 'resize':
      emit('action', {
        action: 'resize',
        panel: props.panel,
        params: { ...resizeOptions.value }
      })
      emit('close')
      break
    case 'crop':
      emit('action', {
        action: 'crop',
        panel: props.panel,
        params: { ...cropOptions.value }
      })
      emit('close')
      break
    case 'rotate':
      emit('action', {
        action: 'rotate',
        panel: props.panel,
        params: { angle: rotateAngle.value }
      })
      emit('close')
      break
    case 'adjust':
      emit('action', {
        action: 'adjust',
        panel: props.panel,
        params: { ...adjustOptions.value }
      })
      emit('close')
      break
  }
}

function handleRotateQuick(angle: number) {
  emit('action', {
    action: 'rotate',
    panel: props.panel,
    params: { angle }
  })
  emit('close')
}

function handleFlip(direction: typeof FlipDirection.HORIZONTAL | typeof FlipDirection.VERTICAL) {
  emit('action', {
    action: 'flip',
    panel: props.panel,
    params: { direction }
  })
  emit('close')
}
</script>

<template>
  <div class="image-tool-panel" @click.stop>
    <!-- 压缩面板 -->
    <template v-if="actionKey === 'compress'">
      <label class="panel-label">
        <span>最大文件大小 (MB)</span>
        <input v-model.number="compressOptions.maxSizeMB" type="number" min="0.1" max="10" step="0.1" class="panel-input" />
      </label>
      <label class="panel-label">
        <span>质量 (0-1)</span>
        <input v-model.number="compressOptions.quality" type="number" min="0.1" max="1" step="0.1" class="panel-input" />
      </label>
      <label class="panel-label">
        <span>最大尺寸 (像素)</span>
        <input v-model.number="compressOptions.maxWidthOrHeight" type="number" min="100" max="5000" step="100" class="panel-input" />
      </label>
      <button class="panel-button" @click="handleApply">应用压缩</button>
    </template>

    <!-- 调整尺寸面板 -->
    <template v-else-if="actionKey === 'resize'">
      <label class="panel-label">
        <span>宽度 (像素)</span>
        <input v-model.number="resizeOptions.width" type="number" min="1" class="panel-input" />
      </label>
      <label class="panel-label">
        <span>高度 (像素)</span>
        <input v-model.number="resizeOptions.height" type="number" min="1" class="panel-input" />
      </label>
      <label class="panel-checkbox">
        <input v-model="resizeOptions.maintainAspectRatio" type="checkbox" />
        <span>保持宽高比</span>
      </label>
      <button class="panel-button" @click="handleApply">应用调整</button>
    </template>

    <!-- 裁剪面板 -->
    <template v-else-if="actionKey === 'crop'">
      <label class="panel-label">
        <span>X 坐标</span>
        <input v-model.number="cropOptions.x" type="number" min="0" class="panel-input" />
      </label>
      <label class="panel-label">
        <span>Y 坐标</span>
        <input v-model.number="cropOptions.y" type="number" min="0" class="panel-input" />
      </label>
      <label class="panel-label">
        <span>宽度</span>
        <input v-model.number="cropOptions.width" type="number" min="1" class="panel-input" />
      </label>
      <label class="panel-label">
        <span>高度</span>
        <input v-model.number="cropOptions.height" type="number" min="1" class="panel-input" />
      </label>
      <button class="panel-button" @click="handleApply">应用裁剪</button>
    </template>

    <!-- 旋转面板 -->
    <template v-else-if="actionKey === 'rotate'">
      <div class="panel-buttons-row">
        <button class="panel-button-small" @click="handleRotateQuick(90)">90°</button>
        <button class="panel-button-small" @click="handleRotateQuick(180)">180°</button>
        <button class="panel-button-small" @click="handleRotateQuick(270)">270°</button>
      </div>
      <label class="panel-label">
        <span>自定义角度</span>
        <input v-model.number="rotateAngle" type="number" min="0" max="360" class="panel-input" />
      </label>
      <button class="panel-button" @click="handleApply">应用旋转</button>
    </template>

    <!-- 翻转面板 -->
    <template v-else-if="actionKey === 'flip'">
      <button class="panel-button" @click="handleFlip(FlipDirection.HORIZONTAL)">水平翻转</button>
      <button class="panel-button" @click="handleFlip(FlipDirection.VERTICAL)">垂直翻转</button>
    </template>

    <!-- 调整面板 -->
    <template v-else-if="actionKey === 'adjust'">
      <label class="panel-label">
        <span>亮度 (0-2)</span>
        <input v-model.number="adjustOptions.brightness" type="number" min="0" max="2" step="0.1" class="panel-input" />
      </label>
      <label class="panel-label">
        <span>对比度 (0-2)</span>
        <input v-model.number="adjustOptions.contrast" type="number" min="0" max="2" step="0.1" class="panel-input" />
      </label>
      <label class="panel-label">
        <span>饱和度 (0-2)</span>
        <input v-model.number="adjustOptions.saturation" type="number" min="0" max="2" step="0.1" class="panel-input" />
      </label>
      <button class="panel-button" @click="handleApply">应用调整</button>
    </template>
  </div>
</template>

<style scoped lang="less">
.image-tool-panel {
  min-width: 240px;
  max-width: 320px;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  
  .panel-label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 12px;

    span {
      font-weight: 500;
    }
  }

  .panel-input {
    padding: 6px 10px;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-base);
    background: var(--surface-secondary);
    color: var(--text-primary);
    font-size: 13px;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: var(--color-brand);
    }
  }

  .panel-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    margin-bottom: 12px;

    input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }
  }

  .panel-button {
    width: 100%;
    padding: 8px 16px;
    border: none;
    border-radius: var(--radius-base);
    background: var(--color-brand);
    color: white;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 8px;

    &:hover {
      background: var(--brand-accent);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .panel-buttons-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .panel-button-small {
    flex: 1;
    padding: 6px 12px;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-base);
    background: var(--surface-secondary);
    color: var(--text-primary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--button-hover-bg);
      border-color: var(--color-brand);
    }
  }
}
</style>

