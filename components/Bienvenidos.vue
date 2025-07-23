<template>
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl text-center">
        <!-- Logo circular -->
        <img src="/img/EquinoGrowt_logo.png" alt="Icono" class=" mb-4" />

        <!-- Contenido si está logueado -->
        <div v-if="usuario">
            <!-- Saludo personalizado -->
            <div class="bg-[#e6f5f3] border border-[#146b60] rounded-lg p-6 text-left relative">
                <h2 class="text-2xl font-bold text-[#146b60]">¡Hola, {{ usuario.displayName || 'Usuario' }}! 👋</h2>
                <p class="mt-2 text-gray-700">
                    Nos alegra verte de nuevo. <br>
                    Seguimos avanzando juntos en el camino de la equinoterapia.
                </p>

                <!-- Frase motivacional -->
                <p class="italic text-sm text-gray-500 mt-4">"Cada pequeño logro merece ser celebrado."</p>
            </div>

            <!-- Accesos rápidos -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <router-link to="/calendario"
                    class="flex items-center gap-4 p-4 bg-[#146b60] text-white rounded-lg shadow hover:bg-[#124f47] transition">
                    <i class="fa-solid fa-calendar-check text-2xl"></i>
                    <span class="text-left">
                        <p class="font-semibold text-base">Mi Calendario</p>
                        <p class="text-sm text-white/80">Consultá tus turnos y terapias</p>
                    </span>
                </router-link>
                <router-link to="/perfil"
                    class="flex items-center gap-4 p-4 border-2 border-[#146b60] rounded-lg text-[#146b60] hover:bg-[#e6f5f3] transition">
                    <i class="fa-solid fa-user-circle text-2xl"></i>
                    <span class="text-left">
                        <p class="font-semibold text-base">Mi Perfil</p>
                        <p class="text-sm text-[#146b60]/70">Actualizá tus datos personales</p>
                    </span>
                </router-link>
            </div>

            <!-- Imagen decorativa -->
            <img src="/img/banner-equinoterapia.jpg" alt="Banner Equinoterapia"
                class="rounded-xl mt-6 shadow-md object-cover max-h-60 w-full" />
        </div>

        <!-- Si NO está logueado -->
        <div v-else>
            <h1 class="text-3xl font-bold text-[#146b60] mb-4">
                ¡Bienvenidos!
            </h1>
            <p class="text-gray-700 text-lg mb-6">
                Un espacio dedicado al seguimiento y evolución de tratamientos en equinoterapia. Aquí podrás conectar
                con <span class="font-semibold text-[#146b60]">doctores, pacientes y familiares</span> para compartir
                avances, terapias y logros dentro.
            </p>
            <img src="/img/terapia-caballo.jpg" alt="Terapia"
                class="mx-auto mb-6 rounded-xl shadow-md max-h-64 object-cover" />
            <div class="flex flex-col sm:flex-row justify-center gap-4">
                <router-link to="/login"
                    class="w-full sm:w-auto px-6 py-2 bg-[#146b60] text-white rounded-md hover:bg-[#0e574e] transition">
                    Iniciar Sesión
                </router-link>
                <router-link to="/registro"
                    class="w-full sm:w-auto px-6 py-2 border-2 border-[#146b60] text-[#146b60] rounded-md hover:bg-[#e6f5f3] transition">
                    Registrarse
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const usuario = ref(null)

onMounted(() => {
    const auth = getAuth()
    onAuthStateChanged(auth, user => {
        usuario.value = user
    })
})
</script>
