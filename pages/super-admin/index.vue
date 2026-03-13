<template>
  <NuxtLayout name="admin" page-title="แดชบอร์ดส่วนกลาง" page-description="ภาพรวมทุกโรงเรียนและสุขภาพระบบ">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <UICard>
        <p class="text-sm text-secondary-600">โรงเรียนทั้งหมด</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">128</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">ผู้ใช้งานรวม</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">84,210</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">โรงเรียนพร้อมใช้งาน</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">124</p>
      </UICard>
      <UICard>
        <p class="text-sm text-secondary-600">ตั๋วช่วยเหลือ</p>
        <p class="text-2xl font-bold text-secondary-900 mt-1">9</p>
      </UICard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UICard title="โรงเรียนที่เพิ่งเปิดใช้งาน">
        <div class="space-y-3">
          <div v-for="school in activatedSchools" :key="school.id" class="p-3 rounded-lg border border-secondary-200">
            <p class="text-sm font-medium text-secondary-900">{{ school.name }}</p>
            <p class="text-xs text-secondary-600">เปิดใช้งานเมื่อ {{ school.date }}</p>
          </div>
        </div>
      </UICard>

      <UICard title="ทางลัดการจัดการ">
        <div class="grid grid-cols-1 gap-3">
          <NuxtLink to="/super-admin/schools" class="p-3 rounded-lg border border-secondary-200 hover:border-primary-400 hover:bg-primary-50 transition">
            <p class="text-sm font-medium text-secondary-900">เพิ่มโรงเรียนใหม่</p>
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

const activatedSchools = [
  { id: 's-1', name: 'โรงเรียนบ้านต้นน้ำ', date: '10/01/2026' },
  { id: 's-2', name: 'โรงเรียนชุมชนสายรุ้ง', date: '08/01/2026' }
]
</script>
