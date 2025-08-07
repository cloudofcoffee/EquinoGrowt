// --- Limpiar todo el almacenamiento solo la primera vez ---
function setCookie(name, value, days) {
  const maxAge = days ? `; max-age=${days * 24 * 60 * 60}` : '';
  document.cookie = `${name}=${value || ''}${maxAge}; path=/; samesite=lax`;
}
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

async function clearSiteData() {
  try {
    // 1️⃣ Borrar Cache Storage
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      console.log('Cache Storage borrado');
    }

    // 2️⃣ Borrar IndexedDB
    if ('indexedDB' in window) {
      const dbs = await indexedDB.databases();
      await Promise.all(dbs.map(db => indexedDB.deleteDatabase(db.name)));
      console.log('IndexedDB borrado');
    }

    // 3️⃣ Borrar Service Workers
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      console.log('Service Workers eliminados');
    }

    // 4️⃣ Recargar para iniciar limpio
    location.reload(true);
  } catch (err) {
    console.error('Error limpiando datos del sitio:', err);
  }
}

// Ejecutar solo la PRIMERA vez
if (!getCookie('siteDataCleared')) {
  setCookie('siteDataCleared', '1', 365); // Evita que se repita
  clearSiteData();
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