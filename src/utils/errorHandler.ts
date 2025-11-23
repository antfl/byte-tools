/**
 * 统一错误处理工具
 */

/**
 * 应用错误类
 */
export class AppError extends Error {
  code?: string
  details?: unknown
  
  constructor(
    message: string,
    code?: string,
    details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * 错误类型枚举
 */
export const ErrorType = {
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  STORAGE: 'STORAGE',
  PARSE: 'PARSE',
  OPERATION: 'OPERATION',
  UNKNOWN: 'UNKNOWN'
} as const

export type ErrorType = typeof ErrorType[keyof typeof ErrorType]

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType
  message: string
  code?: string
  details?: unknown
  originalError?: unknown
}

/**
 * 将错误转换为统一的错误信息
 * @param error 错误对象
 * @param defaultMessage 默认错误消息
 * @returns 错误信息对象
 */
export function normalizeError(error: unknown, defaultMessage = '操作失败'): ErrorInfo {
  if (error instanceof AppError) {
    return {
      type: ErrorType.OPERATION as ErrorType,
      message: error.message,
      code: error.code,
      details: error.details,
      originalError: error
    }
  }

  if (error instanceof Error) {
    // 网络错误
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        type: ErrorType.NETWORK as ErrorType,
        message: '网络连接失败，请检查网络设置',
        originalError: error
      }
    }

    // 存储错误
    if (error.message.includes('storage') || error.message.includes('IndexedDB')) {
      return {
        type: ErrorType.STORAGE as ErrorType,
        message: error.message || '存储操作失败',
        originalError: error
      }
    }

    // 解析错误
    if (error instanceof SyntaxError) {
      return {
        type: ErrorType.PARSE as ErrorType,
        message: error.message || '解析失败',
        originalError: error
      }
    }

    return {
      type: ErrorType.OPERATION as ErrorType,
      message: error.message || defaultMessage,
      originalError: error
    }
  }

  return {
    type: ErrorType.UNKNOWN as ErrorType,
    message: defaultMessage,
    originalError: error
  }
}

/**
 * 获取用户友好的错误消息
 * @param error 错误对象
 * @param defaultMessage 默认消息
 * @returns 友好的错误消息
 */
export function getErrorMessage(error: unknown, defaultMessage = '操作失败'): string {
  const errorInfo = normalizeError(error, defaultMessage)
  return errorInfo.message
}

/**
 * 错误处理函数类型
 */
export type ErrorHandler = (error: unknown) => void

/**
 * 创建错误处理包装器
 * @param handler 错误处理函数
 * @returns 包装后的函数
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  handler?: ErrorHandler
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      if (handler) {
        handler(error)
      } else {
        console.error('Unhandled error:', error)
      }
      throw error
    }
  }) as T
}
