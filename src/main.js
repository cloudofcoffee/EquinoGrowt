import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index';
import './style.css';
import './firebase';
import "@fortawesome/fontawesome-free/css/all.min.css";

// Registrar el Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js') // Registra el service worker
            .then((registration) => {
                console.log('Service Worker registrado con éxito:', registration);
            })
            .catch((error) => {
                console.log('Error al registrar el Service Worker:', error);
            });
    });
}

createApp(App)
    .use(router)
    .mount('#app');