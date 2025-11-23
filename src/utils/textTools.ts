import { CaseType, TrimOption, EncodeType } from '@/types/enums'

/**
 * 转换文本大小写格式
 * @param text 待转换的文本
 * @param caseType 目标大小写类型
 * @returns 转换后的文本
 */
export function convertCase(text: string, caseType: CaseType): string {
  if (!text) return text

  switch (caseType) {
    case CaseType.UPPER:
      return text.toUpperCase()
    case CaseType.LOWER:
      return text.toLowerCase()
    case CaseType.TITLE:
      return text.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      })
    case CaseType.CAMEL:
      return text
        .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/^(.)/, (_, char) => char.toLowerCase())
    case CaseType.PASCAL:
      return text
        .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/^(.)/, (_, char) => char.toUpperCase())
    case CaseType.SNAKE:
      return text
        .replace(/\W+/g, ' ')
        .split(/\s+/)
        .map((word) => word.toLowerCase())
        .filter((word) => word.length > 0)
        .join('_')
    case CaseType.KEBAB:
      return text
        .replace(/\W+/g, ' ')
        .split(/\s+/)
        .map((word) => word.toLowerCase())
        .filter((word) => word.length > 0)
        .join('-')
    default:
      return text
  }
}

/**
 * Base64 编码
 * @param text 待编码的文本
 * @returns Base64 编码后的字符串
 * @throws 编码失败时抛出错误
 */
export function encodeBase64(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)))
  } catch {
    throw new Error('Base64 编码失败')
  }
}

/**
 * Base64 解码
 * @param text Base64 编码的字符串
 * @returns 解码后的文本
 * @throws 解码失败时抛出错误
 */
export function decodeBase64(text: string): string {
  try {
    return decodeURIComponent(escape(atob(text)))
  } catch {
    throw new Error('Base64 解码失败，请检查输入是否为有效的 Base64 字符串')
  }
}

/**
 * URL 编码
 * @param text 待编码的文本
 * @returns URL 编码后的字符串
 * @throws 编码失败时抛出错误
 */
export function encodeURL(text: string): string {
  try {
    return encodeURIComponent(text)
  } catch {
    throw new Error('URL 编码失败')
  }
}

/**
 * URL 解码
 * @param text URL 编码的字符串
 * @returns 解码后的文本
 * @throws 解码失败时抛出错误
 */
export function decodeURL(text: string): string {
  try {
    return decodeURIComponent(text)
  } catch {
    throw new Error('URL 解码失败，请检查输入是否为有效的 URL 编码字符串')
  }
}

/**
 * 去除文本空白字符
 * @param text 待处理的文本
 * @param option 去除选项（全部、行首、行尾、行首尾、空行）
 * @returns 处理后的文本
 */
export function trimWhitespace(text: string, option: TrimOption): string {
  if (!text) return text

  switch (option) {
    case TrimOption.ALL:
      return text.replace(/\s+/g, '')
    case TrimOption.LEADING:
      return text.replace(/^\s+/gm, '')
    case TrimOption.TRAILING:
      return text.replace(/\s+$/gm, '')
    case TrimOption.LINES:
      return text
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
    case TrimOption.EMPTY_LINES:
      return text.replace(/^\s*[\r\n]/gm, '')
    default:
      return text.trim()
  }
}

/**
 * 文本统计信息接口
 */
export interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  lines: number
  paragraphs: number
  bytes: number
}

/**
 * 获取文本统计信息（字符数、单词数、行数、段落数、字节数等）
 * @param text 待统计的文本
 * @returns 统计信息对象
 */
export function getTextStats(text: string): TextStats {
  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const lines = text ? text.split(/\n/).length : 0
  const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0
  
  let bytes = 0
  try {
    bytes = new TextEncoder().encode(text).length
  } catch {
    bytes = text.length
  }

  return {
    characters,
    charactersNoSpaces,
    words,
    lines,
    paragraphs,
    bytes
  }
}

export type { CaseType, TrimOption, EncodeType }

