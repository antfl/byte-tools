<script setup lang="ts">
import { computed } from 'vue'
import type { PanelKey } from '@/types/jsonTools.ts'
import type { StoredSnippet } from '@/services/storageStore.ts'
import { formatByteSize, formatDateTime } from '@/utils/format.ts'

const props = defineProps<{
  visible: boolean
  panel: PanelKey
  items: StoredSnippet[]
  loading: boolean
  selectedId: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', id: string): void
  (e: 'delete', id: string): void
  (e: 'refresh'): void
  (e: 'copy', id: string): void
  (e: 'preview', id: string | null): void
}>()

const panelLabel = computed(() => (props.panel === 'source' ? '源面板' : '目标面板'))
const selectedSnippet = computed(() => props.items.find((item) => item.id === props.selectedId))

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
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="cache-dialog-title">
        <header class="modal-card__header">
          <div>
            <h2 id="cache-dialog-title">缓存内容库</h2>
            <p class="modal-card__subtitle">
              选择一条记录填充到
              <strong>{{ panelLabel }}</strong>
            </p>
          </div>

          <div class="actions">
            <button type="button" class="btn btn--ghost" @click="emit('refresh')" :disabled="loading">
              {{ loading ? '刷新中…' : '刷新' }}
            </button>
            <button type="button" class="btn btn--ghost" @click="emit('close')" :disabled="loading">
              关闭
            </button>
          </div>
        </header>

        <section class="modal-card__body">
          <div v-if="loading" class="loading">
            <span class="loading__spinner" aria-hidden="true" />
            <span>正在加载缓存列表…</span>
          </div>

          <div v-else-if="items.length === 0" class="empty">
            <div class="empty__icon" aria-hidden="true">📭</div>
            <h3>暂无缓存数据</h3>
            <p>保存内容后即可在此快速复用。</p>
          </div>

          <ul v-else class="snippet-list">
            <li
              v-for="snippet in items"
              :key="snippet.id"
              class="snippet-item"
              :data-expanded="props.selectedId === snippet.id"
            >
              <div class="snippet-item__main">
                <div>
                  <h3>{{ snippet.title }}</h3>
                  <p>{{ formatDateTime(snippet.updatedAt) }} · {{ formatByteSize(snippet.size) }}</p>
                </div>
                <div class="snippet-item__meta">
                  <span class="tag" :data-active="snippet.panel === panel">来自 {{ snippet.panel === 'source' ? '源面板' : '目标面板' }}</span>
                </div>
              </div>
              <div class="snippet-item__actions">
                <button type="button" class="btn btn--ghost" @click="emit('preview', props.selectedId === snippet.id ? null : snippet.id)">
                  {{ props.selectedId === snippet.id ? '收起' : '查看' }}
                </button>
                <button type="button" class="btn btn--ghost" @click="emit('copy', snippet.id)">
                  复制
                </button>
                <button type="button" class="btn btn--primary" @click="emit('select', snippet.id)">
                  导入
                </button>
                <button type="button" class="btn btn--danger" @click="emit('delete', snippet.id)">
                  删除
                </button>
              </div>
              <div v-if="props.selectedId === snippet.id" class="snippet-item__preview">
                <pre>{{ snippet.content }}</pre>
              </div>
            </li>
          </ul>
          <div v-if="selectedSnippet" class="preview-hint">
            <p>
              共 {{ formatByteSize(selectedSnippet.size) }} · 最近更新于 {{ formatDateTime(selectedSnippet.updatedAt) }}
            </p>
          </div>
        </section>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="less">
.modal-overlay {
  position: fixed;
  inset: 0;
  padding: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(16px);
  z-index: 998;
}

.modal-card {
  width: min(720px, 100%);
  max-height: min(640px, 100%);
  display: flex;
  flex-direction: column;
  background: var(--surface-primary);
  border-radius: 18px;
  border: 1px solid var(--border-strong);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.32);
  overflow: hidden;
}

.modal-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 24px 32px 16px;

  h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .modal-card__subtitle {
    margin: 8px 0 0;
    font-size: 14px;
    color: var(--text-muted);

    strong {
      color: var(--text-primary);
    }
  }
}

.actions {
  display: flex;
  gap: 10px;
}

.modal-card__body {
  flex: 1;
  padding: 0 32px 28px;
  overflow: auto;
}

.loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: var(--text-muted);

  .loading__spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(148, 163, 184, 0.25);
    border-top-color: var(--color-brand);
    border-radius: 999px;
    animation: spin 0.8s linear infinite;
  }
}

.empty {
  padding: 60px 0;
  text-align: center;
  color: var(--text-muted);

  &__icon {
    font-size: 36px;
    margin-bottom: 16px;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.snippet-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.snippet-item {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  border-radius: 16px;
  background: var(--surface-secondary);
  border: 1.5px solid var(--border-subtle);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-brand), rgba(77, 107, 255, 0.4));
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    border-color: var(--color-brand);
    box-shadow: 0 4px 16px rgba(77, 107, 255, 0.15);
    transform: translateY(-1px);

    &::before {
      opacity: 1;
    }
  }

  &[data-expanded='true'] {
    border-color: var(--color-brand);
    box-shadow: 0 6px 24px rgba(77, 107, 255, 0.2);

    &::before {
      opacity: 1;
    }

    .snippet-item__main {
      background: rgba(77, 107, 255, 0.05);
    }
  }
}

.snippet-item__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  transition: background 0.2s ease;

  > div:first-child {
    flex: 1;
    min-width: 0;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
    word-break: break-word;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    &::before {
      content: '•';
      opacity: 0.5;
    }
  }
}

.snippet-item__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-top: 2px;
}

.snippet-item__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-subtle);
  background: rgba(148, 163, 184, 0.03);
  flex-wrap: wrap;
}

.snippet-item__preview {
  margin: 0 24px 20px;
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 16px 18px;
  max-height: 240px;
  overflow: auto;
  font-family: var(--font-code);
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-primary);
  position: relative;
  animation: slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    height: 20px;
    background: linear-gradient(to bottom, var(--surface-primary), transparent);
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: '';
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20px;
    background: linear-gradient(to top, var(--surface-primary), transparent);
    pointer-events: none;
    z-index: 1;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    position: relative;
    z-index: 0;
  }

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;

    &:hover {
      background: var(--border-strong);
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 500;
  background: var(--surface-card);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
  transition: all 0.2s ease;

  &[data-active='true'] {
    background: rgba(77, 107, 255, 0.15);
    color: var(--color-brand);
    border-color: rgba(77, 107, 255, 0.3);
    box-shadow: 0 2px 8px rgba(77, 107, 255, 0.15);
  }
}

.btn {
  min-width: 72px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &--ghost {
    background: transparent;
    color: var(--text-muted);
    border-color: var(--border-subtle);

    &:hover:not(:disabled) {
      background: var(--surface-card);
      color: var(--text-primary);
      border-color: var(--border);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  &--primary {
    background: var(--button-active-bg);
    color: var(--button-active-color);
    box-shadow: 0 2px 8px rgba(77, 107, 255, 0.3);

    &:hover:not(:disabled) {
      box-shadow: 0 4px 12px rgba(77, 107, 255, 0.4);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(77, 107, 255, 0.3);
    }
  }

  &--danger {
    background: rgba(239, 68, 68, 0.12);
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.25);

    &:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2);
      color: #fee2e2;
      border-color: rgba(239, 68, 68, 0.35);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
}

.preview-hint {
  margin-top: 20px;
  padding: 14px 18px;
  border-radius: 12px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  font-size: 12.5px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: 'ℹ';
    font-size: 14px;
    opacity: 0.7;
  }

  p {
    margin: 0;
    line-height: 1.5;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 720px) {
  .modal-overlay {
    padding: 16px;
  }

  .modal-card {
    border-radius: 14px;
    max-height: 90vh;
  }

  .modal-card__header {
    padding: 20px 20px 14px;
    flex-direction: column;
    gap: 16px;

    .actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .modal-card__body {
    padding: 0 20px 24px;
  }

  .snippet-item__main {
    padding: 16px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .snippet-item__meta {
    width: 100%;
    justify-content: flex-start;
  }

  .snippet-item__actions {
    padding: 14px 20px;
    gap: 6px;

    .btn {
      flex: 1;
      min-width: 0;
      font-size: 12px;
      padding: 8px 12px;
    }
  }

  .snippet-item__preview {
    margin: 0 20px 16px;
    padding: 14px 16px;
    max-height: 200px;
  }
}
</style>

