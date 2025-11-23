/**
 * 图标名称映射表
 * 将图标名称映射到 Lucide Vue 图标组件
 * 用于统一管理项目中使用的所有图标
 */
import type { Component } from 'vue'
import {
  Download,
  Save,
  Upload,
  FileDown,
  FileText,
  Minus,
  Wrench,
  X,
  CaseSensitive,
  Lock,
  Unlock,
  Scissors,
  BarChart3,
  Package,
  Maximize2,
  Crop,
  RotateCw,
  FlipHorizontal,
  RefreshCw,
  Filter,
  Info,
  ChevronDown,
  Check,
  Sun,
  Moon,
  HardDrive,
  GitCompare,
  Sparkles,
  Layers,
  Undo2,
  Redo2,
  ExternalLink,
  Monitor,
  Copy,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-vue-next'

/** 图标名称类型定义 */
export type IconName =
  | 'import'
  | 'save'
  | 'export'
  | 'format'
  | 'minify'
  | 'repair'
  | 'clear'
  | 'case'
  | 'encode'
  | 'decode'
  | 'trim'
  | 'stats'
  | 'compress'
  | 'resize'
  | 'crop'
  | 'rotate'
  | 'flip'
  | 'convert'
  | 'filter'
  | 'info'
  | 'about'
  | 'download'
  | 'undo'
  | 'redo'
  | 'chevron-down'
  | 'check'
  | 'sun'
  | 'moon'
  | 'storage'
  | 'diff'
  | 'auto'
  | 'deep'
  | 'monitor'
  | 'copy'
  | 'eye'
  | 'eye-off'
  | 'trash'

/** 图标名称到组件的映射表 */
export const iconMap: Record<IconName, Component> = {
  import: Upload,
  save: Save,
  export: FileDown,
  format: FileText,
  minify: Minus,
  repair: Wrench,
  clear: X,
  case: CaseSensitive,
  encode: Lock,
  decode: Unlock,
  trim: Scissors,
  stats: BarChart3,
  compress: Package,
  resize: Maximize2,
  crop: Crop,
  rotate: RotateCw,
  flip: FlipHorizontal,
  convert: RefreshCw,
  filter: Filter,
  info: Info,
  about: ExternalLink,
  download: Download,
  undo: Undo2,
  redo: Redo2,
  'chevron-down': ChevronDown,
  check: Check,
  sun: Sun,
  moon: Moon,
  storage: HardDrive,
  diff: GitCompare,
  auto: Sparkles,
  deep: Layers,
  monitor: Monitor,
  copy: Copy,
  eye: Eye,
  'eye-off': EyeOff,
  trash: Trash2
}

