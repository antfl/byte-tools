import imageCompression from 'browser-image-compression'
import exifr from 'exifr'
import { ImageFormat, FilterType, FlipDirection } from '@/types/enums'
import { IMAGE_CONSTANTS, SIZE_UNITS } from '@/constants'

export interface ExifData {
  Orientation?: number
  DateTimeOriginal?: string
  Make?: string
  Model?: string
  ISO?: number
  FNumber?: number
  ExposureTime?: number
  [key: string]: unknown
}

export interface ImageInfo {
  width: number
  height: number
  size: number
  format: string
  mimeType: string
  exif?: ExifData
}

export interface ResizeOptions {
  width?: number
  height?: number
  maintainAspectRatio?: boolean
}

export interface CompressOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  quality?: number
}

export interface AdjustOptions {
  brightness?: number
  contrast?: number
  saturation?: number
}

export interface CropOptions {
  x: number
  y: number
  width: number
  height: number
}

export async function loadImage(source: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject

    if (typeof source === 'string') {
      img.src = source
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(source)
    }
  })
}

export async function imageToCanvas(source: string | File): Promise<HTMLCanvasElement> {
  const img = await loadImage(source)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 Canvas 上下文')
  ctx.drawImage(img, 0, 0)
  return canvas
}

export function canvasToBase64(canvas: HTMLCanvasElement, mimeType: string = 'image/png', quality?: number): string {
  return canvas.toDataURL(mimeType, quality)
}

export function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('无法创建 Blob'))
        }
      },
      mimeType,
      quality
    )
  })
}

export function base64ToFile(base64: string, filename: string = 'image.png'): File {
  const arr = base64.split(',')
  const mimeMatch = arr[0]?.match(/:(.*?);/)
  const mimeType = mimeMatch?.[1] || 'image/png'
  const bstr = atob(arr[1] || '')
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mimeType })
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function getImageInfo(source: string | File): Promise<ImageInfo> {
  const img = await loadImage(source)
  let file: File | null = null

  if (source instanceof File) {
    file = source
  } else if (source.startsWith('data:')) {
    file = base64ToFile(source)
  }

  const info: ImageInfo = {
    width: img.width,
    height: img.height,
    size: file?.size || 0,
    format: file?.type.split('/')[1] || 'unknown',
    mimeType: file?.type || 'image/png'
  }

  if (file) {
    try {
      const exif = await exifr.parse(file, {
        pick: ['Orientation', 'DateTimeOriginal', 'Make', 'Model', 'ISO', 'FNumber', 'ExposureTime']
      })
      if (exif) {
        info.exif = exif
      }
    } catch {
      // EXIF 读取失败，静默处理
    }
  }

  return info
}

export async function compressImage(
  source: string | File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxSizeMB = IMAGE_CONSTANTS.DEFAULT_MAX_SIZE_MB,
    maxWidthOrHeight = IMAGE_CONSTANTS.DEFAULT_MAX_WIDTH_OR_HEIGHT,
    useWebWorker = true,
    quality = IMAGE_CONSTANTS.DEFAULT_COMPRESS_QUALITY
  } = options

  let file: File

  if (source instanceof File) {
    file = source
  } else {
    file = base64ToFile(source)
  }

  const compressionOptions: Parameters<typeof imageCompression>[1] = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker
  }
  
  if (quality !== undefined) {
    (compressionOptions as any).quality = quality
  }

  const compressedFile = await imageCompression(file, compressionOptions)

  return await fileToBase64(compressedFile)
}

export async function resizeImage(
  source: string | File,
  options: ResizeOptions
): Promise<string> {
  const { width, height, maintainAspectRatio = true } = options

  if (!width && !height) {
    throw new Error('必须指定宽度或高度')
  }

  const img = await loadImage(source)
  let targetWidth = width || img.width
  let targetHeight = height || img.height

  if (maintainAspectRatio) {
    const aspectRatio = img.width / img.height
    if (width && !height) {
      targetHeight = Math.round(width / aspectRatio)
    } else if (height && !width) {
      targetWidth = Math.round(height * aspectRatio)
    } else if (width && height) {
      const scale = Math.min(width / img.width, height / img.height)
      targetWidth = Math.round(img.width * scale)
      targetHeight = Math.round(img.height * scale)
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 Canvas 上下文')

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  return canvasToBase64(canvas, img.src.includes('data:image/') ? getMimeTypeFromBase64(img.src) : 'image/png')
}

export async function cropImage(
  source: string | File,
  options: CropOptions
): Promise<string> {
  const { x, y, width, height } = options
  const img = await loadImage(source)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 Canvas 上下文')

  ctx.drawImage(img, x, y, width, height, 0, 0, width, height)

  return canvasToBase64(canvas, img.src.includes('data:image/') ? getMimeTypeFromBase64(img.src) : 'image/png')
}

export async function rotateImage(
  source: string | File,
  degrees: number
): Promise<string> {
  const img = await loadImage(source)
  const canvas = document.createElement('canvas')

  const rad = (degrees * Math.PI) / 180
  const sin = Math.abs(Math.sin(rad))
  const cos = Math.abs(Math.cos(rad))
  const newWidth = Math.round(img.width * cos + img.height * sin)
  const newHeight = Math.round(img.width * sin + img.height * cos)

  canvas.width = newWidth
  canvas.height = newHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 Canvas 上下文')

  ctx.translate(newWidth / 2, newHeight / 2)
  ctx.rotate(rad)
  ctx.drawImage(img, -img.width / 2, -img.height / 2)

  return canvasToBase64(canvas, img.src.includes('data:image/') ? getMimeTypeFromBase64(img.src) : 'image/png')
}

export async function flipImage(
  source: string | File,
  direction: FlipDirection
): Promise<string> {
  const img = await loadImage(source)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 Canvas 上下文')

  if (direction === FlipDirection.HORIZONTAL) {
    ctx.translate(img.width, 0)
    ctx.scale(-1, 1)
  } else {
    ctx.translate(0, img.height)
    ctx.scale(1, -1)
  }

  ctx.drawImage(img, 0, 0)

  return canvasToBase64(canvas, img.src.includes('data:image/') ? getMimeTypeFromBase64(img.src) : 'image/png')
}

export async function convertImageFormat(
  source: string | File,
  targetFormat: ImageFormat
): Promise<string> {
  if (targetFormat === ImageFormat.BASE64) {
    const base64 = typeof source === 'string' 
      ? source.replace(/^data:image\/[^;]+;base64,/, '')
      : await fileToBase64(source).then(b64 => b64.replace(/^data:image\/[^;]+;base64,/, ''))
    return base64
  }

  if (targetFormat === ImageFormat.SVG) {
    const img = await loadImage(source)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">
  <image href="${typeof source === 'string' ? source : await fileToBase64(source)}" width="${img.width}" height="${img.height}"/>
</svg>`
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
  }

  const img = await loadImage(source)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 Canvas 上下文')

  if (targetFormat === ImageFormat.JPG) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.drawImage(img, 0, 0)

  if (targetFormat === ImageFormat.ICO) {
    return canvasToBase64(canvas, 'image/png')
  }

  const mimeType = `image/${targetFormat === ImageFormat.JPG ? 'jpeg' : targetFormat}`
  const quality = targetFormat === ImageFormat.PNG ? undefined : 0.92

  return canvasToBase64(canvas, mimeType, quality)
}

export async function applyFilter(
  source: string | File,
  filter: FilterType
): Promise<string> {
  const img = await loadImage(source)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 Canvas 上下文')

  const filters: Record<FilterType, string> = {
    [FilterType.GRAYSCALE]: 'grayscale(100%)',
    [FilterType.SEPIA]: 'sepia(100%)',
    [FilterType.INVERT]: 'invert(100%)',
    [FilterType.BLUR]: 'blur(4px)',
    [FilterType.BRIGHTNESS]: 'brightness(1.2)',
    [FilterType.CONTRAST]: 'contrast(1.2)',
    [FilterType.SATURATE]: 'saturate(1.5)'
  }

  ctx.filter = filters[filter] || 'none'
  ctx.drawImage(img, 0, 0)

  return canvasToBase64(canvas, img.src.includes('data:image/') ? getMimeTypeFromBase64(img.src) : 'image/png')
}

export async function adjustImage(
  source: string | File,
  options: AdjustOptions
): Promise<string> {
  const { brightness = 1, contrast = 1, saturation = 1 } = options
  const img = await loadImage(source)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法创建 Canvas 上下文')

  ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`
  ctx.drawImage(img, 0, 0)

  return canvasToBase64(canvas, img.src.includes('data:image/') ? getMimeTypeFromBase64(img.src) : 'image/png')
}

function getMimeTypeFromBase64(base64: string): string {
  const match = base64.match(/data:([^;]+);/)
  return match?.[1] || 'image/png'
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const exponent = Math.min(i, SIZE_UNITS.length - 1)
  const value = bytes / (k ** exponent)
  return `${value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2)} ${SIZE_UNITS[exponent]}`
}

