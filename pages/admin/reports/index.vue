<template>
  <NuxtLayout name="admin" page-title="รายงาน" page-description="สรุปข้อมูลและรายงานสำหรับผู้ดูแลระบบ">
    <UICard>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-xl border border-secondary-200 bg-secondary-50 p-4">
          <p class="text-sm text-secondary-600">นักเรียนทั้งหมด</p>
          <p class="mt-2 text-2xl font-semibold text-secondary-900">{{ summary.students }}</p>
        </div>
        <div class="rounded-xl border border-secondary-200 bg-secondary-50 p-4">
          <p class="text-sm text-secondary-600">ครูทั้งหมด</p>
          <p class="mt-2 text-2xl font-semibold text-secondary-900">{{ summary.teachers }}</p>
        </div>
        <div class="rounded-xl border border-secondary-200 bg-secondary-50 p-4">
          <p class="text-sm text-secondary-600">อัตราเข้าเรียน</p>
          <p class="mt-2 text-2xl font-semibold text-secondary-900">{{ summary.attendanceRate }}%</p>
        </div>
        <div class="rounded-xl border border-secondary-200 bg-secondary-50 p-4">
          <p class="text-sm text-secondary-600">คำขอรออนุมัติ</p>
          <p class="mt-2 text-2xl font-semibold text-secondary-900">{{ summary.pendingApprovals }}</p>
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

const summary = reactive({
  students: 0,
  teachers: 0,
  attendanceRate: 0,
  pendingApprovals: 0
})
</script>
