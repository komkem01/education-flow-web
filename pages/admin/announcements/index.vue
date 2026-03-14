<template>
  <NuxtLayout name="admin" page-title="ประกาศและข่าวสาร" page-description="จัดการประกาศและข่าวสารโรงเรียน">
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="text-sm text-secondary-600">
          จัดการประกาศสำหรับนักเรียน ครู และผู้ปกครอง
        </div>
        <div class="flex items-center gap-2">
          <UIButton variant="detail" icon="lucide:refresh-cw" :loading="loading" @click="loadRows">
            รีเฟรช
          </UIButton>
          <UIButton v-if="canManageAnnouncements" variant="primary" icon="lucide:plus" @click="openAdd">
            เพิ่มประกาศ
          </UIButton>
        </div>
      </div>

      <UICard>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div class="xl:col-span-2">
            <label class="label">ค้นหา</label>
            <input v-model="search" class="input" placeholder="ค้นหาชื่อประกาศ..." autocomplete="off" />
          </div>
          <div>
            <label class="label">หมวดหมู่</label>
            <select v-model="filterCategory" class="input">
              <option value="">ทุกหมวดหมู่</option>
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div>
            <label class="label">กลุ่มเป้าหมาย</label>
            <select v-model="filterTarget" class="input">
              <option value="">ทุกกลุ่มเป้าหมาย</option>
              <option v-for="t in targets" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="label">สถานะ</label>
            <select v-model="filterStatus" class="input">
              <option value="">ทุกสถานะ</option>
              <option value="เผยแพร่">เผยแพร่</option>
              <option value="ฉบับร่าง">ฉบับร่าง</option>
              <option value="หมดอายุ">หมดอายุ</option>
            </select>
          </div>
        </div>

        <div class="mt-3 flex justify-end">
          <UIButton
            v-if="search || filterCategory || filterTarget || filterStatus"
            variant="detail"
            size="sm"
            @click="clearFilters"
          >
            ล้างตัวกรอง
          </UIButton>
        </div>
      </UICard>

      <UICard>
        <UITable
          :columns="columns"
          :data="paginatedRows"
          :loading="loading"
          :pagination="pagination"
          @page-change="handlePageChange"
        >
          <template #cell-announcedAt="{ value }">
            {{ formatDateTH(value as string) }}
          </template>

          <template #cell-publishedAt="{ value }">
            {{ formatDateTH(value as string) }}
          </template>

          <template #cell-expiresAt="{ value }">
            {{ formatDateTH(value as string) }}
          </template>

          <template #cell-isPinned="{ value }">
            <span v-if="value" class="badge badge-warning">ปักหมุด</span>
            <span v-else class="text-secondary-400">-</span>
          </template>

          <template #cell-status="{ value }">
            <span class="badge" :class="statusClass(value as AnnouncementStatus)">{{ value }}</span>
          </template>

          <template #cell-category="{ value }">
            <span class="badge" :class="categoryClass(value as AnnouncementCategory)">{{ value }}</span>
          </template>

          <template #actions="{ row }">
            <div class="flex gap-1.5 justify-end flex-nowrap">
              <UIButton variant="detail" size="sm" @click="openDetail(row as AnnouncementRow)">ดู</UIButton>
              <UIButton v-if="canManageAnnouncements" variant="edit" size="sm" @click="openEdit(row as AnnouncementRow)">แก้ไข</UIButton>
              <UIButton v-if="canManageAnnouncements" variant="delete" size="sm" @click="openDelete(row as AnnouncementRow)">ลบ</UIButton>
            </div>
          </template>
        </UITable>
      </UICard>
    </div>

    <UIModal v-model="showDetail" :title="detailTarget?.title || 'รายละเอียดประกาศ'" size="lg" :show-default-footer="false">
      <div v-if="detailTarget" class="space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="badge" :class="categoryClass(detailTarget.category)">{{ detailTarget.category }}</span>
          <span class="badge" :class="statusClass(detailTarget.status)">{{ detailTarget.status }}</span>
          <span v-if="detailTarget.isPinned" class="badge badge-warning">ปักหมุด</span>
        </div>

        <div class="rounded-lg border border-secondary-200 bg-secondary-50 p-4 text-sm">
          <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
            <p><span class="text-secondary-500">กลุ่มเป้าหมาย:</span> {{ detailTarget.target }}</p>
            <p><span class="text-secondary-500">ผู้ประกาศ:</span> {{ detailTarget.createdBy || '-' }}</p>
            <p><span class="text-secondary-500">วันที่ประกาศ:</span> {{ formatDateTH(detailTarget.announcedAt) }}</p>
            <p><span class="text-secondary-500">วันที่เผยแพร่:</span> {{ formatDateTH(detailTarget.publishedAt) }}</p>
            <p><span class="text-secondary-500">วันหมดอายุ:</span> {{ formatDateTH(detailTarget.expiresAt) }}</p>
          </div>
        </div>

        <div class="rounded-lg border border-secondary-200 p-4 text-sm leading-7 whitespace-pre-wrap">
          {{ detailTarget.content || '-' }}
        </div>
      </div>

      <template #footer>
        <UIButton variant="detail" @click="showDetail = false">ปิด</UIButton>
        <UIButton
          v-if="canManageAnnouncements"
          variant="edit"
          @click="detailTarget && openEdit(detailTarget)"
        >
          แก้ไข
        </UIButton>
      </template>
    </UIModal>

    <UIModal
      v-model="showModal"
      :title="isEditing ? 'แก้ไขประกาศ' : 'เพิ่มประกาศใหม่'"
      size="xl"
      :show-default-footer="false"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="label">หัวข้อประกาศ <span class="text-danger-600">*</span></label>
          <input v-model="form.title" class="input" placeholder="ชื่อประกาศ..." />
          <p v-if="formErrors.title" class="error-message">{{ formErrors.title }}</p>
        </div>

        <div>
          <label class="label">หมวดหมู่</label>
          <select v-model="form.category" class="input">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label class="label">กลุ่มเป้าหมาย</label>
          <select v-model="form.target" class="input">
            <option v-for="t in targets" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div>
          <label class="label">วันที่ประกาศ</label>
          <input v-model="form.announcedAt" class="input" type="date" />
        </div>

        <div>
          <label class="label">วันที่เผยแพร่</label>
          <input v-model="form.publishedAt" class="input" type="date" />
        </div>

        <div>
          <label class="label">วันหมดอายุ</label>
          <input v-model="form.expiresAt" class="input" type="date" />
        </div>

        <div>
          <label class="label">สถานะ</label>
          <select v-model="form.status" class="input">
            <option value="เผยแพร่">เผยแพร่</option>
            <option value="ฉบับร่าง">ฉบับร่าง</option>
            <option value="หมดอายุ">หมดอายุ</option>
          </select>
        </div>

        <div class="md:col-span-2">
          <label class="inline-flex items-center gap-2 text-sm text-secondary-700">
            <input v-model="form.isPinned" type="checkbox" class="h-4 w-4 rounded border-secondary-300" />
            <span>ปักหมุดประกาศนี้</span>
          </label>
        </div>

        <div class="md:col-span-2">
          <label class="label">เนื้อหาประกาศ <span class="text-danger-600">*</span></label>
          <textarea v-model="form.content" class="input min-h-[140px]" rows="5" placeholder="รายละเอียดประกาศ..." />
          <p v-if="formErrors.content" class="error-message">{{ formErrors.content }}</p>
        </div>
      </div>

      <template #footer>
        <UIButton variant="detail" :disabled="saving" @click="showModal = false">ยกเลิก</UIButton>
        <UIButton variant="primary" :loading="saving" @click="saveRow">บันทึก</UIButton>
      </template>
    </UIModal>

    <UIModal
      v-model="showConfirm"
      title="ยืนยันการลบ"
      size="sm"
      :show-default-footer="false"
    >
      <p class="text-sm text-secondary-700">
        ต้องการลบประกาศ "{{ deleteTarget?.title || '' }}" ใช่หรือไม่?
      </p>

      <template #footer>
        <UIButton variant="detail" :disabled="deleting" @click="showConfirm = false">ยกเลิก</UIButton>
        <UIButton variant="danger" :loading="deleting" @click="confirmDelete">ยืนยันลบ</UIButton>
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

type AnnouncementCategory = 'ทั่วไป' | 'วิชาการ' | 'กิจกรรม' | 'งานบุคคล' | 'ฉุกเฉิน'
type AnnouncementTarget = 'ทุกคน' | 'ครู' | 'นักเรียน' | 'ผู้ปกครอง'
type AnnouncementStatus = 'เผยแพร่' | 'ฉบับร่าง' | 'หมดอายุ'

type AnnouncementRow = {
  id: string
  title: string
  content: string
  category: AnnouncementCategory
  target: AnnouncementTarget
  announcedAt: string
  publishedAt: string
  expiresAt: string
  isPinned: boolean
  status: AnnouncementStatus
  createdBy: string
}

type AnnouncementApiItem = {
  id: string
  school_id: string
  author_member_id: string
  title: string | null
  content: string | null
  category: string | null
  status: 'draft' | 'published' | 'expired'
  announced_at: string | null
  published_at: string | null
  expires_at: string | null
  created_by_name: string | null
  target_role: 'teacher' | 'student' | 'parent' | 'admin' | 'staff' | null
  is_pinned: boolean
}

const { apiFetch } = useApi()
const { success, error } = useToast()
const authStore = useAuthStore()
const { canMutateByRole } = useScopeAccess()

const canManageAnnouncements = computed(() => canMutateByRole('school-announcements', authStore.user?.schoolId))

const categories: AnnouncementCategory[] = ['ทั่วไป', 'วิชาการ', 'กิจกรรม', 'งานบุคคล', 'ฉุกเฉิน']
const targets: AnnouncementTarget[] = ['ทุกคน', 'ครู', 'นักเรียน', 'ผู้ปกครอง']

const rows = ref<AnnouncementRow[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

const columns = [
  { key: 'title', label: 'หัวข้อ' },
  { key: 'category', label: 'หมวดหมู่' },
  { key: 'target', label: 'กลุ่มเป้าหมาย' },
  { key: 'announcedAt', label: 'วันที่ประกาศ' },
  { key: 'publishedAt', label: 'วันที่เผยแพร่' },
  { key: 'expiresAt', label: 'วันหมดอายุ' },
  { key: 'isPinned', label: 'ปักหมุด' },
  { key: 'status', label: 'สถานะ' }
]

const search = ref('')
const filterCategory = ref('')
const filterTarget = ref('')
const filterStatus = ref('')

const page = ref(1)
const limit = ref(10)

const pagination = computed(() => {
  const total = filteredRows.value.length
  const totalPages = Math.max(1, Math.ceil(total / limit.value))
  return {
    page: page.value,
    limit: limit.value,
    total,
    totalPages
  }
})

const announcerDisplayName = computed(() => {
  const name = (authStore.user?.fullName || '').trim()
  if (name) return name
  const email = (authStore.user?.email || '').trim()
  if (email) return email
  return 'ผู้ใช้งานระบบ'
})

const targetToApi: Record<AnnouncementTarget, AnnouncementApiItem['target_role']> = {
  'ทุกคน': null,
  ครู: 'teacher',
  นักเรียน: 'student',
  ผู้ปกครอง: 'parent'
}

const statusToApi: Record<AnnouncementStatus, AnnouncementApiItem['status']> = {
  'ฉบับร่าง': 'draft',
  เผยแพร่: 'published',
  หมดอายุ: 'expired'
}

function toTargetLabel(target: AnnouncementApiItem['target_role']): AnnouncementTarget {
  if (target === 'teacher') return 'ครู'
  if (target === 'student') return 'นักเรียน'
  if (target === 'parent') return 'ผู้ปกครอง'
  return 'ทุกคน'
}

function toStatusLabel(status: AnnouncementApiItem['status']): AnnouncementStatus {
  if (status === 'draft') return 'ฉบับร่าง'
  if (status === 'expired') return 'หมดอายุ'
  return 'เผยแพร่'
}

function mapRow(item: AnnouncementApiItem): AnnouncementRow {
  const category = (item.category || 'ทั่วไป') as AnnouncementCategory
  return {
    id: item.id,
    title: (item.title || '').trim(),
    content: (item.content || '').trim(),
    category: categories.includes(category) ? category : 'ทั่วไป',
    target: toTargetLabel(item.target_role),
    announcedAt: item.announced_at || '',
    publishedAt: item.published_at || '',
    expiresAt: item.expires_at || '',
    isPinned: item.is_pinned,
    status: toStatusLabel(item.status),
    createdBy: (item.created_by_name || '').trim()
  }
}

function formatDateTH(value: string) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function statusClass(value: AnnouncementStatus) {
  if (value === 'เผยแพร่') return 'badge-success'
  if (value === 'หมดอายุ') return 'badge-danger'
  return 'badge-secondary'
}

function categoryClass(value: AnnouncementCategory) {
  if (value === 'ทั่วไป') return 'badge-primary'
  if (value === 'วิชาการ') return 'badge-secondary'
  if (value === 'กิจกรรม') return 'badge-success'
  if (value === 'งานบุคคล') return 'badge-warning'
  return 'badge-danger'
}

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (query && !row.title.toLowerCase().includes(query)) return false
    if (filterCategory.value && row.category !== filterCategory.value) return false
    if (filterTarget.value && row.target !== filterTarget.value) return false
    if (filterStatus.value && row.status !== filterStatus.value) return false
    return true
  })
})

const paginatedRows = computed(() => {
  const start = (page.value - 1) * limit.value
  const end = start + limit.value
  return filteredRows.value.slice(start, end)
})

function clearFilters() {
  search.value = ''
  filterCategory.value = ''
  filterTarget.value = ''
  filterStatus.value = ''
}

function handlePageChange(nextPage: number) {
  page.value = nextPage
}

async function loadRows() {
  loading.value = true
  try {
    const res = await apiFetch<BaseResponse<AnnouncementApiItem[]>>('/school-announcements', {
      params: {
        page: 1,
        size: 300,
        sort_by: 'created_at',
        order_by: 'desc'
      }
    })
    rows.value = (Array.isArray(res.data) ? res.data : []).map(mapRow)
  } catch {
    rows.value = []
    error('ไม่สามารถโหลดข้อมูลประกาศได้')
  } finally {
    loading.value = false
  }
}

watch([search, filterCategory, filterTarget, filterStatus], () => {
  page.value = 1
})

watch(filteredRows, () => {
  if (page.value > pagination.value.totalPages) {
    page.value = pagination.value.totalPages
  }
})

const showDetail = ref(false)
const detailTarget = ref<AnnouncementRow | null>(null)

function openDetail(row: AnnouncementRow) {
  detailTarget.value = row
  showDetail.value = true
}

const showModal = ref(false)
const isEditing = ref(false)
let editTargetId = ''

const emptyForm = (): AnnouncementRow => ({
  id: '',
  title: '',
  content: '',
  category: 'ทั่วไป',
  target: 'ทุกคน',
  announcedAt: new Date().toISOString().slice(0, 10),
  publishedAt: new Date().toISOString().slice(0, 10),
  expiresAt: '',
  isPinned: false,
  status: 'เผยแพร่',
  createdBy: announcerDisplayName.value
})

const form = ref<AnnouncementRow>(emptyForm())
const formErrors = ref({ title: '', content: '' })

function validate() {
  formErrors.value = { title: '', content: '' }
  if (!form.value.title.trim()) formErrors.value.title = 'กรุณาระบุหัวข้อประกาศ'
  if (!form.value.content.trim()) formErrors.value.content = 'กรุณาระบุเนื้อหาประกาศ'
  return !formErrors.value.title && !formErrors.value.content
}

function openAdd() {
  if (!canManageAnnouncements.value) return
  isEditing.value = false
  editTargetId = ''
  form.value = emptyForm()
  formErrors.value = { title: '', content: '' }
  showModal.value = true
}

function openEdit(row: AnnouncementRow) {
  if (!canManageAnnouncements.value) return
  isEditing.value = true
  editTargetId = row.id
  form.value = { ...row, createdBy: announcerDisplayName.value }
  formErrors.value = { title: '', content: '' }
  showModal.value = true
  showDetail.value = false
}

async function saveRow() {
  if (!canManageAnnouncements.value) {
    error('บัญชีแอดมินหลักเป็นโหมดดูข้อมูล ไม่สามารถแก้ไขได้')
    return
  }

  if (!validate()) return

  if (!authStore.user?.id) {
    formErrors.value.title = 'ไม่พบข้อมูลผู้ใช้สำหรับบันทึกประกาศ'
    return
  }

  saving.value = true
  try {
    const payload = {
      school_id: authStore.user.schoolId || null,
      author_member_id: authStore.user.id,
      title: form.value.title.trim() || null,
      content: form.value.content.trim() || null,
      category: form.value.category,
      status: statusToApi[form.value.status],
      announced_at: form.value.announcedAt || null,
      published_at: form.value.publishedAt || null,
      expires_at: form.value.expiresAt || null,
      created_by_name: announcerDisplayName.value,
      target_role: targetToApi[form.value.target],
      is_pinned: form.value.isPinned
    }

    if (isEditing.value && editTargetId) {
      const res = await apiFetch<BaseResponse<AnnouncementApiItem>>(`/school-announcements/${editTargetId}`, {
        method: 'PATCH',
        body: payload
      })
      const idx = rows.value.findIndex((item) => item.id === editTargetId)
      if (idx !== -1) rows.value[idx] = mapRow(res.data)
      success('อัปเดตประกาศสำเร็จ')
    } else {
      const res = await apiFetch<BaseResponse<AnnouncementApiItem>>('/school-announcements', {
        method: 'POST',
        body: payload
      })
      rows.value.unshift(mapRow(res.data))
      success('สร้างประกาศสำเร็จ')
    }

    showModal.value = false
  } catch {
    error('บันทึกประกาศไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

const showConfirm = ref(false)
const deleteTarget = ref<AnnouncementRow | null>(null)

function openDelete(row: AnnouncementRow) {
  if (!canManageAnnouncements.value) return
  deleteTarget.value = row
  showConfirm.value = true
}

async function confirmDelete() {
  if (!canManageAnnouncements.value) {
    showConfirm.value = false
    return
  }

  if (!deleteTarget.value?.id) {
    showConfirm.value = false
    return
  }

  deleting.value = true
  try {
    await apiFetch(`/school-announcements/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    rows.value = rows.value.filter((item) => item.id !== deleteTarget.value?.id)
    success('ลบประกาศสำเร็จ')
    deleteTarget.value = null
    showConfirm.value = false
  } catch {
    error('ลบประกาศไม่สำเร็จ')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadRows()
})
</script>
