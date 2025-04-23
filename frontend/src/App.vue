<template>
  <div class="flex min-h-screen">
    <Sidebar />
    <div class="flex-grow">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import { useAuth } from './composables/useAuth';

const { loadUserFromStorage } = useAuth();

onMounted(() => {
  loadUserFromStorage();
});
</script>
