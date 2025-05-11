<template>
  <div class="flex">
    <Sidebar />

    <main class="flex-1 px-4">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue';
import { useSidebarPadding } from './composables/useSidebarPadding';

useSidebarPadding();

</script>

<style>
body {
  margin: 0;
}
</style>
