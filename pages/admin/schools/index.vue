<template>
  <NuxtLayout name="admin" page-title="จัดการข้อมูลโรงเรียน" page-description="ข้อมูลพื้นฐาน, ปีการศึกษา, โครงสร้างหลักสูตร และเอกสาร ปพ.">
    <div class="space-y-5">
      <div>
        <p v-if="schoolLoading" class="text-sm text-primary-700">กำลังโหลดข้อมูลโรงเรียน...</p>
        <p v-if="schoolError" class="text-sm text-danger-600">{{ schoolError }}</p>
      </div>

      <UICard v-if="isSuperAdmin" class="border-primary-200 bg-primary-50/40">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="text-base font-semibold text-secondary-900">สร้างโรงเรียนใหม่ (Super Admin)</h3>
          <div class="flex items-center gap-2">
            <UIButton variant="detail" @click="resetCreateSchoolForm">ล้างค่า</UIButton>
            <UIButton variant="primary" :loading="createSchoolLoading" @click="createSchoolBySuperAdmin">
              สร้างโรงเรียน
            </UIButton>
          </div>
        </div>
        <p class="mb-3 text-sm text-secondary-600">สร้างโรงเรียนแล้วระบบจะรีเฟรชข้อมูลโรงเรียนปัจจุบัน</p>
        <p v-if="createSchoolSuccess" class="mb-2 text-sm text-success-700">{{ createSchoolSuccess }}</p>
        <p v-if="createSchoolError" class="mb-2 text-sm text-danger-600">{{ createSchoolError }}</p>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UIInput v-model="createSchoolForm.name" label="ชื่อโรงเรียน" placeholder="เช่น โรงเรียนตัวอย่าง" required />
          <UIInput v-model="createSchoolForm.themeColor" label="สีธีมโรงเรียน" placeholder="#1d4ed8" />
          <UIInput v-model="createSchoolForm.logoUrl" class="md:col-span-2" label="โลโก้โรงเรียน (URL)" placeholder="https://..." />
          <div class="md:col-span-2">
            <label class="label">ที่อยู่</label>
            <textarea v-model="createSchoolForm.address" class="input min-h-[80px]" rows="2" />
          </div>
          <div class="md:col-span-2">
            <label class="label">รายละเอียด</label>
            <textarea v-model="createSchoolForm.description" class="input min-h-[80px]" rows="2" />
          </div>
        </div>
      </UICard>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <UICard>
          <div class="mb-3 flex items-center justify-between gap-3">
            <h3 class="text-base font-semibold text-secondary-900">ข้อมูลโรงเรียน</h3>
            <div class="flex items-center gap-2">
              <template v-if="!editingSchool">
                <UIButton variant="edit" @click="startEditSchool">แก้ไข</UIButton>
              </template>
              <template v-else>
                <UIButton variant="detail" @click="cancelEditSchool">ยกเลิก</UIButton>
                <UIButton variant="primary" :loading="schoolSaving" @click="saveSchool">บันทึก</UIButton>
              </template>
            </div>
          </div>

          <div class="space-y-3">
            <UIInput v-model="schoolForm.name" label="ชื่อโรงเรียน" :disabled="!editingSchool" />
            <UIInput v-model="schoolForm.logoUrl" label="โลโก้โรงเรียน (URL)" :disabled="!editingSchool" placeholder="https://..." />
            <UIInput v-model="schoolForm.themeColor" label="สีธีมโรงเรียน" :disabled="!editingSchool" placeholder="#1d4ed8" />
            <div>
              <label class="label">ที่อยู่</label>
              <textarea v-model="schoolForm.address" class="input min-h-[90px]" :disabled="!editingSchool" rows="3" />
            </div>
            <div>
              <label class="label">รายละเอียด</label>
              <textarea v-model="schoolForm.description" class="input min-h-[80px]" :disabled="!editingSchool" rows="2" />
            </div>
          </div>
        </UICard>

        <UICard>
          <div class="mb-3 flex items-center justify-between gap-3">
            <h3 class="text-base font-semibold text-secondary-900">ปีการศึกษาปัจจุบัน</h3>
            <div class="flex items-center gap-2">
              <template v-if="!editingYear">
                <UIButton variant="edit" @click="startEditYear">แก้ไข</UIButton>
                <UIButton variant="detail" @click="startAddYearTerm">เพิ่มเทอมใหม่</UIButton>
              </template>
              <template v-else>
                <UIButton variant="detail" @click="cancelEditYear">ยกเลิก</UIButton>
                <UIButton variant="primary" :loading="yearSaving" @click="saveYear">{{ addingYearTerm ? 'สร้างเทอม' : 'บันทึก' }}</UIButton>
              </template>
            </div>
          </div>

          <p v-if="addingYearTerm" class="mb-2 text-xs text-primary-700">โหมดเพิ่มเทอมใหม่: สร้างข้อมูลปีการศึกษา+เทอมใหม่สำหรับโรงเรียนนี้</p>
          <p v-if="yearLoading" class="mb-2 text-sm text-primary-700">กำลังโหลดปีการศึกษา...</p>
          <p v-if="yearError" class="mb-2 text-sm text-danger-600">{{ yearError }}</p>

          <div class="space-y-3">
            <div>
              <label class="label">ปีการศึกษา</label>
              <select v-model="yearForm.year" class="input" :disabled="!editingYear">
                <option value="">เลือกปีการศึกษา</option>
                <option v-for="item in academicYearOptions" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
            <div>
              <label class="label">ภาคเรียนที่</label>
              <select v-model="yearForm.semester" class="input" :disabled="!editingYear">
                <option value="">เลือกภาคเรียน</option>
                <option v-for="item in semesterOptions" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
            <div>
              <label class="label">วันเปิดเรียน</label>
              <input v-if="editingYear" v-model="yearForm.start" class="input" type="date" />
              <input v-else :value="formatDateThaiDisplay(yearForm.start)" class="input" disabled type="text" />
            </div>
            <div>
              <label class="label">วันปิดเรียน</label>
              <input v-if="editingYear" v-model="yearForm.end" class="input" type="date" />
              <input v-else :value="formatDateThaiDisplay(yearForm.end)" class="input" disabled type="text" />
            </div>
          </div>
        </UICard>
      </div>

      <UICard>
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="text-base font-semibold text-secondary-900">โครงสร้างหลักสูตร</h3>
          <UIButton variant="detail" @click="loadCurriculum">รีเฟรช</UIButton>
        </div>
        <p v-if="curriculumLoading" class="mb-2 text-sm text-primary-700">กำลังโหลดโครงสร้างหลักสูตร...</p>
        <p v-if="curriculumError" class="mb-2 text-sm text-danger-600">{{ curriculumError }}</p>

        <div class="overflow-x-auto rounded-lg border border-secondary-200">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-secondary-50 text-secondary-700">
              <tr>
                <th class="px-4 py-2">กลุ่มสาระ</th>
                <th class="px-4 py-2">จำนวนวิชา</th>
                <th class="px-4 py-2">ชั่วโมง/สัปดาห์</th>
                <th class="px-4 py-2">หน่วยกิต/ปี</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in curriculumRows" :key="row.group" class="border-t border-secondary-200">
                <td class="px-4 py-2">{{ row.group }}</td>
                <td class="px-4 py-2">{{ row.subjects }}</td>
                <td class="px-4 py-2">{{ row.hours }}</td>
                <td class="px-4 py-2">{{ row.credit }}</td>
              </tr>
              <tr v-if="!curriculumRows.length">
                <td colspan="4" class="px-4 py-4 text-center text-secondary-500">ไม่พบข้อมูลหลักสูตร</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UICard>

      <UICard>
        <h3 class="text-base font-semibold text-secondary-900">เอกสารสำคัญ (ปพ.)</h3>
        <p class="mt-1 text-sm text-secondary-600">ส่งออกเอกสารตามระเบียบกระทรวงศึกษาธิการ</p>
        <div class="mt-3 space-y-2">
          <div v-for="doc in docs" :key="doc.name" class="flex items-center gap-3 rounded-lg border border-secondary-200 p-3">
            <div class="text-lg">📄</div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-secondary-900">{{ doc.name }}</p>
              <p class="text-xs text-secondary-600">{{ doc.desc }}</p>
            </div>
            <UIButton variant="detail">ส่งออก</UIButton>
          </div>
        </div>
      </UICard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

type SchoolModel = {
  id: string
  name: string
  logo_url: string | null
  theme_color: string | null
  address: string
  description: string | null
}

type AcademicYearModel = {
  id: string
  year: string
  term: string
  is_current: boolean
  is_active: boolean
  start_date: string
  end_date: string
}

type SubjectModel = {
  id: string
  category: string | null
  credits: number | null
}

const { apiFetch } = useApi()
const { success, error } = useToast()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const isSuperAdmin = computed(() => authStore.currentRole === 'super_admin')

const schoolError = ref('')
const schoolLoading = ref(false)
const schoolSaving = ref(false)
const createSchoolLoading = ref(false)
const createSchoolError = ref('')
const createSchoolSuccess = ref('')
const yearError = ref('')
const yearLoading = ref(false)
const yearSaving = ref(false)
const curriculumError = ref('')
const curriculumLoading = ref(false)

const currentSchoolId = computed(() => String(authStore.user?.schoolId || ''))

const createSchoolForm = reactive({
  name: '',
  logoUrl: '',
  themeColor: '',
  address: '',
  description: ''
})

const editingSchool = ref(false)
const schoolForm = reactive({ name: '', logoUrl: '', themeColor: '', address: '', description: '' })
let schoolSnapshot = { ...schoolForm }

const editingYear = ref(false)
const addingYearTerm = ref(false)
const yearForm = reactive({ year: '', semester: '', start: '', end: '' })
let yearSnapshot = { ...yearForm }
const academicYears = ref<AcademicYearModel[]>([])
const currentAcademicYearId = ref('')
const MIN_BE_YEAR = 2500
const MAX_BE_YEAR = 2700

type CurriculumRow = { group: string; subjects: number; hours: number; credit: number }
const curriculumRows = ref<CurriculumRow[]>([])

const docs = [
  { name: 'ปพ.1', desc: 'ระเบียนแสดงผลการเรียน' },
  { name: 'ปพ.5', desc: 'สมุดรายงานประจาชั้น' },
  { name: 'ปพ.7', desc: 'ใบรับรองการเป็นนักเรียน' }
]

const academicYearOptions = computed(() => {
  const values = new Set(academicYears.value.map((item) => item.year).filter(Boolean))
  const inferredBase = new Date().getFullYear() + 543
  for (let offset = -1; offset <= 5; offset += 1) {
    values.add(String(inferredBase + offset))
  }
  return Array.from(values).sort((a, b) => Number(b) - Number(a))
})

const semesterOptions = computed(() => {
  const values = new Set(['1', '2', '3'])
  for (const item of academicYears.value) {
    if ((!yearForm.year || item.year === yearForm.year) && item.term) {
      values.add(item.term)
    }
  }
  return Array.from(values).sort((a, b) => Number(a) - Number(b))
})

const normalizeBuddhistYear = (value: string) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const numeric = Number(raw)
  if (Number.isFinite(numeric) && numeric > 1000 && numeric < 2400) {
    return String(Math.trunc(numeric) + 543)
  }
  return raw
}

const formatDateThaiDisplay = (isoDate: string) => {
  if (!isoDate) return '-'
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return isoDate
  const buddhistYear = Number(year) + 543
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${buddhistYear}`
}

const bindSchoolForm = (school: SchoolModel) => {
  schoolForm.name = school.name || ''
  schoolForm.logoUrl = school.logo_url || ''
  schoolForm.themeColor = school.theme_color || ''
  schoolForm.address = school.address || ''
  schoolForm.description = school.description || ''
}

const resetCreateSchoolForm = () => {
  createSchoolForm.name = ''
  createSchoolForm.logoUrl = ''
  createSchoolForm.themeColor = ''
  createSchoolForm.address = ''
  createSchoolForm.description = ''
  createSchoolError.value = ''
  createSchoolSuccess.value = ''
}

const createSchoolBySuperAdmin = async () => {
  createSchoolError.value = ''
  createSchoolSuccess.value = ''
  const payload = {
    name: createSchoolForm.name.trim(),
    logo_url: createSchoolForm.logoUrl.trim() || null,
    theme_color: createSchoolForm.themeColor.trim() || null,
    address: createSchoolForm.address.trim(),
    description: createSchoolForm.description.trim() || null
  }

  if (!payload.name) {
    createSchoolError.value = 'กรุณากรอกชื่อโรงเรียน'
    return
  }

  createSchoolLoading.value = true
  try {
    const response = await apiFetch<any>('/schools', {
      method: 'POST',
      body: payload
    })
    const school = response.data ?? response
    bindSchoolForm(school)
    schoolSnapshot = { ...schoolForm }
    editingSchool.value = false
    resetCreateSchoolForm()
    createSchoolSuccess.value = `สร้างโรงเรียนสำเร็จ: ${school.name}`
    await loadSchool()
    await Promise.all([loadAcademicYears(), loadCurriculum()])
  } catch {
    createSchoolError.value = 'สร้างโรงเรียนไม่สาเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    createSchoolLoading.value = false
  }
}

const loadSchool = async () => {
  if (!currentSchoolId.value) return
  schoolLoading.value = true
  schoolError.value = ''
  try {
    const response = await apiFetch<any>(`/schools/${currentSchoolId.value}`)
    const school = response.data ?? response
    bindSchoolForm(school)
    schoolSnapshot = { ...schoolForm }
  } catch {
    schoolError.value = 'ไม่สามารถโหลดข้อมูลโรงเรียนจากระบบได้'
  } finally {
    schoolLoading.value = false
  }
}

const startEditSchool = () => {
  schoolSnapshot = { ...schoolForm }
  editingSchool.value = true
}

const cancelEditSchool = () => {
  Object.assign(schoolForm, schoolSnapshot)
  editingSchool.value = false
}

const saveSchool = async () => {
  if (!currentSchoolId.value) {
    schoolError.value = 'ไม่พบ school_id ใน session'
    return
  }

  schoolSaving.value = true
  schoolError.value = ''
  try {
    await apiFetch(`/schools/${currentSchoolId.value}`, {
      method: 'PUT',
      body: {
        name: schoolForm.name.trim(),
        logo_url: schoolForm.logoUrl.trim() || null,
        theme_color: schoolForm.themeColor.trim() || null,
        address: schoolForm.address.trim(),
        description: schoolForm.description.trim() || null
      }
    })
    success('บันทึกข้อมูลโรงเรียนสำเร็จ')
    editingSchool.value = false
    await loadSchool()
  } catch {
    schoolError.value = 'บันทึกข้อมูลโรงเรียนไม่สาเร็จ'
  } finally {
    schoolSaving.value = false
  }
}

const bindAcademicYearForm = (item: AcademicYearModel) => {
  currentAcademicYearId.value = item.id
  yearForm.year = normalizeBuddhistYear(item.year)
  yearForm.semester = item.term
  yearForm.start = item.start_date
  yearForm.end = item.end_date
}

const loadAcademicYears = async () => {
  if (!currentSchoolId.value) return
  yearLoading.value = true
  yearError.value = ''
  try {
    const response = await apiFetch<any>('/academic-years', {
      params: {
        school_id: currentSchoolId.value,
        page: 1,
        limit: 100
      }
    })

    const payload = response.data ?? response
    const rows = Array.isArray(payload) ? payload : payload ? [payload] : []
    academicYears.value = rows.map((item: AcademicYearModel) => ({
      ...item,
      year: normalizeBuddhistYear(item.year)
    }))

    const current = academicYears.value.find((item) => item.is_current) || academicYears.value[0]
    if (current) {
      bindAcademicYearForm(current)
      yearSnapshot = { ...yearForm }
    }
  } catch {
    yearError.value = 'ไม่สามารถโหลดข้อมูลปีการศึกษาได้'
    academicYears.value = []
  } finally {
    yearLoading.value = false
  }
}

watch(
  () => [yearForm.year, yearForm.semester],
  () => {
    if (!editingYear.value || addingYearTerm.value) return
    const match = academicYears.value.find((item) => item.year === yearForm.year && item.term === yearForm.semester)
    if (!match) {
      currentAcademicYearId.value = ''
      yearForm.start = ''
      yearForm.end = ''
      return
    }
    currentAcademicYearId.value = match.id
    yearForm.start = match.start_date
    yearForm.end = match.end_date
  }
)

const startEditYear = () => {
  yearSnapshot = { ...yearForm }
  addingYearTerm.value = false
  editingYear.value = true
}

const startAddYearTerm = () => {
  yearSnapshot = { ...yearForm }
  addingYearTerm.value = true
  editingYear.value = true
  currentAcademicYearId.value = ''
  yearForm.year = yearForm.year.trim() || academicYearOptions.value[0] || ''
  yearForm.semester = ''
  yearForm.start = ''
  yearForm.end = ''
}

const cancelEditYear = () => {
  Object.assign(yearForm, yearSnapshot)
  addingYearTerm.value = false
  editingYear.value = false
}

const saveYear = async () => {
  if (!currentSchoolId.value) return
  yearError.value = ''

  const payload = {
    school_id: currentSchoolId.value,
    year: normalizeBuddhistYear(yearForm.year.trim()),
    term: yearForm.semester.trim(),
    is_current: true,
    is_active: true,
    start_date: yearForm.start,
    end_date: yearForm.end
  }

  if (!payload.year || !payload.term || !payload.start_date || !payload.end_date) {
    yearError.value = 'กรุณากรอกข้อมูลปีการศึกษาให้ครบ'
    return
  }

  const parsedYear = Number(payload.year)
  if (!Number.isInteger(parsedYear) || parsedYear < MIN_BE_YEAR || parsedYear > MAX_BE_YEAR) {
    yearError.value = `ปีการศึกษาต้องเป็น พ.ศ. และอยู่ในช่วง ${MIN_BE_YEAR}-${MAX_BE_YEAR}`
    return
  }

  const matched = academicYears.value.find((item) => item.year === payload.year && item.term === payload.term)
  const targetId = addingYearTerm.value ? '' : (currentAcademicYearId.value || matched?.id || '')

  if (!addingYearTerm.value && !targetId) {
    yearError.value = 'ไม่พบรายการปีการศึกษาที่ต้องการแก้ไข'
    return
  }

  if (addingYearTerm.value && matched) {
    yearError.value = 'ปีการศึกษาและเทอมนี้มีอยู่แล้ว'
    return
  }

  yearSaving.value = true
  try {
    if (targetId) {
      await apiFetch(`/academic-years/${targetId}`, {
        method: 'PATCH',
        body: payload
      })
    } else {
      await apiFetch('/academic-years', {
        method: 'POST',
        body: payload
      })
    }

    success('บันทึกปีการศึกษาสำเร็จ')
    await loadAcademicYears()
    addingYearTerm.value = false
    editingYear.value = false
  } catch {
    yearError.value = 'บันทึกปีการศึกษาไม่สาเร็จ'
  } finally {
    yearSaving.value = false
  }
}

const normalizeGroupName = (value: string | null | undefined) => {
  const text = (value || '').trim()
  return text || 'ไม่ระบุกลุ่มสาระ'
}

const toCurriculumRows = (subjects: SubjectModel[]): CurriculumRow[] => {
  const grouped = new Map<string, { subjects: number; credit: number }>()
  for (const item of subjects) {
    const key = normalizeGroupName(item.category)
    const current = grouped.get(key) || { subjects: 0, credit: 0 }
    current.subjects += 1
    current.credit += Number(item.credits || 0)
    grouped.set(key, current)
  }

  return Array.from(grouped.entries())
    .map(([group, stat]) => ({
      group,
      subjects: stat.subjects,
      hours: 0,
      credit: Number(stat.credit.toFixed(2))
    }))
    .sort((a, b) => a.group.localeCompare(b.group, 'th'))
}

const loadCurriculum = async () => {
  if (!currentSchoolId.value) return
  curriculumLoading.value = true
  curriculumError.value = ''
  try {
    const response = await apiFetch<any>('/subjects', {
      params: {
        school_id: currentSchoolId.value,
        page: 1,
        limit: 500
      }
    })
    const payload = response.data ?? response
    const list = Array.isArray(payload) ? payload : payload ? [payload] : []
    curriculumRows.value = toCurriculumRows(list)
  } catch {
    curriculumError.value = 'ไม่สามารถโหลดโครงสร้างหลักสูตรได้'
    curriculumRows.value = []
  } finally {
    curriculumLoading.value = false
  }
}

const openEditFromQuery = async () => {
  const queryValue = route.query.edit
  const editId = Array.isArray(queryValue) ? queryValue[0] : queryValue
  if (!editId) return
  editingSchool.value = true
  const query = { ...route.query }
  delete query.edit
  await router.replace({ path: route.path, query })
}

watch(
  () => currentSchoolId.value,
  async (schoolId) => {
    if (!schoolId) return
    await Promise.all([loadSchool(), loadAcademicYears(), loadCurriculum()])
  },
  { immediate: true }
)

onMounted(async () => {
  await openEditFromQuery()
})
</script>
