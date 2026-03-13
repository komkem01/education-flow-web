<template>
  <NuxtLayout name="admin" page-title="คำขออนุมัติ" page-description="ตรวจสอบและอนุมัติคำขอจากผู้ใช้งาน">
    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-3">
        <UIInput
          v-model="searchQuery"
          placeholder="ค้นหาคำขอ..."
          @input="handleSearch"
        />
        <UISelect
          v-model="filterStatus"
          :options="statusOptions"
          placeholder="สถานะ"
          @update:model-value="handleFilterChange"
        />
      </div>
      <UIButton variant="secondary" icon="lucide:refresh-cw" @click="fetchApprovals">
        รีเฟรช
      </UIButton>
    </div>

    <UICard>
      <UITable
        :columns="columns"
        :data="approvals"
        :loading="loading"
        :actions="{}"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #cell-status="{ value }">
          <UIBadge :variant="statusVariant(value)">
            {{ statusLabel(value) }}
          </UIBadge>
        </template>

        <template #cell-requestType="{ value }">
          <span class="text-sm text-secondary-700">{{ requestTypeLabel(value) }}</span>
        </template>

        <template #cell-requestedAt="{ value }">
          <span class="text-sm text-secondary-700">{{ formatDate(value) }}</span>
        </template>

        <template #actions="{ row }">
          <div class="flex items-center gap-2">
            <UIButton
              variant="neutral"
              class="btn-outline !px-2.5 !py-2"
              size="sm"
              icon="lucide:eye"
              title="ดูรายละเอียด"
              @click="handleView(row)"
            />
            <UIButton
              v-if="row.status === 'pending'"
              variant="success"
              size="sm"
              icon="lucide:check"
              @click="handleApprove(row)"
            >
              อนุมัติ
            </UIButton>
            <UIButton
              v-if="row.status === 'pending'"
              variant="danger"
              size="sm"
              icon="lucide:x"
              @click="handleReject(row)"
            >
              ไม่อนุมัติ
            </UIButton>
          </div>
        </template>
      </UITable>
    </UICard>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ApprovalRequest } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { apiFetch } = useApi()
const { success, error } = useToast()

const approvals = ref<ApprovalRequest[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')

const columns = [
  { key: 'requesterName', label: 'ผู้ยื่นคำขอ' },
  { key: 'requestType', label: 'ประเภทคำขอ' },
  { key: 'title', label: 'หัวข้อ' },
  { key: 'status', label: 'สถานะ' },
  { key: 'requestedAt', label: 'วันที่ยื่นคำขอ' }
]

const statusOptions = [
  { label: 'ทั้งหมด', value: '' },
  { label: 'รออนุมัติ', value: 'pending' },
  { label: 'อนุมัติแล้ว', value: 'approved' },
  { label: 'ไม่อนุมัติ', value: 'rejected' },
  { label: 'ยกเลิก', value: 'cancelled' }
]

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const statusVariant = (status: string) => {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  if (status === 'pending') return 'warning'
  return 'secondary'
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: 'รออนุมัติ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ไม่อนุมัติ',
    cancelled: 'ยกเลิก'
  }
  return map[status] || status
}

const requestTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    teacher_registration: 'ลงทะเบียนครู',
    student_registration: 'ลงทะเบียนนักเรียน',
    profile_update: 'แก้ไขโปรไฟล์',
    subject_creation: 'เพิ่มรายวิชา',
    subject_update: 'แก้ไขรายวิชา',
    student_data_update: 'แก้ไขข้อมูลนักเรียน',
    document_request: 'คำขอเอกสาร',
    leave_request: 'คำขอลา',
    inventory_request: 'คำขอพัสดุ',
    other: 'อื่นๆ'
  }
  return map[type] || type
}

const formatDate = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchApprovals = async () => {
  loading.value = true
  try {
    const response = await apiFetch<any>('/approvals', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: searchQuery.value,
        status: filterStatus.value
      }
    })
    approvals.value = response.data || []
    pagination.value.total = response.total || 0
    pagination.value.totalPages = response.totalPages || 0
  } catch {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchApprovals()
}

const handleFilterChange = () => {
  pagination.value.page = 1
  fetchApprovals()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchApprovals()
}

const handleView = (approval: ApprovalRequest) => {
  if (!approval.id) return
  navigateTo(`/admin/approvals/${approval.id}`)
}

const handleApprove = async (approval: ApprovalRequest) => {
  try {
    await apiFetch(`/approvals/${approval.id}/approve`, {
      method: 'POST'
    })
    success('อนุมัติคำขอเรียบร้อย')
    await fetchApprovals()
  } catch {
    error('ไม่สามารถอนุมัติคำขอได้')
  }
}

const handleReject = async (approval: ApprovalRequest) => {
  try {
    await apiFetch(`/approvals/${approval.id}/reject`, {
      method: 'POST',
      body: {
        reason: 'Rejected by admin'
      }
    })
    success('ปฏิเสธคำขอเรียบร้อย')
    await fetchApprovals()
  } catch {
    error('ไม่สามารถปฏิเสธคำขอได้')
  }
}

onMounted(() => {
  fetchApprovals()
})
</script>
