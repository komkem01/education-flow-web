<template>
  <NuxtLayout name="admin" page-title="แดชบอร์ดนักเรียน" page-description="ภาพรวมตารางเรียน คะแนน และการเข้าเรียนของคุณ">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <UICard>
        <p class="text-sm text-secondary-600">คาบเรียนวันนี้</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">6 คาบ</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">ค่าเฉลี่ยสะสม</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">3.52</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">การเข้าเรียนเดือนนี้</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">96%</p>
      </UICard>
    </div>

    <UICard title="ประกาศสำหรับนักเรียน">
      <div class="space-y-3">
        <div v-for="notice in notices" :key="notice.id" class="p-3 rounded-lg border border-secondary-200">
          <p class="text-sm font-medium text-secondary-900">{{ notice.title }}</p>
          <p class="text-xs text-secondary-600">{{ notice.detail }}</p>
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

const notices = [
  { id: 'n-1', title: 'สอบกลางภาคสัปดาห์หน้า', detail: 'ตรวจสอบตารางสอบในเมนูตารางเรียน' },
  { id: 'n-2', title: 'ชำระค่ากิจกรรมภายใน 20 ม.ค.', detail: 'ติดต่อฝ่ายการเงินหากมีข้อสงสัย' }
]
</script>
