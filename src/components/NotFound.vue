<template>
  <transition name="fade">
    <div class="flex flex-col items-center justify-center text-gray-800 p-6">
      <img src="/img/404-illustration.svg" alt="Página no encontrada"
        class="w-80 max-w-full mb-6 animate-fade-in-down" />

      <h1 class="text-5xl font-bold mb-2 text-teal-800">¡Oops!</h1>
      <p class="text-xl mb-4">{{ frase }}</p>

      <router-link to="/"
        class="mt-4 px-6 py-3 bg-teal-700 text-white rounded-xl shadow-lg hover:bg-teal-800 transition duration-300">
        Volver al inicio
      </router-link>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const frases = [
  "No pudimos encontrar esa página...",
  "Parece que te perdiste.",
  "404: Esta ruta se fue de paseo.",
  "¿Buscabas algo? Aquí no está.",
  "¡Oh no! Este corral está vacío.",
];

const frase = ref("");

onMounted(() => {
  const aleatoria = frases[Math.floor(Math.random() * frases.length)];
  frase.value = aleatoria;
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fade-in-down 0.6s ease-out both;
}
</style>
