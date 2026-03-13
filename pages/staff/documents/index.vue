<template>
  <NuxtLayout name="admin" page-title="เอกสาร" page-description="จัดการเอกสารงานธุรการและทะเบียนโรงเรียน">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UICard title="เอกสารรอออกเลข">
        <div class="space-y-3">
          <div v-for="doc in pendingDocs" :key="doc.id" class="p-3 rounded-lg border border-secondary-200">
            <p class="text-sm font-medium text-secondary-900">{{ doc.title }}</p>
            <p class="text-xs text-secondary-600">{{ doc.detail }}</p>
            <div class="mt-2 flex justify-end">
              <UIButton
                variant="neutral"
                size="sm"
                class="btn-outline"
                icon="lucide:eye"
                :title="actionDisabledReason('documents', 'read', doc.schoolId) || 'ดูรายละเอียด'"
                :disabled="!canRead('documents', doc.schoolId)"
                @click="handleView(doc.id, doc.schoolId)"
              />
            </div>
          </div>
        </div>
      </UICard>

      <UICard title="รายการล่าสุด">
        <div class="space-y-3">
          <div v-for="doc in recentDocs" :key="doc.id" class="p-3 rounded-lg border border-secondary-200">
            <p class="text-sm font-medium text-secondary-900">{{ doc.title }}</p>
            <p class="text-xs text-secondary-600">{{ doc.number }}</p>
            <div class="mt-2 flex justify-end">
              <UIButton
                variant="neutral"
                size="sm"
                class="btn-outline"
                icon="lucide:eye"
                :title="actionDisabledReason('documents', 'read', doc.schoolId) || 'ดูรายละเอียด'"
                :disabled="!canRead('documents', doc.schoolId)"
                @click="handleView(doc.id, doc.schoolId)"
              />
            </div>
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

const { canRead, actionDisabledReason } = useScopeAccess()

const pendingDocs = [
  { id: 'd-1', title: 'หนังสือรับรองการเป็นนักเรียน', detail: 'รอเลขที่เอกสาร 7 รายการ', schoolId: 'SCH-101' },
  { id: 'd-2', title: 'เอกสารแนบอนุมัติครูใหม่', detail: 'รอลงนามผู้บริหาร 2 รายการ', schoolId: 'SCH-101' }
]

const recentDocs = [
  { id: 'd-3', title: 'หนังสือรับรองผลการเรียน', number: 'DOC-2026-00184', schoolId: 'SCH-101' },
  { id: 'd-4', title: 'หนังสือย้ายเข้า', number: 'DOC-2026-00185', schoolId: 'SCH-101' }
]

const handleView = (id: string, schoolId?: string) => {
  if (!canRead('documents', schoolId)) return
  navigateTo(`/staff/documents/${id}`)
}
</script>
