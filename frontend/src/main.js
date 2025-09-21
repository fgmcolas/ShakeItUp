import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/index.css';   // global styles (Tailwind + resets)
import { createPinia } from 'pinia';

const app = createApp(App);

app.use(createPinia());        // global state store
app.use(router);               // client-side routing
app.mount('#app');             // boot app on <div id="app">
