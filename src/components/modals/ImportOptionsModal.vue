<script setup lang="ts">
import { computed } from 'vue'
import type { PanelKey } from '@/types/jsonTools.ts'

const props = defineProps<{
  visible: boolean
  panel: PanelKey
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-file'): void
  (e: 'select-cache'): void
}>()

const panelLabel = computed(() => (props.panel === 'source' ? '源面板' : '目标面板'))

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  }
}
</script>

<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="modal-overlay"
      role="presentation"
      @click.self="emit('close')"
      @keydown="handleKeydown"
      tabindex="-1"
    >
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="import-dialog-title">
        <header class="modal-card__header">
          <h2 id="import-dialog-title">选择导入方式</h2>
          <p class="modal-card__subtitle">
            将内容导入到
            <strong>{{ panelLabel }}</strong>
          </p>
        </header>

        <div class="modal-card__grid">
          <button type="button" class="option-card" @click="emit('select-file')">
            <div class="option-card__icon option-card__icon--upload" aria-hidden="true">⬆️</div>
            <h3>上传文件</h3>
            <p>选择本地 JSON 或文本文件后立即导入</p>
          </button>

          <button type="button" class="option-card" @click="emit('select-cache')">
            <div class="option-card__icon option-card__icon--library" aria-hidden="true">📚</div>
            <h3>从缓存读取</h3>
            <p>选择之前保存的内容并将其填充到编辑器</p>
          </button>
        </div>

        <footer class="modal-card__footer">
          <button type="button" class="btn btn--ghost" @click="emit('close')">取消</button>
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
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(12px);
  z-index: 999;
}

.modal-card {
  width: min(600px, 100%);
  display: flex;
  flex-direction: column;
  background: var(--surface-primary);
  border-radius: 16px;
  border: 1px solid var(--border-strong);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.24);
  overflow: hidden;
}

.modal-card__header {
  padding: 24px 28px 12px;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .modal-card__subtitle {
    margin: 10px 0 0;
    color: var(--text-muted);
    font-size: 14px;

    strong {
      color: var(--text-primary);
    }
  }
}

.modal-card__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  padding: 12px 28px 8px;
}

.option-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid var(--border-subtle);
  background: var(--surface-secondary);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(77, 107, 255, 0.6);
    box-shadow: 0 16px 32px rgba(77, 107, 255, 0.15);
  }

  &:focus-visible {
    outline: 3px solid rgba(77, 107, 255, 0.35);
    outline-offset: 4px;
  }
}

.option-card__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: rgba(77, 107, 255, 0.12);

  &--library {
    background: rgba(34, 197, 94, 0.12);
  }

  &--upload {
    background: rgba(59, 130, 246, 0.12);
  }
}

.modal-card__footer {
  padding: 18px 28px 24px;
  display: flex;
  justify-content: flex-end;
  background: linear-gradient(180deg, transparent, rgba(148, 163, 184, 0.08));
}

.btn {
  min-width: 96px;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(148, 163, 184, 0.12);
  }
}

@media (max-width: 600px) {
  .modal-card {
    border-radius: 12px;
  }

  .modal-card__header,
  .modal-card__grid,
  .modal-card__footer {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>

