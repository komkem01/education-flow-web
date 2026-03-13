<template>
  <NuxtLayout name="admin" page-title="โปรไฟล์" page-description="ข้อมูลบัญชีผู้ใช้งาน">
    <div class="max-w-3xl space-y-6">
      <UICard title="ข้อมูลบัญชี">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-secondary-500 mb-1">ชื่อ-นามสกุล</p>
            <p class="text-sm font-medium text-secondary-900">{{ authStore.user?.fullName || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-secondary-500 mb-1">อีเมล</p>
            <p class="text-sm font-medium text-secondary-900">{{ authStore.user?.email || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-secondary-500 mb-1">บทบาทปัจจุบัน</p>
            <p class="text-sm font-medium text-secondary-900">{{ roleLabel }}</p>
          </div>
          <div>
            <p class="text-xs text-secondary-500 mb-1">สถานะ</p>
            <UIBadge :variant="authStore.user?.isActive ? 'success' : 'secondary'">
              {{ authStore.user?.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
            </UIBadge>
          </div>
        </div>
      </UICard>

      <UICard title="การจัดการบัญชี">
        <div class="flex items-center gap-3">
          <UIButton variant="secondary" icon="lucide:key-round" disabled>
            เปลี่ยนรหัสผ่าน (เร็วๆ นี้)
          </UIButton>
          <UIButton variant="danger" icon="lucide:log-out" @click="handleLogout">
            ออกจากระบบ
          </UIButton>
        </div>
      </UICard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { UserRole } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const authStore = useAuthStore()

const roleLabel = computed(() => {
  const role = authStore.currentRole as UserRole | null
  const labels: Record<UserRole, string> = {
    super_admin: 'ผู้พัฒนาระบบ',
    admin: 'ผู้ดูแลระบบ',
    staff: 'บุคลากร',
    teacher: 'ครู',
    student: 'นักเรียน',
    parent: 'ผู้ปกครอง'
  }
  return role ? labels[role] : '-'
})

const handleLogout = async () => {
  if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
    await authStore.logout()
  }
}
</script>
