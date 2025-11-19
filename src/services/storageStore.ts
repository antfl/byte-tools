import type { PanelKey } from '../types/jsonTools'

export type StoredSnippet = {
  id: string
  title: string
  panel: PanelKey
  content: string
  createdAt: number
  updatedAt: number
  size: number
}

const DB_NAME = 'byte-tools-storage'
const STORE_NAME = 'snippets'
const DB_VERSION = 1

let dbPromise: Promise<IDBDatabase> | null = null

function ensureIndexedDB(): IDBFactory {
  if (typeof indexedDB === 'undefined') {
    throw new Error('当前环境不支持 IndexedDB，无法使用缓存存储功能')
  }
  return indexedDB
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getDatabase(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise
  }
  dbPromise = new Promise((resolve, reject) => {
    const dbFactory = ensureIndexedDB()
    const request = dbFactory.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('by_updatedAt', 'updatedAt', { unique: false })
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error ?? new Error('无法打开存储数据库'))
    }

    request.onblocked = () => {
      reject(new Error('存储数据库被阻塞，请关闭其他标签页后重试'))
    }
  })

  return dbPromise
}

function withTransaction<T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => Promise<T> | T
): Promise<T> {
  return getDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode)
        const store = tx.objectStore(STORE_NAME)

        let result: T | undefined

        Promise.resolve(handler(store))
          .then((value) => {
            result = value
          })
          .catch((error) => {
            reject(error)
            if (tx.error == null) {
              tx.abort()
            }
          })

        tx.oncomplete = () => {
          resolve(result as T)
        }

        tx.onerror = () => {
          reject(tx.error ?? new Error('存储事务失败'))
        }

        tx.onabort = () => {
          reject(tx.error ?? new Error('存储事务已中止'))
        }
      })
  )
}

function computeSize(content: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(content).length
  }
  return content.length
}

export async function saveSnippet(panel: PanelKey, title: string, content: string): Promise<StoredSnippet> {
  const now = Date.now()
  const snippet: StoredSnippet = {
    id: generateId(),
    title: title.trim(),
    panel,
    content,
    createdAt: now,
    updatedAt: now,
    size: computeSize(content)
  }

  await withTransaction('readwrite', (store) => {
    return new Promise<IDBValidKey>((resolve, reject) => {
      const request = store.put(snippet)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('写入缓存失败'))
    })
  })

  return snippet
}

export async function listSnippets(): Promise<StoredSnippet[]> {
  return withTransaction('readonly', (store) => {
    return new Promise<StoredSnippet[]>((resolve, reject) => {
      const request = store.index('by_updatedAt').openCursor(null, 'prev')
      const results: StoredSnippet[] = []

      request.onsuccess = () => {
        const cursor = request.result
        if (!cursor) {
          resolve(results)
          return
        }
        results.push(cursor.value as StoredSnippet)
        cursor.continue()
      }

      request.onerror = () => {
        reject(request.error ?? new Error('读取缓存失败'))
      }
    })
  })
}

export async function getSnippet(id: string): Promise<StoredSnippet | undefined> {
  return withTransaction('readonly', (store) => {
    return new Promise<StoredSnippet | undefined>((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => {
        resolve(request.result as StoredSnippet | undefined)
      }
      request.onerror = () => {
        reject(request.error ?? new Error('读取缓存失败'))
      }
    })
  })
}

export async function deleteSnippet(id: string): Promise<void> {
  await withTransaction('readwrite', (store) => {
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error ?? new Error('删除缓存失败'))
    })
  })
}


