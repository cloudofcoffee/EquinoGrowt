<template>
  <div class="loader-container" :class="{ mini }">
    <div class="spinner"></div>
    <p class="loader-text">Cargando...</p>
  </div>
</template>

<script>
export default {
  name: "Loader",
  props: {
    mini: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

/* Cuando está en modo mini (por ejemplo dentro de una caja chica) */
.loader-container.mini {
  height: auto;
  padding: 1rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #cfe8e4;
  border-top: 6px solid #146b60;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loader-text {
  margin-top: 1rem;
  color: #146b60;
  font-size: 1.2rem;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
