<template>
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden relative">
        <!-- Loader -->
        <Loader v-if="cargando"
            class="absolute inset-0 z-10 bg-white/80 flex items-center justify-center rounded-2xl" />

        <!-- Columna Izquierda: Formulario -->
        <div :class="{ 'opacity-30 pointer-events-none': cargando }"
            class="md:w-1/2 w-full p-10 transition-opacity duration-300">
            <h2 class="text-2xl font-semibold text-[#146b60] mb-6 text-center md:text-left">
                Iniciar Sesión
            </h2>

            <form @submit.prevent="login" class="space-y-6 text-left">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <input type="email" v-model="email" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#146b60] focus:border-transparent transition" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input :type="mostrarPassword ? 'text' : 'password'" v-model="password" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#146b60] focus:border-transparent transition" />
                    <button type="button" @click="toggleMostrarPassword"
                        class="text-sm text-[#146b60] mt-1 hover:underline">
                        {{ mostrarPassword ? 'Ocultar' : 'Mostrar' }} contraseña
                    </button>
                </div>

                <button type="submit"
                    class="w-full bg-[#146b60] text-white py-3 rounded-lg hover:bg-[#0e574e] transition duration-300 font-semibold">
                    Entrar
                </button>
            </form>
        </div>

        <!-- Columna Derecha: Logo y título -->
        <div class="bg-[#146b60] text-white md:w-1/2 w-full p-10 flex flex-col items-center justify-center">
            <img src="/img/EquinoGrowt.svg" alt="Logo"
                class="bg-white w-36 h-36 mb-6 rounded-full border-4 border-white shadow-md transition-transform duration-300 hover:scale-105" />
            <h3 class="text-3xl font-extrabold text-center leading-tight">
                Bienvenido de nuevo <br />
                a EquinoGrowt
            </h3>
            <p class="mt-4 text-center">
                ¿No tenés una cuenta?<br class="md:hidden">
                <router-link to="/registro" class="ml-1 text-blue-500 hover:text-blue-400 transition font-semibold">Regístrate aca</router-link>
            </p>
        </div>
    </div>
</template>

<script>import Loader from "@/components/Loader.vue";
import Swal from "sweetalert2";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default {
    components: {
        Loader,
    },
    data() {
        return {
            email: "",
            password: "",
            mostrarPassword: false,
            errorMessage: "",
            cargando: false,
        };
    },
    methods: {
        async login() {
            const auth = getAuth();
            this.errorMessage = "";
            this.cargando = true;
            try {
                await signInWithEmailAndPassword(auth, this.email, this.password);

                Swal.fire({
                    title: "¡Inicio de sesión exitoso!",
                    text: "Has iniciado sesión correctamente.",
                    icon: "success",
                    confirmButtonText: "Aceptar",
                    timer: 3000,
                });

                this.$router.push("/"); // Redirige a la página principal
            } catch (error) {
                this.errorMessage = "Error al iniciar sesión: " + error.message;

                Swal.fire({
                    title: "Error",
                    text: this.errorMessage,
                    icon: "error",
                    confirmButtonText: "Intentar de nuevo",
                });
            } finally {
                this.cargando = false;
            }
        },
        toggleMostrarPassword() {
            this.mostrarPassword = !this.mostrarPassword;
        },
    },
};
</script>