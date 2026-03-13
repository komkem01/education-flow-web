<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <li v-for="(item, index) in items" :key="index" class="inline-flex items-center">
        <template v-if="index === 0">
          <!-- First item (Home) -->
          <NuxtLink
            v-if="!item.current"
            :to="item.path || '/'"
            class="inline-flex items-center text-sm font-medium text-secondary-700 hover:text-primary-600"
          >
            <Icon v-if="item.icon" :name="item.icon" class="w-4 h-4 mr-2" />
            {{ item.label }}
          </NuxtLink>
          <span v-else class="inline-flex items-center text-sm font-medium text-secondary-500">
            <Icon v-if="item.icon" :name="item.icon" class="w-4 h-4 mr-2" />
            {{ item.label }}
          </span>
        </template>
        <template v-else>
          <!-- Other items -->
          <div class="flex items-center">
            <Icon name="lucide:chevron-right" class="w-4 h-4 text-secondary-400" />
            <NuxtLink
              v-if="!item.current"
              :to="item.path || '#'"
              class="ml-1 text-sm font-medium text-secondary-700 hover:text-primary-600 md:ml-2"
            >
              {{ item.label }}
            </NuxtLink>
            <span v-else class="ml-1 text-sm font-medium text-secondary-500 md:ml-2">
              {{ item.label }}
            </span>
          </div>
        </template>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  path?: string
  icon?: string
  current?: boolean
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>
