<template>
  <NuxtLayout name="admin" page-title="แดชบอร์ดผู้ปกครอง" page-description="ติดตามข้อมูลบุตรหลาน การเรียน และการชำระเงิน">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <UICard>
        <p class="text-sm text-secondary-600">บุตรหลานทั้งหมด</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">2 คน</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">ค่าใช้จ่ายคงค้าง</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">4,500 บาท</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">การเข้าเรียนเฉลี่ย</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">95%</p>
      </UICard>
    </div>

    <UICard title="สรุปล่าสุด">
      <div class="space-y-3">
        <div v-for="item in updates" :key="item.id" class="p-3 rounded-lg border border-secondary-200">
          <p class="text-sm font-medium text-secondary-900">{{ item.title }}</p>
          <p class="text-xs text-secondary-600">{{ item.detail }}</p>
        </div>
      </div>
    </UICard>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const updates = [
  { id: 'u-1', title: 'ผลสอบกลางภาคประกาศแล้ว', detail: 'ตรวจสอบได้ที่เมนูบุตรหลาน' },
  { id: 'u-2', title: 'ใบแจ้งชำระค่าเทอม', detail: 'ครบกำหนดชำระวันที่ 20/01/2026' }
]
</script>
