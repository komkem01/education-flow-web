<template>
  <div class="min-h-screen bg-secondary-50">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-secondary-200 transition-transform">
      <div class="flex h-full flex-col">
        <!-- Logo -->
        <div class="flex items-center gap-3 px-6 py-5 border-b border-secondary-200">
          <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Icon name="lucide:graduation-cap" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-secondary-900">EduFlow</h1>
            <p class="text-xs text-secondary-600">{{ panelTitle }}</p>
            <p class="text-xs text-primary-700 truncate max-w-[180px]">{{ schoolName }}</p>
          </div>
        </div>

        <!-- Role Switcher (if multiple roles) -->
        <div v-if="authStore.canSwitchRole" class="px-4 py-3 border-b border-secondary-200">
          <div class="bg-primary-50 rounded-lg p-3">
            <p class="text-xs text-secondary-600 mb-2">บทบาทปัจจุบัน</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="lucide:shield-check" class="w-4 h-4 text-primary-600" />
                <span class="text-sm font-medium text-primary-900">{{ roleLabel }}</span>
              </div>
              <button
                @click="showRoleSwitch = !showRoleSwitch"
                class="text-primary-600 hover:text-primary-700"
              >
                <Icon name="lucide:chevron-down" class="w-4 h-4" />
              </button>
            </div>
            
            <!-- Role Dropdown -->
            <div v-if="showRoleSwitch" class="mt-3 pt-3 border-t border-primary-200 space-y-1">
              <button
                v-for="role in authStore.userRoles"
                :key="role"
                @click="handleRoleSwitch(role)"
                class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white transition-colors"
                :class="role === authStore.currentRole ? 'text-primary-700 font-medium' : 'text-secondary-700'"
              >
                {{ getRoleLabel(role) }}
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto px-4 py-4">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-4 py-3 mb-1 rounded-lg text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
            active-class="bg-primary-100 text-primary-700 font-medium"
          >
            <Icon :name="item.icon" class="w-5 h-5" />
            <span class="text-sm">{{ item.label }}</span>
          </NuxtLink>
        </nav>

      </div>
    </aside>

    <!-- Main Content -->
    <div class="pl-64">
      <!-- Top Bar -->
      <header class="sticky top-0 z-30 bg-white border-b border-secondary-200">
        <div class="flex items-center justify-between px-6 py-4">
          <div>
            <h2 class="text-xl font-semibold text-secondary-900">{{ pageTitle }}</h2>
            <p class="text-sm text-secondary-600">{{ pageDescription }}</p>
          </div>

          <div class="flex items-center gap-4">
            <!-- Notifications -->
            <button
              class="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
              @click="showNotifications = !showNotifications"
            >
              <Icon name="lucide:bell" class="w-5 h-5" />
              <span
                v-if="notificationStore.unreadCount > 0"
                class="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"
              />
            </button>

            <!-- User Dropdown -->
            <div ref="profileMenuRef" class="relative pl-3 border-l border-secondary-200">
              <button
                class="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary-100 transition-colors"
                @click="showProfileMenu = !showProfileMenu"
              >
                <div class="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                  <Icon name="lucide:user" class="w-4 h-4 text-primary-700" />
                </div>
                <div class="hidden md:block text-left min-w-0 max-w-[200px]">
                  <p class="text-sm font-medium text-secondary-900 truncate">
                    {{ authStore.user?.fullName }}
                  </p>
                  <p class="text-xs text-secondary-600 truncate">
                    {{ authStore.user?.email }}
                  </p>
                </div>
                <Icon name="lucide:chevron-down" class="w-4 h-4 text-secondary-500" />
              </button>

              <div
                v-if="showProfileMenu"
                class="absolute right-0 mt-2 w-56 rounded-lg border border-secondary-200 bg-white shadow-lg z-40 overflow-hidden"
              >
                <div class="px-4 py-3 border-b border-secondary-100">
                  <p class="text-sm font-medium text-secondary-900 truncate">{{ authStore.user?.fullName }}</p>
                  <p class="text-xs text-secondary-600 truncate">{{ authStore.user?.email }}</p>
                </div>

                <button
                  class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                  @click="handleGoProfile"
                >
                  <Icon name="lucide:user-circle" class="w-4 h-4" />
                  โปรไฟล์
                </button>

                <button
                  class="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger-700 hover:bg-danger-50 transition-colors"
                  @click="handleLogout"
                >
                  <Icon name="lucide:log-out" class="w-4 h-4" />
                  ออกจากระบบ
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-6">
        <slot />
      </main>
    </div>

      <!-- Logout Modal -->
      <UIModal
        v-model="showLogoutModal"
        title="ยืนยันการออกจากระบบ"
        size="sm"
        :show-default-footer="true"
        @confirm="confirmLogout"
      >
        <div class="text-center text-secondary-800 py-2">
          คุณต้องการออกจากระบบหรือไม่?
        </div>
      </UIModal>

    <!-- Toast Notification -->
    <UIToast />
  </div>
</template>

<script setup lang="ts">
import { ROLE_MENU_ITEMS } from '~/constants'
import type { UserRole } from '~/types'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const showRoleSwitch = ref(false)
const showNotifications = ref(false)
const showProfileMenu = ref(false)
const profileMenuRef = ref<HTMLElement | null>(null)

const props = defineProps<{
  pageTitle?: string
  pageDescription?: string
}>()

const menuItems = computed(() => {
  const role = authStore.currentRole as keyof typeof ROLE_MENU_ITEMS
  return ROLE_MENU_ITEMS[role] || []
})

const roleLabel = computed(() => {
  if (!authStore.currentRole) return '-'
  return getRoleLabel(authStore.currentRole)
})

const panelTitle = computed(() => {
  if (authStore.currentRole === 'super_admin') {
    return 'แผงควบคุมส่วนกลาง'
  }
  return 'แผงควบคุม'
})

const schoolName = computed(() => {
  if (authStore.currentRole === 'super_admin') {
    return 'ทุกโรงเรียนในระบบ'
  }
  return authStore.user?.schoolName || 'ไม่พบชื่อโรงเรียน'
})

const getRoleLabel = (role: UserRole) => {
  const labels: Record<UserRole, string> = {
    super_admin: 'ผู้พัฒนาระบบ',
    admin: 'ผู้ดูแลระบบ',
    staff: 'บุคคลากร',
    teacher: 'ครู',
    student: 'นักเรียน',
    parent: 'ผู้ปกครอง'
  }
  return labels[role] || role
}

const handleRoleSwitch = (role: UserRole) => {
  authStore.switchRole(role)
  showRoleSwitch.value = false
}

const handleGoProfile = async () => {
  showProfileMenu.value = false
  const profilePathByRole: Partial<Record<UserRole, string>> = {
    admin: '/admin/profile',
    staff: '/staff/profile',
    teacher: '/teacher/profile',
    student: '/student/profile',
    parent: '/parent/profile'
  }
  const targetPath = authStore.currentRole ? profilePathByRole[authStore.currentRole] : undefined
  await navigateTo(targetPath || '/admin/profile')
}

const showLogoutModal = ref(false)
const handleLogout = () => {
  showProfileMenu.value = false
  showLogoutModal.value = true
}

const confirmLogout = async () => {
  // Clear all cookies
  if (import.meta.client) {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
    }
  }
  await authStore.logout()
  showLogoutModal.value = false
}

// Initialize
onMounted(async () => {
  await authStore.restoreSession()
  notificationStore.fetchNotifications()
})

onClickOutside(profileMenuRef, () => {
  showProfileMenu.value = false
})
</script>
