<template>
  <NuxtLayout name="admin" page-title="แดชบอร์ด" page-description="ภาพรวมของระบบ">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <!-- Stats Cards -->
      <UICard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-secondary-600 mb-1">นักเรียนทั้งหมด</p>
            <h3 class="text-2xl font-bold text-secondary-900">1,234</h3>
            <p class="text-xs text-success-600 mt-1">
              <Icon name="lucide:trending-up" class="w-3 h-3 inline" />
              +5.2% จากเดือนที่แล้ว
            </p>
          </div>
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Icon name="lucide:graduation-cap" class="w-6 h-6 text-primary-600" />
          </div>
        </div>
      </UICard>

      <UICard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-secondary-600 mb-1">ครูทั้งหมด</p>
            <h3 class="text-2xl font-bold text-secondary-900">87</h3>
            <p class="text-xs text-success-600 mt-1">
              <Icon name="lucide:trending-up" class="w-3 h-3 inline" />
              +2 คนใหม่
            </p>
          </div>
          <div class="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
            <Icon name="lucide:user-check" class="w-6 h-6 text-success-600" />
          </div>
        </div>
      </UICard>

      <UICard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-secondary-600 mb-1">บุคคลากร</p>
            <h3 class="text-2xl font-bold text-secondary-900">45</h3>
            <p class="text-xs text-secondary-600 mt-1">ทำงานปกติ</p>
          </div>
          <div class="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
            <Icon name="lucide:users" class="w-6 h-6 text-warning-600" />
          </div>
        </div>
      </UICard>

      <UICard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-secondary-600 mb-1">คำขออนุมัติ</p>
            <h3 class="text-2xl font-bold text-secondary-900">12</h3>
            <p class="text-xs text-danger-600 mt-1">
              <Icon name="lucide:alert-circle" class="w-3 h-3 inline" />
              รอดำเนินการ
            </p>
          </div>
          <div class="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
            <Icon name="lucide:file-check" class="w-6 h-6 text-danger-600" />
          </div>
        </div>
      </UICard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Activities -->
      <UICard title="กิจกรรมล่าสุด">
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-start gap-3 pb-4 border-b border-secondary-100 last:border-0 last:pb-0">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="lucide:user-plus" class="w-4 h-4 text-primary-600" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-secondary-900">มีนักเรียนใหม่ลงทะเบียน</p>
              <p class="text-xs text-secondary-600">สมชาย ใจดี - ชั้น ม.1/1</p>
              <p class="text-xs text-secondary-500 mt-1">10 นาทีที่แล้ว</p>
            </div>
          </div>
        </div>
      </UICard>

      <!-- Quick Actions -->
      <UICard title="การดำเนินการด่วน">
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink
            to="/admin/students"
            class="flex flex-col items-center justify-center p-4 border-2 border-secondary-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <Icon name="lucide:user-plus" class="w-8 h-8 text-secondary-600 group-hover:text-primary-600 mb-2" />
            <span class="text-sm font-medium text-secondary-900">เพิ่มนักเรียน</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/teachers"
            class="flex flex-col items-center justify-center p-4 border-2 border-secondary-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <Icon name="lucide:user-check" class="w-8 h-8 text-secondary-600 group-hover:text-primary-600 mb-2" />
            <span class="text-sm font-medium text-secondary-900">เพิ่มครู</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/classrooms"
            class="flex flex-col items-center justify-center p-4 border-2 border-secondary-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <Icon name="lucide:door-open" class="w-8 h-8 text-secondary-600 group-hover:text-primary-600 mb-2" />
            <span class="text-sm font-medium text-secondary-900">จัดการห้องเรียน</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/approvals"
            class="flex flex-col items-center justify-center p-4 border-2 border-secondary-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <Icon name="lucide:file-check" class="w-8 h-8 text-secondary-600 group-hover:text-primary-600 mb-2" />
            <span class="text-sm font-medium text-secondary-900">อนุมัติคำขอ</span>
          </NuxtLink>
        </div>
      </UICard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})
</script>
