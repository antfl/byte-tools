<script setup lang="ts">
import { computed, ref, watch, nextTick, onUnmounted } from 'vue'
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

// 搜索和排序
const searchQuery = ref('')
const sortBy = ref<'updatedAt' | 'size' | 'title'>('updatedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')
const keyboardSelectedIndex = ref<number>(-1)

// 过滤和排序后的列表
const filteredAndSortedItems = computed(() => {
  let result = [...props.items]

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    result = result.filter((item) => item.title.toLowerCase().includes(query))
  }

  // 排序
  result.sort((a, b) => {
    let comparison = 0
    if (sortBy.value === 'updatedAt') {
      comparison = a.updatedAt - b.updatedAt
    } else if (sortBy.value === 'size') {
      comparison = a.size - b.size
    } else if (sortBy.value === 'title') {
      comparison = a.title.localeCompare(b.title, 'zh-CN')
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })

  return result
})


function handleKeydown(event: KeyboardEvent) {
  // 只在模态框可见时处理
  if (!props.visible) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }

  // 如果正在输入搜索框或选择框，不处理导航
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLButtonElement) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const items = filteredAndSortedItems.value
    if (items.length > 0) {
      keyboardSelectedIndex.value = keyboardSelectedIndex.value < items.length - 1 ? keyboardSelectedIndex.value + 1 : 0
      scrollToItem(keyboardSelectedIndex.value)
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    const items = filteredAndSortedItems.value
    if (items.length > 0) {
      keyboardSelectedIndex.value = keyboardSelectedIndex.value > 0 ? keyboardSelectedIndex.value - 1 : items.length - 1
      scrollToItem(keyboardSelectedIndex.value)
    }
  } else if (event.key === 'Enter' && keyboardSelectedIndex.value >= 0) {
    event.preventDefault()
    const item = filteredAndSortedItems.value[keyboardSelectedIndex.value]
    if (item) emit('select', item.id)
  }
}

function scrollToItem(index: number) {
  nextTick(() => {
    const items = document.querySelectorAll('.snippet-item')
    const targetItem = items[index] as HTMLElement
    if (targetItem) {
      targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  })
}

const resetKeyboardSelection = () => { keyboardSelectedIndex.value = -1 }

watch(() => props.visible, (newVal) => {
  if (newVal) {
    searchQuery.value = ''
    sortBy.value = 'updatedAt'
    sortOrder.value = 'desc'
    keyboardSelectedIndex.value = -1
    nextTick(() => {
      const searchInput = document.querySelector('.search-input') as HTMLInputElement
      searchInput?.focus()
    })
  }
})

watch(() => props.items.length, resetKeyboardSelection)

// 使用 watch 来管理事件监听器，确保只在可见时监听
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
}, { immediate: true })

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="modal-overlay"
      role="presentation"
      @click.self="emit('close')"
      tabindex="-1"
    >
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="cache-dialog-title">
        <header class="modal-card__header">
          <div>
            <h2 id="cache-dialog-title">
              缓存内容库
              <span v-if="items.length > 0" class="header-count">
                <span v-if="searchQuery">{{ filteredAndSortedItems.length }} / {{ items.length }}</span>
                <span v-else>{{ items.length }}</span>
              </span>
            </h2>
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

          <template v-else>
            <!-- 搜索和排序工具栏 -->
            <div v-if="items.length > 0" class="toolbar">
              <div class="search-box">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="search-input"
                  placeholder="搜索缓存项..."
                  @input="resetKeyboardSelection"
                />
                <span v-if="searchQuery" class="search-clear" @click="searchQuery = ''; resetKeyboardSelection()">×</span>
              </div>
              <div class="sort-controls">
                <select v-model="sortBy" class="sort-select" @change="resetKeyboardSelection">
                  <option value="updatedAt">按时间</option>
                  <option value="size">按大小</option>
                  <option value="title">按标题</option>
                </select>
                <button
                  type="button"
                  class="sort-order-btn"
                  :title="sortOrder === 'desc' ? '降序' : '升序'"
                  @click="sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'; resetKeyboardSelection()"
                >
                  {{ sortOrder === 'desc' ? '↓' : '↑' }}
                </button>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="items.length === 0" class="empty">
              <div class="empty__icon" aria-hidden="true">📭</div>
              <h3>暂无缓存数据</h3>
              <p>保存内容后即可在此快速复用。</p>
            </div>

            <!-- 搜索无结果 -->
            <div v-else-if="filteredAndSortedItems.length === 0" class="empty">
              <div class="empty__icon" aria-hidden="true">🔍</div>
              <h3>未找到匹配的缓存项</h3>
              <p>尝试调整搜索条件或排序方式。</p>
            </div>

            <!-- 列表 -->
            <ul v-else class="snippet-list">
              <li
                v-for="(snippet, index) in filteredAndSortedItems"
                :key="snippet.id"
                class="snippet-item"
                :data-expanded="props.selectedId === snippet.id"
                :data-keyboard-selected="keyboardSelectedIndex === index"
              >
                <div class="snippet-item__main">
                  <div>
                    <h3>{{ snippet.title }}</h3>
                    <p>{{ formatDateTime(snippet.updatedAt) }} - {{ formatByteSize(snippet.size) }}</p>
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

            <!-- 预览提示 -->
            <div v-if="selectedSnippet" class="preview-hint">
              <p>共 {{ formatByteSize(selectedSnippet.size) }} · 更新于 {{ formatDateTime(selectedSnippet.updatedAt) }}</p>
            </div>
          </template>
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
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-count {
    font-size: 14px;
    font-weight: 400;
    color: var(--text-muted);
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

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 0 0;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
  max-width: 400px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 14px;
  border: 1.5px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-secondary);
  color: var(--text-primary);
  font-size: 13.5px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-brand);
    box-shadow: 0 0 0 3px rgba(77, 107, 255, 0.1);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.search-clear {
  position: absolute;
  right: 10px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 18px;
  line-height: 1;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: var(--surface-card);
    color: var(--text-primary);
  }
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.sort-select {
  padding: 10px 14px;
  border: 1.5px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-secondary);
  color: var(--text-primary);
  font-size: 13.5px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: var(--color-brand);
    box-shadow: 0 0 0 3px rgba(77, 107, 255, 0.1);
  }
}

.sort-order-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-secondary);
  color: var(--text-primary);
  font-size: 16px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.1s;

  &:hover {
    border-color: var(--color-brand);
    background: var(--surface-card);
  }

  &:active {
    transform: scale(0.95);
  }
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

  &[data-keyboard-selected='true'] {
    border-color: var(--color-brand);
    box-shadow: 0 4px 16px rgba(77, 107, 255, 0.2);
    transform: translateY(-1px);

    &::before {
      opacity: 0.6;
    }

    .snippet-item__main {
      background: rgba(77, 107, 255, 0.03);
    }
  }
}

.snippet-item__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  transition: background 0.2s;

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
  transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;

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
  transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.1s;
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

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .search-box {
    min-width: 0;
    max-width: 100%;
  }

  .sort-controls {
    width: 100%;
    justify-content: space-between;
  }

  .sort-select {
    flex: 1;
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

