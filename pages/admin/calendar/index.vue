<template>
  <NuxtLayout name="admin" page-title="ปฏิทินการศึกษา" page-description="กิจกรรม วันสอบ และวันหยุดโรงเรียน">
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm text-secondary-600">ดูภาพรวมกิจกรรมของโรงเรียนทั้งจากปฏิทินและประกาศข่าว</p>
        </div>
        <div class="flex items-center gap-2">
          <UIButton variant="detail" icon="lucide:refresh-cw" :loading="loading" @click="loadEvents">รีเฟรช</UIButton>
          <UIButton v-if="canManageCalendar" variant="primary" icon="lucide:plus" @click="openAdd">เพิ่มกิจกรรม</UIButton>
        </div>
      </div>

      <UICard>
        <div class="cal-toolbar">
          <div class="flex items-center gap-2">
            <UIButton variant="detail" size="sm" icon="lucide:chevron-left" @click="prevMonth" />
            <div class="month-label">{{ monthLabel }}</div>
            <UIButton variant="detail" size="sm" icon="lucide:chevron-right" @click="nextMonth" />
            <UIButton variant="detail" size="sm" @click="goToday">วันนี้</UIButton>
          </div>

          <div class="legend">
            <span v-for="t in eventTypes" :key="t.type" class="legend-item">
              <span class="legend-dot" :class="`dot--${t.type}`" />
              {{ t.label }}
            </span>
          </div>
        </div>

        <div class="cal-card">
          <div class="cal-weekdays">
            <div v-for="d in weekdays" :key="d" class="cal-weekday">{{ d }}</div>
          </div>

          <div class="cal-grid">
            <div
              v-for="cell in calendarCells"
              :key="cell.key"
              class="cal-cell"
              :class="{
                'cal-cell--other': cell.otherMonth,
                'cal-cell--today': cell.isToday,
                'cal-cell--weekend': cell.isWeekend
              }"
              @click="cell.day && openAddOnDate(cell.dateStr)"
            >
              <span v-if="cell.day" class="cell-day">{{ cell.day }}</span>
              <div class="cell-events">
                <div
                  v-for="ev in cell.events.slice(0, 3)"
                  :key="ev.id"
                  class="cell-event"
                  :class="`ev--${ev.type}`"
                  :title="ev.title"
                  @click.stop="openDetail(ev)"
                >
                  {{ ev.title }}
                </div>
                <div v-if="cell.events.length > 3" class="cell-more" @click.stop="openDayList(cell.dateStr, cell.events)">
                  +{{ cell.events.length - 3 }} เพิ่มเติม
                </div>
              </div>
            </div>
          </div>
        </div>
      </UICard>

      <UICard>
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-secondary-900">กิจกรรมที่กำลังมาถึง</h3>
        </div>

        <div class="upcoming-list">
          <div v-for="ev in upcomingEvents" :key="ev.id" class="upcoming-row">
            <div class="upcoming-dot" :class="`dot--${ev.type}`" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-secondary-900">{{ ev.title }}</p>
              <p class="text-xs text-secondary-500">
                {{ formatDate(ev.date) }}
                <span v-if="ev.endDate && ev.endDate !== ev.date"> - {{ formatDate(ev.endDate) }}</span>
              </p>
            </div>
            <div v-if="canManageEvent(ev)" class="flex gap-1.5 justify-end flex-nowrap">
              <UIButton variant="edit" size="sm" @click="openEdit(ev)">แก้ไข</UIButton>
              <UIButton variant="delete" size="sm" @click="openDelete(ev)">ลบ</UIButton>
            </div>
          </div>

          <div v-if="!upcomingEvents.length" class="py-6 text-center text-sm text-secondary-500">
            ไม่มีกิจกรรมที่กำลังมาถึง
          </div>
        </div>
      </UICard>
    </div>

    <UIModal v-model="showDayModal" :title="`กิจกรรมวันที่ ${dayModalTitle}`" size="sm" :show-default-footer="false">
      <div class="day-event-list">
        <div
          v-for="ev in dayModalEvents"
          :key="ev.id"
          class="day-event-row"
          @click="showDayModal = false; openDetail(ev)"
        >
          <span class="legend-dot" :class="`dot--${ev.type}`" />
          <span class="day-event-title">{{ ev.title }}</span>
        </div>
      </div>

      <template #footer>
        <UIButton variant="detail" @click="showDayModal = false">ปิด</UIButton>
      </template>
    </UIModal>

    <UIModal v-model="showDetail" :title="detailEvent?.title || 'รายละเอียดกิจกรรม'" size="md" :show-default-footer="false">
      <div v-if="detailEvent" class="space-y-3">
        <div class="detail-row">
          <span class="d-label">ประเภท</span>
          <span class="ev-type-badge" :class="`ev-badge--${detailEvent.type}`">{{ eventTypeLabel(detailEvent.type) }}</span>
        </div>
        <div class="detail-row">
          <span class="d-label">วันที่</span>
          <span class="d-val">
            {{ formatDate(detailEvent.date) }}
            <span v-if="detailEvent.endDate && detailEvent.endDate !== detailEvent.date"> - {{ formatDate(detailEvent.endDate) }}</span>
          </span>
        </div>
        <p v-if="detailEvent.source === 'announcement'" class="detail-note">
          รายการนี้มาจากประกาศข่าว แก้ไขได้ที่หน้า "ประกาศและข่าวสาร"
        </p>
        <p v-if="detailEvent.description" class="detail-desc">{{ detailEvent.description }}</p>
      </div>

      <template #footer>
        <UIButton variant="detail" @click="showDetail = false">ปิด</UIButton>
        <UIButton
          v-if="canManageEvent(detailEvent)"
          variant="edit"
          @click="showDetail = false; detailEvent && openEdit(detailEvent)"
        >
          แก้ไข
        </UIButton>
      </template>
    </UIModal>

    <UIModal
      v-model="showModal"
      :title="isEditing ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรม'"
      size="md"
      :show-default-footer="false"
    >
      <div class="form-col">
        <div class="form-group">
          <label class="label">ชื่อกิจกรรม <span class="text-danger-600">*</span></label>
          <input v-model="form.title" class="input" placeholder="ชื่อกิจกรรม..." />
          <p v-if="formErrors.title" class="error-message">{{ formErrors.title }}</p>
        </div>

        <div class="form-group">
          <label class="label">ประเภท</label>
          <select v-model="form.type" class="input">
            <option v-for="t in editableEventTypes" :key="t.type" :value="t.type">{{ t.label }}</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="label">วันที่เริ่ม <span class="text-danger-600">*</span></label>
            <input v-model="form.date" type="date" class="input" />
            <p v-if="formErrors.date" class="error-message">{{ formErrors.date }}</p>
          </div>
          <div class="form-group">
            <label class="label">วันที่สิ้นสุด</label>
            <input v-model="form.endDate" type="date" class="input" />
          </div>
        </div>

        <div class="form-group">
          <label class="label">รายละเอียด</label>
          <textarea v-model="form.description" class="input form-textarea" rows="3" placeholder="รายละเอียดเพิ่มเติม..." />
        </div>
      </div>

      <template #footer>
        <UIButton variant="detail" :disabled="saving" @click="showModal = false">ยกเลิก</UIButton>
        <UIButton variant="primary" :loading="saving" @click="saveEvent">บันทึก</UIButton>
      </template>
    </UIModal>

    <UIModal v-model="showConfirm" title="ยืนยันการลบ" size="sm" :show-default-footer="false">
      <p class="text-sm text-secondary-700">ต้องการลบ "{{ deleteTarget?.title || '' }}" ใช่หรือไม่?</p>

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
type EventType = 'holiday' | 'exam' | 'activity' | 'meeting' | 'other'
type EventSource = 'calendar' | 'announcement'

type CalendarEvent = {
  id: string
  title: string
  date: string
  endDate?: string
  type: EventType
  description?: string
  source: EventSource
}

type CalendarEventApiItem = {
  id: string
  school_id: string
  created_by_member_id: string | null
  title: string
  description: string | null
  event_type: EventType
  start_date: string
  end_date: string | null
  is_active: boolean
}

type AnnouncementApiItem = {
  id: string
  title: string | null
  content: string | null
  category: string | null
  status: 'draft' | 'published' | 'expired'
  published_at: string | null
  expires_at: string | null
}

const { apiFetch } = useApi()
const { success, error } = useToast()
const authStore = useAuthStore()
const { canMutateByRole } = useScopeAccess()

const canManageCalendar = computed(() => canMutateByRole('school-calendar-events', authStore.user?.schoolId))

const events = ref<CalendarEvent[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

const weekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const eventTypes = [
  { type: 'holiday' as EventType, label: 'วันหยุด' },
  { type: 'exam' as EventType, label: 'สอบ' },
  { type: 'activity' as EventType, label: 'กิจกรรม' },
  { type: 'meeting' as EventType, label: 'ประชุม' },
  { type: 'other' as EventType, label: 'อื่นๆ' }
]
const editableEventTypes = eventTypes

const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth())

function mapEvent(item: CalendarEventApiItem): CalendarEvent {
  return {
    id: item.id,
    title: item.title,
    date: item.start_date,
    endDate: item.end_date || undefined,
    type: item.event_type,
    description: item.description || undefined,
    source: 'calendar'
  }
}

function mapAnnouncementCategoryToEventType(category: string | null): EventType {
  const normalized = (category || '').trim()
  if (normalized === 'วิชาการ') return 'exam'
  if (normalized === 'กิจกรรม') return 'activity'
  if (normalized === 'งานบุคคล') return 'meeting'
  if (normalized === 'ฉุกเฉิน') return 'holiday'
  return 'other'
}

function toDateOnly(value: string | null): string | null {
  if (!value) return null
  const direct = value.trim().slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(direct)) return direct
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

function mapAnnouncementToEvents(item: AnnouncementApiItem): CalendarEvent[] {
  if (item.status !== 'published') return []
  const title = (item.title || '').trim()
  if (!title) return []
  const effectiveDate = toDateOnly(item.published_at)
  if (!effectiveDate) return []
  const endDate = toDateOnly(item.expires_at)

  return [{
    id: `ann-${item.id}`,
    title,
    date: effectiveDate,
    endDate: endDate || undefined,
    type: mapAnnouncementCategoryToEventType(item.category),
    description: item.content || undefined,
    source: 'announcement'
  }]
}

async function loadEvents() {
  loading.value = true
  try {
    const [calendarRes, announcementRes] = await Promise.all([
      apiFetch<BaseResponse<CalendarEventApiItem[]>>('/school-calendar-events', {
        params: {
          only_active: true,
          page: 1,
          size: 300,
          sort_by: 'start_date',
          order_by: 'asc'
        }
      }),
      apiFetch<BaseResponse<AnnouncementApiItem[]>>('/school-announcements', {
        params: {
          page: 1,
          size: 300,
          sort_by: 'published_at',
          order_by: 'desc'
        }
      })
    ])

    const calendarItems = (Array.isArray(calendarRes.data) ? calendarRes.data : []).map(mapEvent)
    const announcementItems = (Array.isArray(announcementRes.data) ? announcementRes.data : []).flatMap(mapAnnouncementToEvents)
    events.value = [...calendarItems, ...announcementItems]
  } catch {
    events.value = []
    error('ไม่สามารถโหลดข้อมูลปฏิทินได้')
  } finally {
    loading.value = false
  }
}

function eventTypeLabel(type: EventType) {
  return eventTypes.find((item) => item.type === type)?.label || type
}

const monthLabel = computed(() => {
  const d = new Date(viewYear.value, viewMonth.value, 1)
  return d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
})

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value -= 1
    return
  }
  viewMonth.value -= 1
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value += 1
    return
  }
  viewMonth.value += 1
}

function goToday() {
  const today = new Date()
  viewYear.value = today.getFullYear()
  viewMonth.value = today.getMonth()
}

function eventsOnDate(dateStr: string) {
  return events.value.filter((ev) => {
    if (!ev.endDate) return ev.date === dateStr
    return dateStr >= ev.date && dateStr <= ev.endDate
  })
}

const calendarCells = computed(() => {
  const year = viewYear.value
  const month = viewMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = new Date().toISOString().slice(0, 10)
  const cells: Array<{
    key: string
    day: number | null
    dateStr: string
    otherMonth: boolean
    isToday: boolean
    isWeekend: boolean
    events: CalendarEvent[]
  }> = []

  const prevDays = new Date(year, month, 0).getDate()
  for (let i = firstDay - 1; i >= 0; i -= 1) {
    const d = prevDays - i
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dow = new Date(prevYear, prevMonth, d).getDay()
    cells.push({
      key: `p-${dateStr}`,
      day: d,
      dateStr,
      otherMonth: true,
      isToday: false,
      isWeekend: dow === 0 || dow === 6,
      events: eventsOnDate(dateStr)
    })
  }

  for (let d = 1; d <= daysInMonth; d += 1) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dow = new Date(year, month, d).getDay()
    cells.push({
      key: dateStr,
      day: d,
      dateStr,
      otherMonth: false,
      isToday: dateStr === todayStr,
      isWeekend: dow === 0 || dow === 6,
      events: eventsOnDate(dateStr)
    })
  }

  let nextDay = 1
  while (cells.length < 42) {
    const nextMonthValue = month === 11 ? 0 : month + 1
    const nextYearValue = month === 11 ? year + 1 : year
    const dateStr = `${nextYearValue}-${String(nextMonthValue + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`
    const dow = new Date(nextYearValue, nextMonthValue, nextDay).getDay()
    cells.push({
      key: `n-${dateStr}`,
      day: nextDay,
      dateStr,
      otherMonth: true,
      isToday: false,
      isWeekend: dow === 0 || dow === 6,
      events: eventsOnDate(dateStr)
    })
    nextDay += 1
  }

  return cells
})

const upcomingEvents = computed(() => {
  const todayStr = new Date().toISOString().slice(0, 10)
  return [...events.value]
    .filter((ev) => (ev.endDate || ev.date) >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)
})

function formatDate(value: string) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

const showDayModal = ref(false)
const dayModalTitle = ref('')
const dayModalEvents = ref<CalendarEvent[]>([])

function openDayList(dateStr: string, dayEvents: CalendarEvent[]) {
  dayModalTitle.value = formatDate(dateStr)
  dayModalEvents.value = dayEvents
  showDayModal.value = true
}

const showDetail = ref(false)
const detailEvent = ref<CalendarEvent | null>(null)

function openDetail(event: CalendarEvent) {
  detailEvent.value = event
  showDetail.value = true
}

function canManageEvent(event: CalendarEvent | null) {
  return !!event && event.source === 'calendar' && canManageCalendar.value
}

const showModal = ref(false)
const isEditing = ref(false)
let editTarget: CalendarEvent | null = null

const emptyForm = (): CalendarEvent => ({
  id: '',
  title: '',
  date: new Date().toISOString().slice(0, 10),
  endDate: '',
  type: 'activity',
  description: '',
  source: 'calendar'
})

const form = ref<CalendarEvent>(emptyForm())
const formErrors = ref({ title: '', date: '' })

function validate() {
  formErrors.value = { title: '', date: '' }
  if (!form.value.title.trim()) formErrors.value.title = 'กรุณาระบุชื่อกิจกรรม'
  if (!form.value.date) formErrors.value.date = 'กรุณาเลือกวันที่'
  return !formErrors.value.title && !formErrors.value.date
}

function openAdd() {
  if (!canManageCalendar.value) return
  isEditing.value = false
  editTarget = null
  form.value = emptyForm()
  formErrors.value = { title: '', date: '' }
  showModal.value = true
}

function openAddOnDate(dateStr: string) {
  if (!canManageCalendar.value) return
  openAdd()
  form.value.date = dateStr
}

function openEdit(event: CalendarEvent) {
  if (!canManageEvent(event)) return
  isEditing.value = true
  editTarget = event
  form.value = { ...event }
  formErrors.value = { title: '', date: '' }
  showModal.value = true
}

async function saveEvent() {
  if (!canManageCalendar.value) {
    error('บัญชีแอดมินหลักเป็นโหมดดูข้อมูล ไม่สามารถแก้ไขได้')
    return
  }

  if (!validate()) return

  if (!authStore.user?.schoolId) {
    formErrors.value.title = 'ไม่พบข้อมูลโรงเรียนสำหรับบันทึก'
    return
  }

  saving.value = true
  try {
    const payload = {
      school_id: authStore.user.schoolId,
      created_by_member_id: authStore.user.id || null,
      title: form.value.title.trim(),
      description: form.value.description?.trim() || null,
      event_type: form.value.type,
      start_date: form.value.date,
      end_date: form.value.endDate || null,
      is_active: true
    }

    if (isEditing.value && editTarget) {
      const res = await apiFetch<BaseResponse<CalendarEventApiItem>>(`/school-calendar-events/${editTarget.id}`, {
        method: 'PATCH',
        body: payload
      })
      const idx = events.value.findIndex((item) => item.id === editTarget?.id)
      if (idx !== -1) events.value[idx] = mapEvent(res.data)
      success('อัปเดตกิจกรรมสำเร็จ')
    } else {
      const res = await apiFetch<BaseResponse<CalendarEventApiItem>>('/school-calendar-events', {
        method: 'POST',
        body: payload
      })
      events.value.push(mapEvent(res.data))
      success('สร้างกิจกรรมสำเร็จ')
    }

    showModal.value = false
  } catch {
    error('บันทึกกิจกรรมไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

const showConfirm = ref(false)
const deleteTarget = ref<CalendarEvent | null>(null)

function openDelete(event: CalendarEvent) {
  if (!canManageCalendar.value) return
  deleteTarget.value = event
  showConfirm.value = true
}

async function confirmDelete() {
  if (!canManageCalendar.value) {
    showConfirm.value = false
    return
  }

  if (!deleteTarget.value?.id) {
    showConfirm.value = false
    return
  }

  deleting.value = true
  try {
    await apiFetch(`/school-calendar-events/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    events.value = events.value.filter((event) => event.id !== deleteTarget.value?.id)
    deleteTarget.value = null
    showConfirm.value = false
    success('ลบกิจกรรมสำเร็จ')
  } catch {
    error('ลบกิจกรรมไม่สำเร็จ')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.cal-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.month-label {
  min-width: 180px;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.legend {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: #6b7280;
}

.legend-dot,
.upcoming-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.dot--holiday {
  background: #f87171;
}

.dot--exam {
  background: #fb923c;
}

.dot--activity {
  background: #34d399;
}

.dot--meeting {
  background: #60a5fa;
}

.dot--other {
  background: #a78bfa;
}

.cal-card {
  margin-top: 12px;
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  overflow: hidden;
}

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border-bottom: 1px solid #f1f3f4;
}

.cal-weekday {
  padding: 8px 4px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.cal-cell {
  min-height: 96px;
  border-right: 1px solid #f1f3f4;
  border-bottom: 1px solid #f1f3f4;
  padding: 6px;
  cursor: pointer;
  transition: background 0.1s;
  overflow: hidden;
}

.cal-cell:hover {
  background: #fafafa;
}

.cal-cell:nth-child(7n) {
  border-right: none;
}

.cal-cell--other {
  background: #fafafa;
}

.cal-cell--other .cell-day {
  color: #d1d5db;
}

.cal-cell--today .cell-day {
  background: #111827;
  color: #fff;
  border-radius: 999px;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cal-cell--weekend .cell-day {
  color: #ef4444;
}

.cal-cell--today.cal-cell--weekend .cell-day {
  background: #ef4444;
  color: #fff;
}

.cell-day {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 4px;
  line-height: 1;
}

.cell-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cell-event {
  font-size: 0.68rem;
  padding: 1px 5px;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  font-weight: 500;
}

.ev--holiday {
  background: #fee2e2;
  color: #991b1b;
}

.ev--exam {
  background: #ffedd5;
  color: #9a3412;
}

.ev--activity {
  background: #d1fae5;
  color: #065f46;
}

.ev--meeting {
  background: #dbeafe;
  color: #1e40af;
}

.ev--other {
  background: #ede9fe;
  color: #5b21b6;
}

.cell-more {
  font-size: 0.65rem;
  color: #4f46e5;
  cursor: pointer;
  font-weight: 500;
  padding-left: 4px;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
}

.upcoming-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.upcoming-row:last-child {
  border-bottom: none;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.d-label {
  font-size: 0.82rem;
  color: #6b7280;
}

.d-val {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
}

.detail-desc {
  font-size: 0.875rem;
  color: #374151;
  background: #f9fafb;
  border-radius: 8px;
  padding: 10px 14px;
  line-height: 1.6;
}

.ev-type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.ev-badge--holiday {
  background: #fee2e2;
  color: #991b1b;
}

.ev-badge--exam {
  background: #ffedd5;
  color: #9a3412;
}

.ev-badge--activity {
  background: #d1fae5;
  color: #065f46;
}

.ev-badge--meeting {
  background: #dbeafe;
  color: #1e40af;
}

.ev-badge--other {
  background: #ede9fe;
  color: #5b21b6;
}

.detail-note {
  font-size: 0.78rem;
  color: #0f766e;
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 8px;
  padding: 8px 10px;
}

.day-event-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-event-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
}

.day-event-row:hover {
  background: #f9fafb;
}

.day-event-title {
  font-size: 0.875rem;
  color: #111827;
}

.form-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-textarea {
  min-height: 68px;
  resize: vertical;
}

@media (max-width: 1024px) {
  .cal-cell {
    min-height: 78px;
  }
}

@media (max-width: 768px) {
  .month-label {
    min-width: 140px;
    font-size: 0.92rem;
  }

  .cal-cell {
    min-height: 70px;
    padding: 4px;
  }

  .cell-event {
    font-size: 0.62rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
