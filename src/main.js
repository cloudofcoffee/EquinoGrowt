// --- One-time cache clear (antes de registrar SW) ---
function setCookie(name, value, days) {
    const maxAge = days ? `; max-age=${days * 24 * 60 * 60}` : '';
    document.cookie = `${name}=${value || ''}${maxAge}; path=/; samesite=lax`;
}
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}
async function limpiarCacheTotal() {
    try {
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
            console.log('Caches eliminadas:', keys);
        }
        if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map(r => r.unregister()));
            console.log('Service Workers desregistrados:', regs.length);
        }
        sessionStorage.clear();
        localStorage.clear();
        console.log('Storage limpiado');
        location.reload();
    } catch (err) {
        console.error('Error al limpiar cache:', err);
    }
}

if (!getCookie('cacheInicialBorrado')) {
    setCookie('cacheInicialBorrado', '1', 365); // marcar por 1 año
    // Llamamos la limpieza. Puede recargar la página.
    limpiarCacheTotal();
}

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