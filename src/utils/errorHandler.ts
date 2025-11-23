/**
 * 统一错误处理工具
 */

/**
 * 从错误对象中提取错误消息
 * @param error 错误对象
 * @param defaultMessage 默认错误消息
 * @returns 错误消息字符串
 */
export function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message || defaultMessage
  }
  if (typeof error === 'string') {
    return error
  }
  return defaultMessage
}

/**
 * 安全执行异步操作并处理错误
 * @param operation 异步操作函数
 * @param errorMessage 错误消息
 * @returns 操作结果或 null（如果出错）
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    console.error(errorMessage, error)
    return null
  }
}

/**
 * 安全执行同步操作并处理错误
 * @param operation 同步操作函数
 * @param errorMessage 错误消息
 * @returns 操作结果或 null（如果出错）
 */
export function safeSyncOperation<T>(operation: () => T, errorMessage: string): T | null {
  try {
    return operation()
  } catch (error) {
    console.error(errorMessage, error)
    return null
  }
}

