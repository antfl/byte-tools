<script setup lang="ts">
import chevronDownIcon from '../../assets/icons/chevron-down.svg?raw'
import checkIcon from '../../assets/icons/check.svg?raw'

type SvgIconName = 'chevron-down' | 'check'

type ClassValue = string | Record<string, boolean> | Array<string | Record<string, boolean>>

const props = defineProps<{
  name: SvgIconName
  class?: ClassValue
}>()

const iconMap: Record<SvgIconName, string> = {
  'chevron-down': chevronDownIcon,
  'check': checkIcon
}

const iconSvg = iconMap[props.name]
</script>

<template>
  <span :class="props.class" v-html="iconSvg" />
</template>

