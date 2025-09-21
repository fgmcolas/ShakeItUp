<template>
  <div class="flex">
    <!-- Persistent app chrome -->
    <Sidebar />

    <!-- Page content switches via router -->
    <main class="flex-1 px-4">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue';
import { useSidebarPadding } from './composables/useSidebarPadding';

// Adjust layout padding when sidebar opens/closes
useSidebarPadding();
</script>

<style>
/* Remove default body margin to let Tailwind control spacing */
body {
  margin: 0;
}
</style>
