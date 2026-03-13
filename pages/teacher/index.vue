<template>
  <NuxtLayout name="admin" page-title="แดชบอร์ดครู" page-description="ภาพรวมการสอน คะแนน และการเข้าเรียน">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <UICard>
        <p class="text-sm text-secondary-600">คาบสอนวันนี้</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">5 คาบ</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">งานที่ต้องตรวจ</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">37</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">เช็คชื่อแล้ว</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">4/5</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">คำขอผู้ปกครอง</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">3</p>
      </UICard>
    </div>

    <UICard title="ตารางสอนวันนี้">
      <div class="space-y-3">
        <div v-for="item in schedule" :key="item.time" class="p-3 rounded-lg border border-secondary-200 flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-secondary-900">{{ item.subject }}</p>
            <p class="text-xs text-secondary-600">{{ item.classroom }}</p>
          </div>
          <p class="text-xs text-secondary-700">{{ item.time }}</p>
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

const schedule = [
  { subject: 'คณิตศาสตร์ ม.2', classroom: 'ม.2/1', time: '08:30 - 09:20' },
  { subject: 'คณิตศาสตร์ ม.2', classroom: 'ม.2/2', time: '09:30 - 10:20' },
  { subject: 'กิจกรรมโฮมรูม', classroom: 'ม.2/1', time: '13:00 - 13:50' }
]
</script>
