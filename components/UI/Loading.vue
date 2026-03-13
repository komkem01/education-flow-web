<template>
  <div v-if="show" class="inline-block">
    <div class="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-secondary-200">
      <UISpinner :size="size" :variant="variant" />
      <span v-if="text" class="text-sm text-secondary-700">{{ text }}</span>
    </div>
  </div>

  <div
    v-else-if="fullscreen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm"
  >
    <div class="text-center">
      <UISpinner size="xl" :variant="variant" />
      <p v-if="text" class="mt-4 text-lg text-secondary-700">{{ text }}</p>
    </div>
  </div>

  <div
    v-else-if="overlay"
    class="absolute inset-0 z-40 flex items-center justify-center bg-white bg-opacity-75"
  >
    <div class="text-center">
      <UISpinner size="lg" :variant="variant" />
      <p v-if="text" class="mt-3 text-sm text-secondary-700">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show?: boolean
  fullscreen?: boolean
  overlay?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'white'
  text?: string
}>()
</script>
