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
                <h3>{{ snippet.title }}</h3>
                <p>{{ formatDateTime(snippet.updatedAt) }} · {{ formatByteSize(snippet.size) }}</p>
              </div>
              <div class="snippet-item__meta">
                <span class="tag" :data-active="snippet.panel === panel">来自 {{ snippet.panel === 'source' ? '源面板' : '目标面板' }}</span>
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
  gap: 16px;
}

.snippet-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  align-items: center;
  padding: 18px 22px;
  border-radius: 14px;
  background: var(--surface-secondary);
  border: 1px solid rgba(148, 163, 184, 0.18);
  transition: border 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: rgba(77, 107, 255, 0.6);
    transform: translateY(-2px);
  }

  h3 {
    margin: 0 0 6px;
    font-size: 16px;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 13px;
    color: var(--text-muted);
  }
}

.snippet-item__meta {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.snippet-item__actions {
  display: flex;
  gap: 10px;
}

.snippet-item__preview {
  grid-column: 1 / -1;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  padding: 14px 16px;
  max-height: 220px;
  overflow: auto;
  font-family: var(--font-code);
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(148, 163, 184, 0.12);
  color: var(--text-muted);
  border: 1px solid rgba(148, 163, 184, 0.12);

  &[data-active='true'] {
    background: rgba(77, 107, 255, 0.18);
    color: var(--button-active-color);
    border-color: rgba(77, 107, 255, 0.35);
  }
}

.btn {
  min-width: 88px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &--ghost {
    background: transparent;
    color: var(--text-muted);
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

  &--danger {
    background: rgba(239, 68, 68, 0.12);
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.25);

    &:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2);
      color: #fef2f2;
    }
  }
}

.preview-hint {
  margin-top: 18px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.1);
  font-size: 13px;
  color: var(--text-muted);
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
  }

  .snippet-item {
    grid-template-columns: 1fr;
    align-items: flex-start;

    &[data-expanded='true'] {
      border-color: rgba(77, 107, 255, 0.6);
    }
  }

  .snippet-item__actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

