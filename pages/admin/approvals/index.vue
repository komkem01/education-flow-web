<template>
  <NuxtLayout name="admin" page-title="คิวคำขออนุมัติ" page-description="คำขอแก้ไขข้อมูลโปรไฟล์จากครูที่รอการพิจารณา">
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span class="inline-flex items-center rounded-full border border-warning-200 bg-warning-50 px-3 py-1 text-xs font-semibold text-warning-800">
            รออนุมัติ {{ pendingCount }} รายการ
          </span>
        </div>
        <UIButton variant="detail" icon="lucide:refresh-cw" :loading="loading" @click="loadRows">รีเฟรช</UIButton>
      </div>

      <div class="summary-strip">
        <div v-for="s in summary" :key="s.label" class="summary-item">
          <span class="s-value" :style="s.color ? `color:${s.color}` : ''">{{ s.value }}</span>
          <span class="s-label">{{ s.label }}</span>
        </div>
      </div>

      <UICard>
        <div class="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="search-wrap w-full md:max-w-sm">
            <Icon name="lucide:search" class="search-icon" />
            <input v-model="search" class="input search" type="text" placeholder="ค้นหาผู้ยื่นคำขอหรือรายละเอียด..." autocomplete="off" />
          </div>

          <div class="tab-row">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              class="tab"
              :class="{ 'tab--active': activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
              <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
            </button>
          </div>
        </div>

        <UITable :columns="columns" :data="pagedRows" :loading="loading">
          <template #cell-type="{ value }">
            <span class="text-sm font-medium text-secondary-800">{{ requestTypeLabel(String(value)) }}</span>
          </template>

          <template #cell-status="{ value }">
            <UIBadge :variant="statusVariant(String(value))">{{ statusLabel(String(value)) }}</UIBadge>
          </template>

          <template #cell-created_at="{ value }">
            {{ formatDate(String(value)) }}
          </template>

          <template #actions="{ row }">
            <div class="action-btns">
              <UIButton v-if="row.status === 'pending'" variant="edit" size="sm" @click="openApproveConfirm(row as ApprovalRow)">อนุมัติ</UIButton>
              <UIButton v-if="row.status === 'pending'" variant="delete" size="sm" @click="openReject(row as ApprovalRow)">ปฏิเสธ</UIButton>
              <UIButton variant="detail" size="sm" @click="openDetail(row as ApprovalRow)">รายละเอียด</UIButton>
            </div>
          </template>
        </UITable>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <span class="text-xs text-secondary-600">
            {{ pageStart }}-{{ pageEnd }} จาก {{ filteredRows.length }} รายการ
          </span>

          <div class="page-btns">
            <button class="page-btn" :disabled="currentPage === 1" @click="currentPage = 1">«</button>
            <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
            <button
              v-for="p in pageNumbers"
              :key="String(p)"
              class="page-btn"
              :class="{ 'page-btn--active': p === currentPage, 'page-btn--ellipsis': p === '...' }"
              :disabled="p === '...'"
              @click="typeof p === 'number' && (currentPage = p)"
            >
              {{ p }}
            </button>
            <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
            <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage = totalPages">»</button>
          </div>

          <select v-model.number="pageSize" class="input page-size-select">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </UICard>
    </div>

    <UIModal
      v-model="showApproveModal"
      title="ยืนยันการอนุมัติ?"
      size="sm"
      :show-default-footer="false"
    >
      <p class="text-sm text-secondary-700">ต้องการอนุมัติคำขอของ {{ approveTarget?.requester_name || '-' }} ใช่หรือไม่?</p>
      <template #footer>
        <UIButton variant="detail" :disabled="updating" @click="showApproveModal = false">ยกเลิก</UIButton>
        <UIButton variant="primary" :loading="updating" @click="confirmApprove">ยืนยันอนุมัติ</UIButton>
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
        <textarea v-model="rejectNote" class="input min-h-[100px]" placeholder="ระบุเหตุผลสำหรับผู้ยื่นคำขอ..." />
        <p v-if="rejectNoteError" class="error-message">{{ rejectNoteError }}</p>
      </div>
      <template #footer>
        <UIButton variant="detail" :disabled="updating" @click="showRejectModal = false">ยกเลิก</UIButton>
        <UIButton variant="danger" :loading="updating" @click="confirmReject">ยืนยันปฏิเสธ</UIButton>
      </template>
    </UIModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

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

type ApprovalRow = ReportsApprovalApiItem

const { apiFetch } = useApi()
const { success, error } = useToast()

const loading = ref(false)
const updating = ref(false)
const rows = ref<ApprovalRow[]>([])

const columns = [
  { key: 'id', label: '#' },
  { key: 'type', label: 'ประเภทคำขอ' },
  { key: 'requester_name', label: 'ผู้ยื่นคำขอ' },
  { key: 'requester_role', label: 'บทบาท' },
  { key: 'detail', label: 'รายละเอียด' },
  { key: 'created_at', label: 'วันที่' },
  { key: 'status', label: 'สถานะ' }
]

const search = ref('')
const activeTab = ref<'all' | 'pending' | 'approved' | 'rejected'>('all')

const currentPage = ref(1)
const pageSize = ref(10)

const pendingCount = computed(() => rows.value.filter((item) => item.status === 'pending').length)
const approvedCount = computed(() => rows.value.filter((item) => item.status === 'approved').length)
const rejectedCount = computed(() => rows.value.filter((item) => item.status === 'rejected').length)

const summary = computed(() => [
  { value: pendingCount.value, label: 'รออนุมัติ', color: '#d97706' },
  { value: approvedCount.value, label: 'อนุมัติแล้ว', color: '#15803d' },
  { value: rejectedCount.value, label: 'ปฏิเสธ', color: '#b91c1c' },
  { value: rows.value.length, label: 'ทั้งหมด', color: '' }
])

const tabs = computed(() => [
  { key: 'all' as const, label: 'ทั้งหมด', count: 0 },
  { key: 'pending' as const, label: 'รออนุมัติ', count: pendingCount.value },
  { key: 'approved' as const, label: 'อนุมัติแล้ว', count: approvedCount.value },
  { key: 'rejected' as const, label: 'ปฏิเสธ', count: rejectedCount.value }
])

const filteredRows = computed(() => {
  let base = rows.value

  if (activeTab.value !== 'all') {
    base = base.filter((item) => item.status === activeTab.value)
  }

  const query = search.value.trim().toLowerCase()
  if (query) {
    base = base.filter((item) => {
      return (
        item.requester_name.toLowerCase().includes(query) ||
        requestTypeLabel(item.type).toLowerCase().includes(query) ||
        (item.detail || '').toLowerCase().includes(query)
      )
    })
  }

  return base
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const pageStart = computed(() => {
  if (filteredRows.value.length === 0) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const pageEnd = computed(() => {
  if (filteredRows.value.length === 0) return 0
  return Math.min(currentPage.value * pageSize.value, filteredRows.value.length)
})

const pageNumbers = computed<(number | '...')[]>(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (cur > 3) pages.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i += 1) pages.push(i)
  if (cur < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

watch([search, activeTab], () => {
  currentPage.value = 1
})

watch(pageSize, () => {
  currentPage.value = 1
})

watch(filteredRows, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

const statusVariant = (status: string) => {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  if (status === 'pending') return 'warning'
  return 'secondary'
}

const statusLabel = (status: string) => {
  if (status === 'approved') return 'อนุมัติแล้ว'
  if (status === 'rejected') return 'ปฏิเสธ'
  return 'รออนุมัติ'
}

const requestTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    teacher_profile_request: 'คำขอแก้ไขโปรไฟล์ครู',
    teacher_leave: 'คำขอลาครู',
    inventory_request: 'คำขอเบิกพัสดุ'
  }
  return map[type] || type
}

const formatDate = (value: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('th-TH')
}

const roleLabel = (role: string) => {
  const map: Record<string, string> = {
    admin: 'แอดมิน',
    staff: 'บุคลากร',
    teacher: 'ครู',
    student: 'นักเรียน',
    parent: 'ผู้ปกครอง'
  }
  return map[role] || role
}

async function loadRows() {
  loading.value = true
  try {
    const res = await apiFetch<BaseResponse<{ items: ReportsApprovalApiItem[] }>>('/reports/approvals')
    rows.value = Array.isArray(res.data?.items) ? res.data.items : []
  } catch {
    rows.value = []
    error('ไม่สามารถโหลดคำขออนุมัติได้')
  } finally {
    loading.value = false
  }
}

function openDetail(row: ApprovalRow) {
  navigateTo(`/admin/approvals/${encodeURIComponent(row.id)}?type=${encodeURIComponent(row.type)}`)
}

const showApproveModal = ref(false)
const showRejectModal = ref(false)
const approveTarget = ref<ApprovalRow | null>(null)
const rejectTarget = ref<ApprovalRow | null>(null)
const rejectNote = ref('')
const rejectNoteError = ref('')

function openApproveConfirm(row: ApprovalRow) {
  approveTarget.value = row
  showApproveModal.value = true
}

function openReject(row: ApprovalRow) {
  rejectTarget.value = row
  rejectNote.value = ''
  rejectNoteError.value = ''
  showRejectModal.value = true
}

async function patchRequest(target: ApprovalRow, status: 'approved' | 'rejected', comment: string | null) {
  await apiFetch(`/reports/approvals/${encodeURIComponent(target.type)}/${encodeURIComponent(target.id)}`, {
    method: 'PATCH',
    body: {
      status,
      comment
    }
  })
}

async function confirmApprove() {
  if (!approveTarget.value) return

  updating.value = true
  try {
    await patchRequest(approveTarget.value, 'approved', null)
    showApproveModal.value = false
    approveTarget.value = null
    success('อนุมัติคำขอเรียบร้อย')
    await loadRows()
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
  if (!rejectTarget.value) return

  updating.value = true
  try {
    await patchRequest(rejectTarget.value, 'rejected', rejectNote.value.trim())
    showRejectModal.value = false
    rejectTarget.value = null
    rejectNote.value = ''
    rejectNoteError.value = ''
    success('ปฏิเสธคำขอเรียบร้อย')
    await loadRows()
  } catch {
    error('ไม่สามารถปฏิเสธคำขอได้')
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  loadRows()
})
</script>

<style scoped>
.summary-strip {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-item {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 110px;
}

.s-value {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.1;
  color: #111827;
}

.s-label {
  font-size: 0.8rem;
  color: #6b7280;
}

.search-wrap {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.search {
  padding-left: 34px;
}

.tab-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  padding: 7px 14px;
  font-size: 0.86rem;
  background: #fff;
  color: #374151;
  cursor: pointer;
}

.tab--active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

.tab-count {
  background: #ef4444;
  color: #fff;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  min-width: 18px;
  padding: 1px 5px;
  text-align: center;
  line-height: 1.4;
}

.action-btns {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: nowrap;
}

.page-btns {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #fff;
  color: #374151;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0 6px;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.page-btn--active {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

.page-btn--ellipsis {
  border-color: transparent;
  background: transparent;
  cursor: default;
}

.page-size-select {
  width: 78px;
  height: 32px;
  padding: 4px 8px;
  font-size: 0.82rem;
}
</style>
