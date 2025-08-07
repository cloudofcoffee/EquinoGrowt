<template>
    <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row-reverse overflow-hidden relative">

        <!-- Loader -->
        <Loader v-if="cargando"
            class="absolute inset-0 z-10 bg-white/80 flex items-center justify-center rounded-2xl" />

        <!-- Columna Izquierda (Logo y Bienvenida en escritorio / Arriba en mobile) -->
        <div class="bg-[#146b60]  text-white md:w-1/2 w-full p-10 flex flex-col items-center justify-center space-y-4">
            <img src="/img/EquinoGrowt.svg" alt="Logo"
                class="bg-white w-32 h-32 rounded-full border-4 border-white shadow-md transition-transform duration-300 hover:scale-105" />
            <h3 class="text-2xl md:text-3xl font-bold text-center leading-snug">
                ¡Hola usuario!<br />
                Bienvenido de nuevo
            </h3>
            <p class="text-sm text-center mt-2">
                ¿No tenés una cuenta?<br class="md:hidden" />
                <router-link to="/registro"
                    class="text-blue-200 hover:text-blue-100 hover:underline transition duration-300 font-semibold">
                    Registrate acá
                </router-link>
            </p>
        </div>

        <!-- Columna Derecha (Formulario) -->
        <div :class="{ 'opacity-30 pointer-events-none': cargando }"
            class="md:w-1/2 w-full brand-pattern p-8 md:p-10 transition-opacity duration-300">
            <h2 class="text-2xl bg-white font-semibold text-[#146b60] mb-6 text-center md:text-left">
                Iniciar Sesión
            </h2>

            <form @submit.prevent="login" class="space-y-6">
                <ErrorMessage v-if="errorMessage" :message="errorMessage" />

                <!-- Correo -->
                <div class="relative">
                    <input id="email" type="email" v-model="email" placeholder=" " required
                        class="peer w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#146b60]" />
                    <label for="email"
                        class="absolute left-3 top-3 text-gray-500 text-sm bg-white px-2 rounded transition-all duration-200 cursor-text peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.6rem] peer-focus:text-sm peer-focus:text-[#146b60] peer-valid:top-[-0.6rem] peer-valid:text-sm peer-valid:text-[#146b60]">
                        Correo electrónico
                    </label>
                </div>

                <!-- Contraseña -->
                <div class="relative">
                    <input id="password" :type="mostrarPassword ? 'text' : 'password'" v-model="password"
                        placeholder=" " required
                        class="peer w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#146b60]" />
                    <label for="password"
                        class="absolute left-3 top-3 text-gray-500 text-sm bg-white px-2 rounded transition-all duration-200 cursor-text peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.6rem] peer-focus:text-sm peer-focus:text-[#146b60] peer-valid:top-[-0.6rem] peer-valid:text-sm peer-valid:text-[#146b60]">
                        Contraseña
                    </label>

                    <div class="text-left">
                        <button type="button" @click="resetPassword"
                            class="text-sm text-[#146b60] hover:underline font-semibold">
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    <!-- Botón con ícono FontAwesome -->
                    <div class="absolute inset-y-0 right-0 -top-5 pr-3 flex items-center">
                        <button type="button" @click="toggleMostrarPassword"
                            class="text-gray-500 hover:text-[#146b60] transition"
                            aria-label="Mostrar u ocultar contraseña">
                            <i :class="mostrarPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                    </div>
                </div>

                <!-- Botón de enviar -->
                <button type="submit"
                    class="w-full bg-[#146b60] text-white py-3 rounded-lg hover:bg-[#0e574e] transition duration-300 font-semibold">
                    Entrar
                </button>
            </form>
        </div>
    </div>
</template>


<script>
import Loader from "@/components/Loader.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";
import Swal from "sweetalert2";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

export default {
    components: {
        Loader,
        ErrorMessage,
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
                    timerProgressBar: true,
                    showConfirmButton: false,
                    timer: 3000,
                });

                this.$router.push("/"); // Redirige a la página principal
            } catch (error) {
                // Extraer el código del error de Firebase
                const match = error.message.match(/\(auth\/[^\)]+\)/);
                const code = match ? match[0].replace(/[()]/g, '') : null;

                // Mapa de errores legibles
                const errorMap = {
                    'auth/invalid-login-credentials': 'Correo o contraseña incorrectos.',
                    'auth/user-not-found': 'No existe una cuenta con este correo.',
                    'auth/wrong-password': 'La contraseña es incorrecta.',
                    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
                    'auth/network-request-failed': 'Error de red. Verificá tu conexión.',
                    'auth/email-already-in-use': 'Este correo ya está registrado.',
                    'auth/invalid-email': 'El correo no es válido.',
                    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
                    'auth/internal-error': 'Error interno. Intenta nuevamente.',
                    'auth/missing-password': 'Falta ingresar la contraseña.',
                    'auth/missing-email': 'Falta ingresar el correo electrónico.',
                };

                this.errorMessage = errorMap[code] || 'Ocurrió un error al iniciar sesión. Intentá nuevamente.';

                Swal.fire({
                    title: "Error",
                    text: this.errorMessage,
                    icon: "error",
                    timerProgressBar: true,
                    timer: 3000,
                    showConfirmButton: false
                });
            } finally {
                this.cargando = false;
            }
        },
        toggleMostrarPassword() {
            this.mostrarPassword = !this.mostrarPassword;
        },
        async resetPassword() {
            const auth = getAuth();
            if (!this.email) {
                Swal.fire({
                    title: "Campo vacío",
                    text: "Por favor ingresá tu correo electrónico para recuperar tu contraseña.",
                    icon: "warning",
                    timerProgressBar: true,
                    showConfirmButton: false,
                    timer: 3000,
                });
                return;
            }

            try {
                await sendPasswordResetEmail(auth, this.email);
                Swal.fire({
                    title: "Correo enviado",
                    text: "Revisá tu bandeja de entrada para restablecer tu contraseña. ¡Revisar SPAM!",
                    icon: "success",
                    timerProgressBar: true,
                    showConfirmButton: false,
                    timer: 3000,
                });
            } catch (error) {
                const match = error.message.match(/\(auth\/[^\)]+\)/);
                const code = match ? match[0].replace(/[()]/g, '') : null;

                const errorMap = {
                    'auth/user-not-found': 'No existe una cuenta con este correo.',
                    'auth/invalid-email': 'El correo no es válido.',
                    'auth/missing-email': 'Por favor ingresá un correo electrónico.',
                };

                this.errorMessage = errorMap[code] || 'Ocurrió un error al intentar enviar el correo.';

                Swal.fire({
                    title: "Error",
                    text: this.errorMessage,
                    icon: "error",
                    timerProgressBar: true,
                    showConfirmButton: false,
                    timer: 8000,
                });
            }
        }
    },
};
</script>
