import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/workspace'

/**
 * 消息提示 Composable
 */
export function useMessage() {
  const store = useWorkspaceStore()
  
  const showSuccess = (text: string) => {
    store.showMessage('success', text)
  }
  
  const showError = (text: string) => {
    store.showMessage('error', text)
  }
  
  const showInfo = (text: string) => {
    store.showMessage('info', text)
  }
  
  return {
    showMessage: store.showMessage,
    showSuccess,
    showError,
    showInfo,
    message: computed(() => store.message)
  }
}

