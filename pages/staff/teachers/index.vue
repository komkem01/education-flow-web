<template>
  <NuxtLayout name="admin" page-title="จัดการครู" page-description="ตรวจสอบและยืนยันข้อมูลครูตามโรงเรียนของคุณ">
    <UICard>
      <UITable :columns="columns" :data="visibleRows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #actions="{ row }">
          <UIButton
            variant="neutral"
            size="sm"
            class="btn-outline !px-2.5 !py-2 border-secondary-300"
            icon="lucide:eye"
            :title="actionDisabledReason('teachers', 'read', row.schoolId) || 'ดูรายละเอียด'"
            :disabled="!canRead('teachers', row.schoolId)"
            @click="handleView(row)"
          />
        </template>
      </UITable>
    </UICard>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { canRead, canAccessSchool, actionDisabledReason } = useScopeAccess()

const columns = [
  { key: 'name', label: 'ชื่อครู' },
  { key: 'subject', label: 'รายวิชา' },
  { key: 'status', label: 'สถานะเอกสาร' },
  { key: 'updatedAt', label: 'อัปเดตล่าสุด' }
]

const rows = [
  { id: 't-1', name: 'อรทัย นาคทอง', subject: 'คณิตศาสตร์', status: 'ครบถ้วน', updatedAt: 'วันนี้ 09:40', schoolId: 'SCH-101' },
  { id: 't-2', name: 'วรพล ชูใจ', subject: 'ภาษาอังกฤษ', status: 'รอไฟล์ใบประกอบวิชาชีพ', updatedAt: 'วันนี้ 08:15', schoolId: 'SCH-101' }
]

const visibleRows = computed(() => rows.filter((row) => canAccessSchool(row.schoolId)))

const pagination = computed(() => ({
  page: 1,
  limit: 10,
  total: visibleRows.value.length,
  totalPages: 1
}))

const handleView = (row: { id: string; schoolId?: string }) => {
  if (!canRead('teachers', row.schoolId)) return
  navigateTo(`/staff/teachers/${row.id}`)
}
</script>
