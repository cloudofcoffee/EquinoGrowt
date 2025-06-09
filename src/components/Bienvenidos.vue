<template>
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl text-center">
        <!-- Logo -->
        <img src="/img/EquinoGrowt.svg" alt="Logo"
            class="w-24 h-24 mx-auto mb-4 rounded-full" />

        <!-- Título -->
        <h1 class="text-3xl font-bold text-[#146b60] mb-4">Bienvenidos a EquinoGrowt</h1>

        <!-- Subtítulo -->
        <p class="text-gray-700 text-lg mb-6">
            Un espacio dedicado al seguimiento y evolución de tratamientos en equinoterapia. Aquí podrás conectar
            con
            <span class="font-semibold text-[#146b60]">doctores, pacientes y familiares</span> para compartir
            avances, terapias y logros.
        </p>

        <!-- Imagen decorativa o ilustración opcional -->
        <img src="/img/terapia-caballo.jpg" alt="Terapia"
            class="mx-auto mb-6 rounded-xl shadow-md max-h-64 object-cover" />

        <!-- Botones de navegación -->
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
</template>
<script>
export default {
    name: "Bienvenidos",
};
</script>
