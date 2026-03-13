<template>
  <NuxtLayout :name="layoutName" :page-title="pageTitle" :page-description="pageDescription">
    <div class="mb-6 flex items-center justify-between gap-3">
      <UIButton variant="detail" icon="lucide:arrow-left" @click="navigateTo(backPath)">
        กลับหน้ารายการ
      </UIButton>

      <UIButton
        v-if="editPath"
        variant="edit"
        icon="lucide:pencil"
        @click="handleEdit"
      >
        แก้ไขข้อมูล
      </UIButton>
    </div>

    <UICard v-if="loading">
      <div class="animate-pulse space-y-4">
        <div class="h-4 w-40 rounded bg-secondary-200" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            v-for="item in skeletonItems"
            :key="item"
            class="rounded-lg border border-secondary-200 bg-secondary-50 p-3"
          >
            <div class="h-3 w-24 rounded bg-secondary-200" />
            <div class="mt-2 h-4 w-32 rounded bg-secondary-300" />
          </div>
        </div>
      </div>
    </UICard>

    <UICard v-else-if="hasData">
      <slot />
    </UICard>

    <UICard v-else>
      <div class="py-8 text-center text-danger-600">{{ notFoundText }}</div>
    </UICard>
  </NuxtLayout>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  pageTitle: string
  pageDescription: string
  backPath: string
  loading: boolean
  hasData: boolean
  notFoundText: string
  editPath?: string
  editId?: string | number
  skeletonItems?: number
  layoutName?: string
}>(), {
  skeletonItems: 6,
  layoutName: 'admin'
})

const handleEdit = async () => {
  if (!props.editPath) return

  if (props.editId === undefined || props.editId === null || props.editId === '') {
    await navigateTo(props.editPath)
    return
  }

  await navigateTo({
    path: props.editPath,
    query: {
      edit: String(props.editId)
    }
  })
}
</script>
