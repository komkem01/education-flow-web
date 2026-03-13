export const useToast = () => {
  const toast = useState<{
    show: boolean
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>('toast', () => ({
    show: false,
    message: '',
    type: 'info'
  }))

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    toast.value = {
      show: true,
      message,
      type
    }

    setTimeout(() => {
      toast.value.show = false
    }, 3000)
  }

  const success = (message: string) => showToast(message, 'success')
  const error = (message: string) => showToast(message, 'error')
  const warning = (message: string) => showToast(message, 'warning')
  const info = (message: string) => showToast(message, 'info')

  return {
    toast,
    showToast,
    success,
    error,
    warning,
    info
  }
}
