<script setup lang="ts">
const authStore = useAuthStore()

if (import.meta.client) {
  await authStore.restoreSession()
}

const dashboardPaths: Record<string, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  staff: '/staff',
  teacher: '/teacher',
  student: '/student',
  parent: '/parent'
}

const target = authStore.isAuthenticated && authStore.currentRole
  ? (dashboardPaths[authStore.currentRole] || '/admin')
  : '/login'

await navigateTo(target, { replace: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-secondary-50">
    <UISpinner size="lg" />
  </div>
</template>
