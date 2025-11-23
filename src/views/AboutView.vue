<template>
  <div class="about-page-container">
    <AppHeader />
    <main class="about-page-main">
      <div class="about-page">
        <AboutHeroSection />
        <AboutFeaturesSection />
        <AboutToolsSection />
        <AboutTechSection />
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import AboutHeroSection from "@/components/sections/AboutHeroSection.vue";
import AboutFeaturesSection from "@/components/sections/AboutFeaturesSection.vue";
import AboutToolsSection from "@/components/sections/AboutToolsSection.vue";
import AboutTechSection from "@/components/sections/AboutTechSection.vue";
</script>

<style scoped lang="less">
.about-page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--surface);
}

.about-page-main {
  flex: 1;
  display: flex;
  justify-content: center;
}

.about-page {
  display: grid;
  gap: 0;
  position: relative;
  padding-bottom: 0;
  width: 100%;
  max-width: 100%;
}
</style>

