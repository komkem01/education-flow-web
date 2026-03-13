<template>
  <NuxtLayout name="admin" page-title="การชำระเงิน" page-description="ติดตามใบแจ้งหนี้และสถานะการชำระ">
    <UICard>
      <UITable :columns="columns" :data="visibleRows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #cell-status="{ value }">
          <UIBadge :variant="value === 'ชำระแล้ว' ? 'success' : 'warning'">{{ value }}</UIBadge>
        </template>
        <template #actions="{ row }">
          <UIButton
            variant="neutral"
            size="sm"
            class="btn-outline !px-2.5 !py-2 border-secondary-300"
            icon="lucide:eye"
            :title="actionDisabledReason('payments', 'read', row.schoolId) || 'ดูรายละเอียด'"
            :disabled="!canRead('payments', row.schoolId)"
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
  { key: 'invoiceNo', label: 'เลขที่ใบแจ้งหนี้' },
  { key: 'student', label: 'นักเรียน' },
  { key: 'amount', label: 'จำนวนเงิน' },
  { key: 'dueDate', label: 'ครบกำหนด' },
  { key: 'status', label: 'สถานะ' }
]

const rows = [
  { id: 'pay-1', invoiceNo: 'INV-2026-0018', student: 'ณิชา วงศ์ชัย', amount: '3,000 บาท', dueDate: '20/01/2026', status: 'ค้างชำระ', schoolId: 'SCH-101' },
  { id: 'pay-2', invoiceNo: 'INV-2026-0011', student: 'กิตติ วงศ์ชัย', amount: '1,500 บาท', dueDate: '05/01/2026', status: 'ชำระแล้ว', schoolId: 'SCH-101' }
]

const visibleRows = computed(() => rows.filter((row) => canAccessSchool(row.schoolId)))

const pagination = computed(() => ({
  page: 1,
  limit: 10,
  total: visibleRows.value.length,
  totalPages: 1
}))

const handleView = (row: { id: string; schoolId?: string }) => {
  if (!canRead('payments', row.schoolId)) return
  navigateTo(`/parent/payments/${row.id}`)
}
</script>
