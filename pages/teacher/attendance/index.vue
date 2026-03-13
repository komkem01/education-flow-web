<template>
  <NuxtLayout name="admin" page-title="เช็คชื่อ" page-description="บันทึกการเข้าเรียนของนักเรียนรายคาบ">
    <UICard>
      <UITable :columns="columns" :data="visibleRows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #cell-status="{ value }">
          <UIBadge :variant="value === 'มาเรียน' ? 'success' : 'warning'">{{ value }}</UIBadge>
        </template>
        <template #actions="{ row }">
          <UIButton
            variant="neutral"
            size="sm"
            class="btn-outline !px-2.5 !py-2 border-secondary-300"
            icon="lucide:eye"
            :title="actionDisabledReason('attendance', 'read', row.schoolId) || 'ดูรายละเอียด'"
            :disabled="!canRead('attendance', row.schoolId)"
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
  { key: 'student', label: 'นักเรียน' },
  { key: 'classroom', label: 'ห้อง' },
  { key: 'date', label: 'วันที่' },
  { key: 'status', label: 'สถานะ' }
]

const rows = [
  { id: 'at-1', student: 'ณิชา วงศ์ชัย', classroom: 'ม.2/1', date: '12/01/2026', status: 'มาเรียน', schoolId: 'SCH-101' },
  { id: 'at-2', student: 'ภาคิน ภูผา', classroom: 'ม.2/1', date: '12/01/2026', status: 'ลา', schoolId: 'SCH-101' }
]

const visibleRows = computed(() => rows.filter((row) => canAccessSchool(row.schoolId)))

const pagination = computed(() => ({
  page: 1,
  limit: 10,
  total: visibleRows.value.length,
  totalPages: 1
}))

const handleView = (row: { id: string; schoolId?: string }) => {
  if (!canRead('attendance', row.schoolId)) return
  navigateTo(`/teacher/attendance/${row.id}`)
}
</script>
