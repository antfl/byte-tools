import { SIZE_UNITS } from '@/constants'

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

export interface JsonParseError {
  line: number
  column: number
  message: string
  position: number
  errorChar?: string
}

export function parseJsonError(error: unknown, source: string): JsonParseError | null {
  if (!(error instanceof SyntaxError)) {
    return null
  }

  const errorMessage = error.message
  const lines = source.split('\n')
  
  const positionMatch = errorMessage.match(/position\s+(\d+)/i)
  if (positionMatch && positionMatch[1]) {
    let position = parseInt(positionMatch[1], 10)
    
    if (position >= 0 && position < source.length) {
      const charAtPos = source[position]
      const charBeforePos = position > 0 ? source[position - 1] : ''
      
      if (charAtPos && (charAtPos === '}' || charAtPos === ']') && charBeforePos === ',') {
        position = position - 1
      } else if (charAtPos && (charAtPos === '}' || charAtPos === ']')) {
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
      } else if (charAtPos && /\s/.test(charAtPos)) {
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
    
    let currentPos = 0
    let line = 1
    let column = 1
    let found = false
    
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
    
    if (!found && position >= currentPos) {
      const lastLineIndex = lines.length - 1
      if (lastLineIndex >= 0) {
        line = lines.length
        const lastLine = lines[lastLineIndex] ?? ''
        column = Math.min(position - (currentPos - lastLine.length - 1) + 1, lastLine.length + 1)
      }
    }
    
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
    
    const errorChar = position < source.length ? source[position] : ''
    
    let friendlyMessage = errorMessage
      .replace(/JSON\.parse:/gi, '')
      .replace(/at position \d+/gi, '')
      .trim()
    
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
  
  return {
    line: 1,
    column: 1,
    message: errorMessage.replace(/JSON\.parse:/gi, '').trim(),
    position: 0
  }
}

