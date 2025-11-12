<template>
  <div class="app-shell">
    <AppHeader />
    <main class="app-main">
      <div class="home-page">
        <HeroSection />
        <FeatureHighlights />
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import HeroSection from "@/components/sections/HeroSection.vue";
import FeatureHighlights from "@/components/sections/FeatureHighlights.vue";
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  display: flex;
  justify-content: center;
}

.home-page {
  display: grid;
  gap: 1.2rem;
  position: relative;
  padding-bottom: 4rem;
  width: 100%;
  max-width: 100%;
}

.home-page::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: -1;
}
</style>

