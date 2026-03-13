<template>
  <NuxtLayout name="admin" page-title="แดชบอร์ดบุคลากร" page-description="ภาพรวมงานทะเบียนและเอกสารของโรงเรียน">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <UICard>
        <p class="text-sm text-secondary-600">คำขอลงทะเบียนใหม่</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">24</p>
        <p class="text-xs text-warning-700 mt-1">รอตรวจสอบเอกสาร</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">นักเรียนที่ยืนยันแล้ว</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">1,129</p>
        <p class="text-xs text-success-700 mt-1">อัปเดตรายวัน</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">ครูรออนุมัติ</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">6</p>
        <p class="text-xs text-danger-700 mt-1">ต้องการผู้อนุมัติ</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">เอกสารที่ต้องออกเลข</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">18</p>
        <p class="text-xs text-secondary-600 mt-1">วันนี้</p>
      </UICard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UICard class="lg:col-span-2" title="งานที่ต้องดำเนินการ">
        <div class="space-y-3">
          <div v-for="task in tasks" :key="task.title" class="flex items-center justify-between p-3 rounded-lg border border-secondary-200">
            <div>
              <p class="text-sm font-medium text-secondary-900">{{ task.title }}</p>
              <p class="text-xs text-secondary-600">{{ task.detail }}</p>
            </div>
            <UIBadge :variant="task.variant">{{ task.badge }}</UIBadge>
          </div>
        </div>
      </UICard>

      <UICard title="ทางลัด">
        <div class="grid grid-cols-1 gap-3">
          <NuxtLink to="/staff/students" class="p-3 rounded-lg border border-secondary-200 hover:border-primary-400 hover:bg-primary-50 transition">
            <p class="text-sm font-medium text-secondary-900">ตรวจลงทะเบียนนักเรียน</p>
          </NuxtLink>
          <NuxtLink to="/staff/teachers" class="p-3 rounded-lg border border-secondary-200 hover:border-primary-400 hover:bg-primary-50 transition">
            <p class="text-sm font-medium text-secondary-900">อนุมัติครูใหม่</p>
          </NuxtLink>
          <NuxtLink to="/staff/documents" class="p-3 rounded-lg border border-secondary-200 hover:border-primary-400 hover:bg-primary-50 transition">
            <p class="text-sm font-medium text-secondary-900">ออกเลขเอกสาร</p>
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

const tasks = [
  { title: 'ตรวจสอบเอกสารนักเรียนใหม่', detail: 'ชั้น ม.1 ทั้งหมด 12 รายการ', badge: 'สูง', variant: 'danger' },
  { title: 'ทบทวนข้อมูลผู้ปกครอง', detail: 'รอแนบสำเนาบัตร 5 รายการ', badge: 'กลาง', variant: 'warning' },
  { title: 'ส่งต่อคำขอแต่งตั้งครู', detail: 'รออนุมัติจากแอดมิน 2 รายการ', badge: 'ปกติ', variant: 'primary' }
] as const
</script>
