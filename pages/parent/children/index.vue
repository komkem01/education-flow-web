<template>
  <NuxtLayout name="admin" page-title="บุตรหลาน" page-description="ดูข้อมูลผลการเรียนและการเข้าเรียนรายบุคคล">
    <UICard>
      <UITable :columns="columns" :data="visibleRows" :pagination="pagination" :actions="{ view: true }" @view="handleView">
        <template #actions="{ row }">
          <UIButton
            variant="neutral"
            size="sm"
            class="btn-outline !px-2.5 !py-2 border-secondary-300"
            icon="lucide:eye"
            :title="actionDisabledReason('children', 'read', row.schoolId) || 'ดูรายละเอียด'"
            :disabled="!canRead('children', row.schoolId)"
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
  { key: 'name', label: 'ชื่อ - สกุล' },
  { key: 'classroom', label: 'ห้องเรียน' },
  { key: 'gpa', label: 'GPA' },
  { key: 'attendance', label: 'การเข้าเรียน' }
]

const rows = [
  { id: 'c-1', name: 'ณิชา วงศ์ชัย', classroom: 'ม.2/1', gpa: '3.56', attendance: '97%', schoolId: 'SCH-101' },
  { id: 'c-2', name: 'กิตติ วงศ์ชัย', classroom: 'ป.6/3', gpa: '3.42', attendance: '94%', schoolId: 'SCH-101' }
]

const visibleRows = computed(() => rows.filter((row) => canAccessSchool(row.schoolId)))

const pagination = computed(() => ({
  page: 1,
  limit: 10,
  total: visibleRows.value.length,
  totalPages: 1
}))

const handleView = (row: { id: string; schoolId?: string }) => {
  if (!canRead('children', row.schoolId)) return
  navigateTo(`/parent/children/${row.id}`)
}
</script>
