<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { PanelKey } from '@/types/jsonTools.ts'
import { formatByteSize } from '@/utils/format.ts'

const props = defineProps<{
  visible: boolean
  panel: PanelKey
  initialTitle: string
  size: number
  content: string
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm', title: string): void
}>()

const title = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const errorMessage = ref('')

const panelLabel = computed(() => (props.panel === 'source' ? '源面板' : '目标面板'))
const sizeLabel = computed(() => formatByteSize(props.size))
const contentPreview = computed(() => {
  if (!props.content) {
    return '（内容为空）'
  }
  return props.content.length > 320 ? `${props.content.slice(0, 320)}\u2026` : props.content
})
const isContentEmpty = computed(() => !props.content || !props.content.trim())
const confirmDisabled = computed(() => !title.value.trim() || props.loading || isContentEmpty.value)

watch(
  () => props.visible,
  async (visible) => {
    if (visible) {
      title.value = props.initialTitle
      errorMessage.value = ''
      await nextTick()
      if (inputRef.value) {
        inputRef.value.focus()
        inputRef.value.select()
      }
    }
  },
  { immediate: true }
)

watch(
  () => isContentEmpty.value,
  (empty) => {
    if (empty && props.visible) {
      errorMessage.value = '空文本不允许保存'
    } else if (!empty) {
      errorMessage.value = ''
    }
  }
)

watch(
  () => props.initialTitle,
  (value) => {
    if (!props.visible) {
      title.value = value
    }
  }
)

function handleCancel() {
  if (props.loading) {
    return
  }
  emit('cancel')
}

function handleConfirm() {
  if (confirmDisabled.value) {
    if (isContentEmpty.value) {
      errorMessage.value = '空文本不允许保存'
    }
    return
  }
  errorMessage.value = ''
  emit('confirm', title.value.trim())
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    handleCancel()
    return
  }
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    handleConfirm()
  }
}
</script>

<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="modal-overlay"
      role="presentation"
      @click.self="handleCancel"
      @keydown="handleKeydown"
      tabindex="-1"
    >
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="storage-dialog-title">
        <header class="modal-card__header">
          <h2 id="storage-dialog-title">保存至缓存</h2>
          <p class="modal-card__subtitle">
            当前内容来自
            <strong>{{ panelLabel }}</strong>
          </p>
        </header>

        <section class="modal-card__body">
          <label class="field">
            <span class="field__label">缓存标题</span>
            <input
              ref="inputRef"
              v-model="title"
              type="text"
              class="field__input"
              maxlength="120"
              placeholder="请输入一个容易识别的标题"
              :disabled="props.loading"
            />
          </label>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div class="meta">
            <div class="meta__item">
              <span class="meta__label">估算大小</span>
              <span class="meta__value">{{ sizeLabel }}</span>
            </div>
            <div class="meta__item">
              <span class="meta__label">来源面板</span>
              <span class="meta__value">{{ panelLabel }}</span>
            </div>
          </div>

          <div class="preview">
            <span class="preview__label">内容预览</span>
            <pre class="preview__code">{{ contentPreview }}</pre>
          </div>
        </section>

        <footer class="modal-card__footer">
          <button class="btn btn--ghost" type="button" @click="handleCancel" :disabled="props.loading">
            取消
          </button>
          <button class="btn btn--primary" type="button" @click="handleConfirm" :disabled="confirmDisabled">
            {{ props.loading ? '保存中…' : '保存到缓存' }}
          </button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="less">
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(12px);
  z-index: 1000;
}

.modal-card {
  width: min(640px, 100%);
  max-height: min(540px, 100%);
  display: flex;
  flex-direction: column;
  background: var(--surface-primary);
  border-radius: 16px;
  border: 1px solid var(--border-strong);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.3);
  overflow: hidden;
}

.modal-card__header {
  padding: 24px 28px 8px;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .modal-card__subtitle {
    margin: 8px 0 0;
    color: var(--text-muted);
    font-size: 14px;

    strong {
      color: var(--text-primary);
      font-weight: 600;
    }
  }
}

.modal-card__body {
  flex: 1;
  padding: 8px 28px 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: auto;
}

.modal-card__footer {
  padding: 20px 28px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: linear-gradient(180deg, transparent, rgba(148, 163, 184, 0.08));
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    font-size: 14px;
    color: var(--text-muted);
  }

  &__input {
    width: 100%;
    padding: 12px 14px;
    font-size: 15px;
    color: var(--text-primary);
    background: var(--surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    transition: border 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: rgba(77, 107, 255, 0.7);
      box-shadow: 0 0 0 3px rgba(77, 107, 255, 0.25);
    }

    &:disabled {
      opacity: 0.6;
    }
  }
}

.error-message {
  padding: 10px 14px;
  font-size: 13px;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
}

.meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  &__item {
    padding: 12px 16px;
    background: var(--surface-secondary);
    border-radius: 10px;
    border: 1px solid var(--border-subtle);
    min-width: 160px;
  }

  &__label {
    display: block;
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 6px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  &__value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.preview {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
  }

  &__code {
    margin: 0;
    padding: 16px;
    border-radius: 12px;
    background: rgba(148, 163, 184, 0.08);
    border: 1px solid rgba(148, 163, 184, 0.1);
    font-family: var(--font-code);
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-primary);
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow: auto;
  }
}

.btn {
  min-width: 112px;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  &:not(:disabled):active {
    transform: translateY(1px);
  }

  &--ghost {
    background: transparent;
    border-color: var(--border-subtle);

    &:hover:not(:disabled) {
      background: rgba(148, 163, 184, 0.08);
    }
  }

  &--primary {
    background: var(--button-active-bg);
    color: var(--button-active-color);
    box-shadow: 0 10px 18px rgba(77, 107, 255, 0.25);

    &:hover:not(:disabled) {
      box-shadow: 0 12px 24px rgba(77, 107, 255, 0.32);
    }
  }
}

@media (max-width: 640px) {
  .modal-card {
    border-radius: 12px;
  }

  .modal-card__header,
  .modal-card__body,
  .modal-card__footer {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>

