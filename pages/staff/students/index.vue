<template>
  <NuxtLayout name="admin" page-title="จัดการนักเรียน" page-description="จัดการทะเบียนนักเรียนและสถานะการลงทะเบียน">
    <UICard>
      <UITable :columns="columns" :data="visibleRows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #cell-status="{ value }">
          <UIBadge :variant="value === 'พร้อมเรียน' ? 'success' : 'warning'">{{ value }}</UIBadge>
        </template>
        <template #actions="{ row }">
          <UIButton
            variant="neutral"
            size="sm"
            class="btn-outline !px-2.5 !py-2 border-secondary-300"
            icon="lucide:eye"
            :title="actionDisabledReason('students', 'read', row.schoolId) || 'ดูรายละเอียด'"
            :disabled="!canRead('students', row.schoolId)"
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
  { key: 'code', label: 'รหัสนักเรียน' },
  { key: 'name', label: 'ชื่อ - สกุล' },
  { key: 'classroom', label: 'ห้องเรียน' },
  { key: 'status', label: 'สถานะ' }
]

const rows = [
  { id: 's-1', code: 'STU-1042', name: 'ณิชา วงศ์ชัย', classroom: 'ม.1/2', status: 'พร้อมเรียน', schoolId: 'SCH-101' },
  { id: 's-2', code: 'STU-1043', name: 'ภาคิน ภูผา', classroom: 'ม.1/2', status: 'รอตรวจเอกสาร', schoolId: 'SCH-101' }
]

const visibleRows = computed(() => rows.filter((row) => canAccessSchool(row.schoolId)))

const pagination = computed(() => ({
  page: 1,
  limit: 10,
  total: visibleRows.value.length,
  totalPages: 1
}))

const handleView = (row: { id: string; schoolId?: string }) => {
  if (!canRead('students', row.schoolId)) return
  navigateTo(`/staff/students/${row.id}`)
}
</script>
