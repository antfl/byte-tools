import { SIZE_UNITS } from '@/constants'

/**
 * 格式化字节大小为可读格式
 * @param bytes 字节数
 * @returns 格式化后的字符串（如 "1.5 MB"）
 */
export function formatByteSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), SIZE_UNITS.length - 1)
  const value = bytes / 1024 ** exponent
  return `${value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2)} ${
    SIZE_UNITS[exponent]
  }`
}

/**
 * 格式化时间戳为日期时间字符串
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的日期时间字符串（格式：YYYY-MM-DD HH:mm:ss）
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}

/**
 * JSON 解析错误信息接口
 */
export interface JsonParseError {
  line: number
  column: number
  message: string
  position: number
  errorChar?: string
}

/**
 * 解析 JSON 错误信息，提取错误位置和友好提示
 * 
 * 该函数会：
 * 1. 从 SyntaxError 中提取错误位置信息
 * 2. 智能调整错误位置（处理常见情况如多余的逗号）
 * 3. 计算错误所在的行号和列号
 * 4. 生成友好的错误提示信息
 * 
 * @param error 错误对象（应为 SyntaxError）
 * @param source JSON 源代码字符串
 * @returns 解析后的错误信息，如果不是 SyntaxError 则返回 null
 */
export function parseJsonError(error: unknown, source: string): JsonParseError | null {
  if (!(error instanceof SyntaxError)) {
    return null
  }

  const errorMessage = error.message
  const lines = source.split('\n')
  
  // 尝试从错误消息中提取位置信息
  const positionMatch = errorMessage.match(/position\s+(\d+)/i)
  if (positionMatch && positionMatch[1]) {
    let position = parseInt(positionMatch[1], 10)
    
    // 智能调整错误位置，处理常见情况
    if (position >= 0 && position < source.length) {
      const charAtPos = source[position]
      const charBeforePos = position > 0 ? source[position - 1] : ''
      
      // 情况1：多余的逗号（如 "key": value,}）
      if (charAtPos && (charAtPos === '}' || charAtPos === ']') && charBeforePos === ',') {
        position = position - 1
      } 
      // 情况2：闭合括号前的逗号
      else if (charAtPos && (charAtPos === '}' || charAtPos === ']')) {
        let searchPos = position - 1
        while (searchPos >= 0) {
          const char = source[searchPos]
          if (char === undefined) {
            break
          }
          if (char === ',') {
            position = searchPos
            break
          }
          if (!/\s/.test(char)) {
            break
          }
          searchPos--
        }
      } 
      // 情况3：空白字符前的逗号
      else if (charAtPos && /\s/.test(charAtPos)) {
        let searchPos = position - 1
        while (searchPos >= 0) {
          const char = source[searchPos]
          if (char === undefined || !/\s/.test(char)) {
            break
          }
          searchPos--
        }
        if (searchPos >= 0) {
          const char = source[searchPos]
          if (char === ',') {
            position = searchPos
          }
        }
      }
    }
    
    // 计算错误所在的行号和列号
    let currentPos = 0
    let line = 1
    let column = 1
    let found = false
    
    // 方法1：精确匹配位置
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i] ?? ''
      const lineLength = currentLine.length
      const lineStart = currentPos
      const lineEnd = currentPos + lineLength
      
      if (position >= lineStart && position < lineEnd) {
        line = i + 1
        column = position - lineStart + 1
        found = true
        break
      }
      
      if (position === lineEnd) {
        line = i + 1
        column = lineLength + 1
        found = true
        break
      }
      
      currentPos += lineLength + 1
    }
    
    // 方法2：如果未找到，尝试匹配最后一行
    if (!found && position >= currentPos) {
      const lastLineIndex = lines.length - 1
      if (lastLineIndex >= 0) {
        line = lines.length
        const lastLine = lines[lastLineIndex] ?? ''
        column = Math.min(position - (currentPos - lastLine.length - 1) + 1, lastLine.length + 1)
      }
    }
    
    // 方法3：如果仍未找到，使用范围匹配
    if (!found) {
      currentPos = 0
      for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i] ?? ''
        const lineLength = currentLine.length
        const lineStart = currentPos
        
        if (position >= lineStart && position <= currentPos + lineLength) {
          line = i + 1
          column = Math.max(1, Math.min(position - lineStart + 1, lineLength + 1))
          found = true
          break
        }
        
        currentPos += lineLength + 1
      }
    }
    
    // 提取错误字符
    const errorChar = position < source.length ? source[position] : ''
    
    // 生成友好的错误提示信息
    let friendlyMessage = errorMessage
      .replace(/JSON\.parse:/gi, '')
      .replace(/at position \d+/gi, '')
      .trim()
    
    // 根据错误类型生成更友好的提示
    if (errorMessage.includes('Unexpected end')) {
      friendlyMessage = 'JSON 字符串意外结束，可能缺少闭合括号或引号'
    } else if (errorMessage.includes('Unexpected token')) {
      const tokenMatch = errorMessage.match(/Unexpected token\s+(\S+)/i)
      if (tokenMatch) {
        friendlyMessage = `发现意外的字符: ${tokenMatch[1]}`
      } else {
        friendlyMessage = `发现意外的字符: ${errorChar || '未知'}`
      }
    } else if (errorMessage.includes('Expected')) {
      friendlyMessage = '缺少预期的字符'
    } else if (errorMessage.includes('Unterminated string')) {
      friendlyMessage = '字符串未正确闭合，请检查引号'
    }
    
    return {
      line,
      column,
      message: friendlyMessage,
      position,
      errorChar: errorChar || undefined
    }
  }
  
  // 如果错误消息中包含行号信息，使用该行号
  const lineMatch = errorMessage.match(/line\s+(\d+)/i)
  if (lineMatch && lineMatch[1]) {
    const line = parseInt(lineMatch[1], 10)
    return {
      line,
      column: 1,
      message: errorMessage.replace(/JSON\.parse:/gi, '').trim(),
      position: 0
    }
  }
  
  // 如果无法提取位置信息，返回默认值
  return {
    line: 1,
    column: 1,
    message: errorMessage.replace(/JSON\.parse:/gi, '').trim(),
    position: 0
  }
}

