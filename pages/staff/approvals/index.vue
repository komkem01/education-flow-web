<template>
  <NuxtLayout name="admin" page-title="คำขออนุมัติ" page-description="ติดตามคำขอที่ต้องส่งต่อเพื่ออนุมัติ">
    <UICard>
      <UITable :columns="columns" :data="visibleRows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #cell-status="{ value }">
          <UIBadge :variant="statusVariant(value)">{{ value }}</UIBadge>
        </template>
        <template #actions="{ row }">
          <UIButton
            variant="neutral"
            size="sm"
            class="btn-outline !px-2.5 !py-2 border-secondary-300"
            icon="lucide:eye"
            :title="actionDisabledReason('approvals', 'read', row.schoolId) || 'ดูรายละเอียด'"
            :disabled="!canRead('approvals', row.schoolId)"
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
  { key: 'type', label: 'ประเภทคำขอ' },
  { key: 'requester', label: 'ผู้ยื่น' },
  { key: 'status', label: 'สถานะ' },
  { key: 'submittedAt', label: 'วันที่ส่ง' }
]

const rows = [
  { id: 'a-1', type: 'อนุมัติครูใหม่', requester: 'อรทัย นาคทอง', status: 'รอแอดมินโรงเรียน', submittedAt: '12/01/2026', schoolId: 'SCH-101', typeKey: 'teachers' },
  { id: 'a-2', type: 'แก้ไขข้อมูลนักเรียน', requester: 'งานทะเบียน', status: 'รอดำเนินการ', submittedAt: '11/01/2026', schoolId: 'SCH-101', typeKey: 'students' }
]

const visibleRows = computed(() => rows.filter((row) => canAccessSchool(row.schoolId)))

const pagination = computed(() => ({
  page: 1,
  limit: 10,
  total: visibleRows.value.length,
  totalPages: 1
}))

const handleView = (row: { id: string; schoolId?: string; typeKey?: string }) => {
  if (!canRead('approvals', row.schoolId)) return
  navigateTo({
    path: `/staff/approvals/${row.id}`,
    query: {
      type: row.typeKey || 'teachers'
    }
  })
}

const statusVariant = (status: string) => {
  if (status.includes('รอ')) return 'warning'
  if (status.includes('อนุมัติ')) return 'success'
  return 'secondary'
}
</script>
