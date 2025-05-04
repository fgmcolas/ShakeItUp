<template>
  <div class="flex">
    <Sidebar />

    <main class="flex-1 p-4">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue';
import { useSidebarPadding } from './composables/useSidebarPadding';
import { useAuth } from './composables/useAuth';

useSidebarPadding();

const auth = useAuth();
console.log("User on app load:", auth.user);
</script>

<style>
body {
  margin: 0;
}
</style>
