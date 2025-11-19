/**
 * 文本处理工具函数
 */

/**
 * 大小写转换类型
 */
export type CaseType = 'upper' | 'lower' | 'title' | 'camel' | 'pascal' | 'snake' | 'kebab'

/**
 * 大小写转换
 */
export function convertCase(text: string, caseType: CaseType): string {
  if (!text) return text

  switch (caseType) {
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'title':
      return text.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      })
    case 'camel':
      return text
        .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/^(.)/, (_, char) => char.toLowerCase())
    case 'pascal':
      return text
        .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/^(.)/, (_, char) => char.toUpperCase())
    case 'snake':
      return text
        .replace(/\W+/g, ' ')
        .split(/\s+/)
        .map((word) => word.toLowerCase())
        .filter((word) => word.length > 0)
        .join('_')
    case 'kebab':
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
 */
export function encodeBase64(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)))
  } catch (error) {
    throw new Error('Base64 编码失败')
  }
}

/**
 * Base64 解码
 */
export function decodeBase64(text: string): string {
  try {
    return decodeURIComponent(escape(atob(text)))
  } catch (error) {
    throw new Error('Base64 解码失败，请检查输入是否为有效的 Base64 字符串')
  }
}

/**
 * URL 编码
 */
export function encodeURL(text: string): string {
  try {
    return encodeURIComponent(text)
  } catch (error) {
    throw new Error('URL 编码失败')
  }
}

/**
 * URL 解码
 */
export function decodeURL(text: string): string {
  try {
    return decodeURIComponent(text)
  } catch (error) {
    throw new Error('URL 解码失败，请检查输入是否为有效的 URL 编码字符串')
  }
}

/**
 * 去除空白选项
 */
export type TrimOption = 'all' | 'leading' | 'trailing' | 'lines' | 'emptyLines'

/**
 * 去除空白
 */
export function trimWhitespace(text: string, option: TrimOption): string {
  if (!text) return text

  switch (option) {
    case 'all':
      return text.replace(/\s+/g, '')
    case 'leading':
      return text.replace(/^\s+/gm, '')
    case 'trailing':
      return text.replace(/\s+$/gm, '')
    case 'lines':
      return text
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
    case 'emptyLines':
      return text.replace(/^\s*[\r\n]/gm, '')
    default:
      return text.trim()
  }
}

/**
 * 文本统计信息
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
 * 统计文本信息
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

