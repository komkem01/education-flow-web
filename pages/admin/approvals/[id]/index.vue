<template>
  <NuxtLayout name="admin" page-title="รายละเอียดคำขออนุมัติ" page-description="ตรวจสอบข้อมูลและตัดสินใจอนุมัติคำขอ">
    <div class="mb-6 flex items-center justify-between gap-3">
      <UIButton variant="detail" icon="lucide:arrow-left" @click="navigateTo('/admin/approvals')">
        กลับหน้ารายการ
      </UIButton>

      <div v-if="approval?.status === 'pending'" class="flex gap-2">
        <UIButton
          variant="success"
          icon="lucide:check"
          :disabled="!canSeeAction('approvals', 'approve', approval?.schoolId)"
          :title="actionDisabledReason('approvals', 'approve', approval?.schoolId) || 'อนุมัติ'"
          @click="handleApprove"
        >
          อนุมัติ
        </UIButton>
        <UIButton
          variant="danger"
          icon="lucide:x"
          :disabled="!canSeeAction('approvals', 'approve', approval?.schoolId)"
          :title="actionDisabledReason('approvals', 'approve', approval?.schoolId) || 'ไม่อนุมัติ'"
          @click="handleReject"
        >
          ไม่อนุมัติ
        </UIButton>
      </div>
    </div>

    <UICard v-if="loading">
      <div class="animate-pulse space-y-4">
        <div class="h-4 w-40 rounded bg-secondary-200" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div v-for="item in 6" :key="item" class="rounded-lg border border-secondary-200 bg-secondary-50 p-3">
            <div class="h-3 w-24 rounded bg-secondary-200" />
            <div class="mt-2 h-4 w-32 rounded bg-secondary-300" />
          </div>
        </div>
      </div>
    </UICard>

    <UICard v-else-if="approval">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AdminDetailField label="ผู้ยื่นคำขอ" :value="approval.requesterName" />
        <AdminDetailField label="บทบาทผู้ยื่น" :value="approval.requesterRole" />
        <AdminDetailField label="ประเภทคำขอ" :value="requestTypeLabel(approval.requestType)" />
        <AdminDetailField label="สถานะ">
          <UIBadge :variant="statusVariant(approval.status)">
            {{ statusLabel(approval.status) }}
          </UIBadge>
        </AdminDetailField>
        <AdminDetailField label="หัวข้อ" :value="approval.title" />
        <AdminDetailField label="วันที่ยื่น" :value="formatDate(approval.requestedAt)" />
        <AdminDetailField label="ผู้ตรวจสอบ" :value="approval.approverName" />
        <AdminDetailField label="วันที่ตรวจสอบ" :value="formatDate(approval.reviewedAt)" />
      </div>

      <div class="mt-4 rounded-lg border border-secondary-200 bg-secondary-50 p-4">
        <p class="text-xs uppercase tracking-wide text-secondary-500">รายละเอียดคำขอ</p>
        <p class="mt-2 text-sm text-secondary-800 whitespace-pre-wrap">{{ approval.description || '-' }}</p>
      </div>
    </UICard>

    <UICard v-else>
      <div class="py-8 text-center text-danger-600">ไม่พบข้อมูลคำขออนุมัติ</div>
    </UICard>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

const route = useRoute()
const { apiFetch } = useApi()
const { success, error } = useToast()
const { canSeeAction, actionDisabledReason } = useScopeAccess()

const approval = ref<any | null>(null)
const loading = ref(false)

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

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchApproval = async () => {
  loading.value = true
  try {
    const id = String(route.params.id)
    const response = await apiFetch<any>(`/approvals/${id}`)
    approval.value = response.data ?? response
  } catch {
    error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    approval.value = null
  } finally {
    loading.value = false
  }
}

const handleApprove = async () => {
  if (!approval.value?.id) return
  try {
    await apiFetch(`/approvals/${approval.value.id}/approve`, {
      method: 'POST'
    })
    success('อนุมัติคำขอเรียบร้อย')
    await fetchApproval()
  } catch {
    error('ไม่สามารถอนุมัติคำขอได้')
  }
}

const handleReject = async () => {
  if (!approval.value?.id) return
  try {
    await apiFetch(`/approvals/${approval.value.id}/reject`, {
      method: 'POST',
      body: {
        reason: 'Rejected by admin'
      }
    })
    success('ปฏิเสธคำขอเรียบร้อย')
    await fetchApproval()
  } catch {
    error('ไม่สามารถปฏิเสธคำขอได้')
  }
}

onMounted(() => {
  fetchApproval()
})
</script>
