<script setup lang="ts">
import { computed } from 'vue'
import { iconMap, type IconName } from '@/utils/iconMap'

type ClassValue = string | Record<string, boolean> | Array<string | Record<string, boolean>>

export type SvgIconName = IconName

const props = defineProps<{
  name: SvgIconName
  class?: ClassValue
  size?: number | string
}>()

const IconComponent = computed(() => {
  return iconMap[props.name]
})
</script>

<template>
  <component
    :is="IconComponent"
    :class="props.class"
    :size="props.size || 24"
    v-bind="$attrs"
    aria-hidden="true"
  />
</template>

