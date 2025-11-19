<template>
  <figure class="site-logo">
    <img
      class="site-logo-image"
      src="@/assets/logo.svg"
      alt="Byte Tools"
      loading="lazy"
    />
  </figure>
</template>

<script setup lang="ts">
defineProps<{
	compact?: boolean;
}>();
</script>

<style scoped>
.site-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.site-logo-image {
  display: block;
  width: 100%;
  height: auto;
}
</style>

