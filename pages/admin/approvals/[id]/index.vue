<template>
  <NuxtLayout name="admin" page-title="รายละเอียดคำขออนุมัติ" page-description="ตรวจสอบข้อมูลและตัดสินใจอนุมัติคำขอ">
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex items-start gap-2">
          <UIButton variant="detail" icon="lucide:arrow-left" @click="navigateTo('/admin/approvals')">กลับ</UIButton>
          <div>
            <h3 class="text-base font-semibold text-secondary-900">{{ requestTypeLabel }}</h3>
            <p class="text-sm text-secondary-600">คำขอ #{{ record?.id || '-' }} - {{ dateText }}</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UIBadge v-if="record" :variant="statusVariant(record.status)">{{ statusText }}</UIBadge>
          <template v-if="record && record.status === 'pending'">
            <UIButton variant="edit" @click="showApproveConfirm = true">อนุมัติ</UIButton>
            <UIButton variant="delete" @click="showRejectModal = true">ปฏิเสธ</UIButton>
          </template>
        </div>
      </div>

      <UICard v-if="loading">
        <div class="animate-pulse space-y-3">
          <div class="h-4 w-40 rounded bg-secondary-200" />
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div v-for="item in 6" :key="item" class="rounded-lg border border-secondary-200 bg-secondary-50 p-3">
              <div class="h-3 w-24 rounded bg-secondary-200" />
              <div class="mt-2 h-4 w-32 rounded bg-secondary-300" />
            </div>
          </div>
        </div>
      </UICard>

      <UICard v-else-if="record">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label"># คำขอ</span>
            <span class="detail-value mono">{{ record.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">วันที่ยื่น</span>
            <span class="detail-value">{{ dateText }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">ผู้ยื่นคำขอ</span>
            <span class="detail-value">{{ record.requester_name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">บทบาท</span>
            <span class="detail-value">{{ roleLabel }}</span>
          </div>
          <div class="detail-item detail-item--full">
            <span class="detail-label">รายละเอียด</span>
            <span class="detail-value">{{ record.detail || '-' }}</span>
          </div>
          <div class="detail-item detail-item--full">
            <span class="detail-label">สถานะ</span>
            <span class="detail-value">
              <UIBadge :variant="statusVariant(record.status)">{{ statusText }}</UIBadge>
            </span>
          </div>
          <div v-if="record.comment" class="detail-item detail-item--full">
            <span class="detail-label">หมายเหตุผู้อนุมัติ</span>
            <span class="detail-value note-value">{{ record.comment }}</span>
          </div>
        </div>
      </UICard>

      <UICard v-else>
        <div class="py-8 text-center text-danger-600">ไม่พบข้อมูลคำขอ</div>
      </UICard>

      <UIModal
        v-model="showApproveConfirm"
        title="ยืนยันการอนุมัติ?"
        size="sm"
        :show-default-footer="false"
      >
        <p class="text-sm text-secondary-700">ต้องการอนุมัติคำขอของ {{ record?.requester_name || '-' }} ใช่หรือไม่?</p>
        <template #footer>
          <UIButton variant="detail" :disabled="updating" @click="showApproveConfirm = false">ยกเลิก</UIButton>
          <UIButton variant="primary" :loading="updating" @click="approveRecord">ยืนยันอนุมัติ</UIButton>
        </template>
      </UIModal>

      <UIModal
        v-model="showRejectModal"
        title="ระบุเหตุผลการปฏิเสธ"
        size="sm"
        :show-default-footer="false"
      >
        <div class="space-y-1">
          <label class="label">เหตุผล / หมายเหตุ <span class="text-danger-600">*</span></label>
          <textarea v-model="rejectNote" class="input form-textarea" placeholder="ระบุเหตุผลสำหรับผู้ยื่นคำขอ..." />
          <p v-if="rejectNoteError" class="error-message">{{ rejectNoteError }}</p>
        </div>
        <template #footer>
          <UIButton variant="detail" :disabled="updating" @click="showRejectModal = false">ยกเลิก</UIButton>
          <UIButton variant="danger" :loading="updating" @click="confirmReject">ยืนยันปฏิเสธ</UIButton>
        </template>
      </UIModal>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })

type BaseResponse<T> = { data: T }

type ReportsApprovalApiItem = {
  id: string
  type: string
  requester_name: string
  requester_role: string
  title: string
  detail: string
  status: 'pending' | 'approved' | 'rejected'
  comment: string | null
  created_at: string
}

const route = useRoute()
const { apiFetch } = useApi()
const { success, error } = useToast()

const requestId = computed(() => String(route.params.id ?? ''))
const requestType = computed(() => String(route.query.type ?? ''))

const record = ref<ReportsApprovalApiItem | null>(null)
const loading = ref(false)
const updating = ref(false)

const showApproveConfirm = ref(false)
const showRejectModal = ref(false)
const rejectNote = ref('')
const rejectNoteError = ref('')

const dateText = computed(() => {
  if (!record.value) return '-'
  return formatDate(record.value.created_at)
})

const requestTypeLabel = computed(() => {
  if (!record.value) return '-'
  return mapTypeLabel(record.value.type)
})

const roleLabel = computed(() => {
  if (!record.value) return '-'
  const map: Record<string, string> = {
    admin: 'แอดมิน',
    staff: 'บุคลากร',
    teacher: 'ครู',
    student: 'นักเรียน',
    parent: 'ผู้ปกครอง'
  }
  return map[record.value.requester_role] || record.value.requester_role
})

const statusText = computed(() => {
  if (!record.value) return '-'
  if (record.value.status === 'approved') return 'อนุมัติแล้ว'
  if (record.value.status === 'rejected') return 'ปฏิเสธ'
  return 'รออนุมัติ'
})

function statusVariant(status: string) {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  if (status === 'pending') return 'warning'
  return 'secondary'
}

function mapTypeLabel(type: string) {
  const map: Record<string, string> = {
    teacher_profile_request: 'คำขอแก้ไขโปรไฟล์ครู',
    teacher_leave: 'คำขอลาครู',
    inventory_request: 'คำขอเบิกพัสดุ'
  }
  return map[type] || type
}

function formatDate(value: string) {
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return '-'
  return dt.toLocaleDateString('th-TH')
}

async function load() {
  if (!requestId.value || !requestType.value) {
    record.value = null
    return
  }

  loading.value = true
  try {
    const res = await apiFetch<BaseResponse<ReportsApprovalApiItem>>(
      `/reports/approvals/${encodeURIComponent(requestType.value)}/${encodeURIComponent(requestId.value)}`
    )
    record.value = res.data || null
  } catch {
    record.value = null
    error('ไม่สามารถโหลดรายละเอียดคำขออนุมัติได้')
  } finally {
    loading.value = false
  }
}

async function patchRecord(status: 'approved' | 'rejected', comment: string | null) {
  if (!record.value) return
  await apiFetch(`/reports/approvals/${encodeURIComponent(record.value.type)}/${encodeURIComponent(record.value.id)}`, {
    method: 'PATCH',
    body: {
      status,
      comment
    }
  })
  await load()
}

async function approveRecord() {
  if (!record.value) return

  updating.value = true
  try {
    await patchRecord('approved', null)
    showApproveConfirm.value = false
    success('อนุมัติคำขอเรียบร้อย')
  } catch {
    error('ไม่สามารถอนุมัติคำขอได้')
  } finally {
    updating.value = false
  }
}

async function confirmReject() {
  if (!rejectNote.value.trim()) {
    rejectNoteError.value = 'กรุณาระบุเหตุผล'
    return
  }
  if (!record.value) return

  updating.value = true
  try {
    await patchRecord('rejected', rejectNote.value.trim())
    showRejectModal.value = false
    rejectNote.value = ''
    rejectNoteError.value = ''
    success('ปฏิเสธคำขอเรียบร้อย')
  } catch {
    error('ไม่สามารถปฏิเสธคำขอได้')
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 28px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item--full {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.95rem;
  color: #111827;
  font-weight: 500;
}

.detail-value.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

.note-value {
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.875rem;
}

.form-textarea {
  min-height: 90px;
  resize: vertical;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
