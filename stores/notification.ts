import { defineStore } from 'pinia'
import type { Notification, NotificationType } from '~/types'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref<Notification[]>([])
  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

  // Actions
  const fetchNotifications = async () => {
    try {
      const authStore = useAuthStore()
      const config = useRuntimeConfig()
      
      const data = await $fetch<Notification[]>(`${config.public.apiBase}/notifications`, {
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`
        }
      })

      notifications.value = data
    } catch (error) {
      console.error('Fetch notifications error:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const authStore = useAuthStore()
      const config = useRuntimeConfig()
      
      await $fetch(`${config.public.apiBase}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`
        }
      })

      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.isRead = true
      }
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const authStore = useAuthStore()
      const config = useRuntimeConfig()
      
      await $fetch(`${config.public.apiBase}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`
        }
      })

      notifications.value.forEach(n => n.isRead = true)
    } catch (error) {
      console.error('Mark all as read error:', error)
    }
  }

  const addNotification = (notification: Notification) => {
    notifications.value.unshift(notification)
  }

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification
  }
})
