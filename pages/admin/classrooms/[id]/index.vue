<template>
  <NuxtLayout name="admin" page-title="รายละเอียดห้องเรียน" page-description="ข้อมูลห้องเรียน">
    <div v-if="loading" class="py-8 text-center text-sm text-secondary-500">กำลังโหลดข้อมูล...</div>

    <UICard v-else-if="!record" class="py-10 text-center">
      <p class="text-sm text-secondary-600">ไม่พบข้อมูลห้องเรียน</p>
      <div class="mt-4">
        <UIButton variant="primary" @click="navigateTo('/admin/classrooms')">กลับรายการ</UIButton>
      </div>
    </UICard>

    <template v-else>
      <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-secondary-900">{{ record.name }}</h2>
          <p class="text-sm text-secondary-500">ห้องเรียน {{ record.gradeLevel || 'ไม่ระบุระดับชั้น' }}</p>
          <p v-if="errorMessage" class="mt-1 text-sm text-danger-600">{{ errorMessage }}</p>
        </div>
        <div class="flex items-center gap-2">
          <UIButton variant="detail" @click="navigateTo('/admin/classrooms')">กลับ</UIButton>
          <UIButton variant="edit" @click="openEdit">แก้ไข</UIButton>
          <UIButton variant="delete" @click="showDeleteModal = true">ลบ</UIButton>
        </div>
      </div>

      <UICard>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminDetailField label="ชื่อห้องเรียน" :value="record.name" />
          <AdminDetailField label="ระดับชั้น" :value="record.gradeLevel || '-'" />
          <AdminDetailField label="ห้องที่ใช้เรียน" :value="record.roomNo || '-'" />
          <AdminDetailField label="ครูประจำชั้น" :value="record.advisorTeacherName || '-'" />
        </div>
      </UICard>
    </template>

    <UIModal
      v-model="showModal"
      title="แก้ไขห้องเรียน"
      size="lg"
      :show-default-footer="true"
      :loading="saving"
      @confirm="handleSave"
    >
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UIInput v-model="form.name" label="ชื่อห้องเรียน" placeholder="เช่น ม.1/1" required />
        <UISelect
          v-model="form.gradeLevel"
          label="ระดับชั้น"
          :options="gradeSelectOptions"
          placeholder="เลือกระดับชั้น"
        />
        <UIInput v-model="form.roomNo" class="md:col-span-2" label="ห้องที่ใช้เรียน" placeholder="เช่น อาคาร 1 ห้อง 101" />
        <UISelect
          v-model="form.advisorTeacherId"
          class="md:col-span-2"
          label="ครูประจำชั้น"
          :options="teacherOptions"
          placeholder="เลือกครูประจำชั้น"
        />
      </div>
    </UIModal>

    <UIModal
      v-model="showDeleteModal"
      title="ยืนยันการลบ"
      size="md"
      :show-default-footer="true"
      :loading="deleting"
      @confirm="confirmDelete"
    >
      <p class="text-sm text-secondary-700">
        ต้องการลบห้องเรียน
        <span class="font-semibold text-secondary-900">{{ record?.name }}</span>
        ใช่หรือไม่?
      </p>
    </UIModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const route = useRoute()
const { apiFetch } = useApi()
const { success, error } = useToast()
const authStore = useAuthStore()

type BaseResponse<T> = { data: T }

type ClassroomApiItem = {
  id: string
  school_id: string
  name: string
  grade_level: string | null
  room_no: string | null
  advisor_teacher_id: string | null
}

type TeacherApiItem = {
  id: string
  teacher_code: string | null
  first_name: string | null
  last_name: string | null
}

type Option = {
  value: string
  label: string
}

type ClassroomRow = {
  id: string
  schoolId: string
  name: string
  gradeLevel: string
  roomNo: string
  advisorTeacherId: string
  advisorTeacherName: string
}

const gradeOptions = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6']

const gradeSelectOptions = computed<Option[]>(() =>
  gradeOptions.map((item) => ({ value: item, label: item }))
)

const id = computed(() => String(route.params.id || '').trim())
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref('')

const teacherRows = ref<TeacherApiItem[]>([])
const record = ref<ClassroomRow | null>(null)

const teacherOptions = computed<Option[]>(() =>
  teacherRows.value
    .map((item) => {
      const first = (item.first_name || '').trim()
      const last = (item.last_name || '').trim()
      const fullName = `${first} ${last}`.trim()
      return {
        value: item.id,
        label: fullName || item.teacher_code || 'ไม่ระบุชื่อครู'
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'th'))
)

const showModal = ref(false)
const showDeleteModal = ref(false)

const form = reactive({
  name: '',
  gradeLevel: '',
  roomNo: '',
  advisorTeacherId: ''
})

const buildClassroomRow = (item: ClassroomApiItem) => {
  const teacherById = new Map(teacherOptions.value.map((opt) => [opt.value, opt.label] as const))
  const advisorTeacherId = String(item.advisor_teacher_id || '').trim()
  return {
    id: item.id,
    schoolId: item.school_id,
    name: String(item.name || '').trim(),
    gradeLevel: String(item.grade_level || '').trim(),
    roomNo: String(item.room_no || '').trim(),
    advisorTeacherId,
    advisorTeacherName: teacherById.get(advisorTeacherId) || '-'
  }
}

const fetchRecord = async () => {
  if (!id.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const [teachersRes, classroomRes] = await Promise.all([
      apiFetch<BaseResponse<TeacherApiItem[]>>('/teachers', { params: { only_active: false } }),
      apiFetch<BaseResponse<ClassroomApiItem>>(`/classrooms/${id.value}`)
    ])

    teacherRows.value = Array.isArray(teachersRes?.data) ? teachersRes.data : []
    const classroom = (classroomRes?.data || classroomRes) as ClassroomApiItem
    record.value = buildClassroomRow(classroom)
  } catch {
    record.value = null
    errorMessage.value = 'ไม่สามารถโหลดข้อมูลห้องเรียนได้'
    error('ไม่สามารถโหลดข้อมูลห้องเรียนได้')
  } finally {
    loading.value = false
  }
}

const openEdit = () => {
  if (!record.value) return
  form.name = record.value.name
  form.gradeLevel = record.value.gradeLevel
  form.roomNo = record.value.roomNo
  form.advisorTeacherId = record.value.advisorTeacherId
  showModal.value = true
}

const handleSave = async () => {
  if (!record.value) return

  const schoolId = String(authStore.user?.schoolId || '').trim()
  const name = form.name.trim()
  if (!name) {
    error('กรุณากรอกชื่อห้องเรียน')
    return
  }
  if (!schoolId) {
    error('ไม่พบ school id ของผู้ใช้งาน')
    return
  }

  saving.value = true
  try {
    await apiFetch(`/classrooms/${record.value.id}`, {
      method: 'PATCH',
      body: {
        school_id: schoolId,
        name,
        grade_level: form.gradeLevel || null,
        room_no: form.roomNo.trim() || null,
        advisor_teacher_id: form.advisorTeacherId || null
      }
    })
    success('แก้ไขห้องเรียนสำเร็จ')
    showModal.value = false
    await fetchRecord()
  } catch {
    errorMessage.value = 'บันทึกข้อมูลห้องเรียนไม่สำเร็จ'
    error('บันทึกข้อมูลห้องเรียนไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  if (!record.value) {
    showDeleteModal.value = false
    return
  }

  deleting.value = true
  try {
    await apiFetch(`/classrooms/${record.value.id}`, {
      method: 'DELETE'
    })
    success('ลบห้องเรียนสำเร็จ')
    showDeleteModal.value = false
    navigateTo('/admin/classrooms')
  } catch {
    errorMessage.value = 'ลบข้อมูลห้องเรียนไม่สำเร็จ'
    error('ลบข้อมูลห้องเรียนไม่สำเร็จ')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchRecord()
})
</script>
