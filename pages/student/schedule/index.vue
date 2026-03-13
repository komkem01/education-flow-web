<template>
  <NuxtLayout name="admin" page-title="ตารางเรียน" page-description="ตรวจสอบคาบเรียนประจำสัปดาห์">
    <UICard>
      <UITable :columns="columns" :data="visibleRows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #actions="{ row }">
          <UIButton
            variant="neutral"
            size="sm"
            class="btn-outline !px-2.5 !py-2 border-secondary-300"
            icon="lucide:eye"
            :title="actionDisabledReason('schedule', 'read', row.schoolId) || 'ดูรายละเอียด'"
            :disabled="!canRead('schedule', row.schoolId)"
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
  { key: 'day', label: 'วัน' },
  { key: 'time', label: 'เวลา' },
  { key: 'subject', label: 'รายวิชา' },
  { key: 'room', label: 'ห้องเรียน' }
]

const rows = [
  { id: 'sc-1', day: 'จันทร์', time: '08:30 - 09:20', subject: 'คณิตศาสตร์', room: 'อาคาร A ห้อง 203', schoolId: 'SCH-101' },
  { id: 'sc-2', day: 'จันทร์', time: '09:30 - 10:20', subject: 'ภาษาอังกฤษ', room: 'อาคาร A ห้อง 105', schoolId: 'SCH-101' }
]

const visibleRows = computed(() => rows.filter((row) => canAccessSchool(row.schoolId)))

const pagination = computed(() => ({
  page: 1,
  limit: 10,
  total: visibleRows.value.length,
  totalPages: 1
}))

const handleView = (row: { id: string; schoolId?: string }) => {
  if (!canRead('schedule', row.schoolId)) return
  navigateTo(`/student/schedule/${row.id}`)
}
</script>
