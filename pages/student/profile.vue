<template>
  <NuxtLayout name="admin" page-title="โปรไฟล์นักเรียน" page-description="ข้อมูลบัญชีและโรงเรียนของคุณ">
    <UICard>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailField label="ชื่อผู้ใช้" :value="authStore.user?.fullName || '-'" />
        <DetailField label="อีเมล" :value="authStore.user?.email || '-'" />
        <DetailField label="โรงเรียน" :value="authStore.user?.schoolName || authStore.user?.schoolId || '-'" />
        <DetailField label="บทบาท" :value="authStore.currentRole || '-'" />
      </div>
    </UICard>
  </NuxtLayout>
</template>

<script setup lang="ts">
import DetailField from '~/components/Admin/DetailField.vue'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const authStore = useAuthStore()
</script>
