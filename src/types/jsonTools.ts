export type PanelKey = 'source' | 'target'

export type ThemeMode = 'dark' | 'light'

export type ToolType = 'text' | 'image' | 'json'

export type ToolAction =
  `${PanelKey}-${'import' | 'save' | 'export' | 'format' | 'minify' | 'repair' | 'clear' | 'case' | 'encode' | 'decode' | 'trim' | 'stats'}`

export type MessageLevel = 'success' | 'error' | 'info'

export type DiffState = {
  ok: boolean
  hasDiff: boolean
  message: string
}

