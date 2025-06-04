<template>
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden relative">
        <!-- Loader -->
        <Loader v-if="cargando"
            class="absolute inset-0 z-10 bg-white/80 flex items-center justify-center rounded-2xl" />

        <!-- Columna Izquierda: Logo y título -->
        <div class="bg-[#146b60] text-white md:w-1/2 w-full p-10 flex flex-col items-center justify-center">
            <img src="/img/EquinoGrowt.svg" alt="Logo"
                class="bg-white w-36 h-36 mb-6 rounded-full border-4 border-white shadow-md transition-transform duration-300 hover:scale-105" />
            <h2 class="text-3xl font-extrabold text-center leading-tight">
                Crea tu cuenta <br />
                en EquinoGrowt
            </h2>
            <p class="mt-4 text-center">
                ¿Ya tenés una cuenta?<br class="md:hidden">
                <router-link to="/login" class="ml-1 text-blue-500 hover:text-blue-400 transition font-semibold">Inicia
                    sesión aca</router-link>
            </p>
        </div>

        <!-- Columna Derecha: Formulario -->
        <div :class="{ 'opacity-30 pointer-events-none': cargando }"
            class="md:w-1/2 w-full p-10 transition-opacity duration-300">
            <h3 class="text-2xl font-semibold text-[#146b60] mb-6 text-center md:text-left">
                Registrarme
            </h3>

            <ErrorMessage v-if="errorMessage" :message="errorMessage" class="mb-4" />

            <form @submit.prevent="register" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                    <input type="text" v-model="name" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#146b60] transition" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <input type="email" v-model="email" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#146b60] transition" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input :type="mostrarPassword ? 'text' : 'password'" v-model="password" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#146b60] transition" />
                    <button type="button" @click="toggleMostrarPassword"
                        class="text-sm text-[#146b60] mt-1 hover:underline">
                        {{ mostrarPassword ? 'Ocultar' : 'Mostrar' }} contraseña
                    </button>
                </div>

                <button type="submit"
                    class="w-full bg-[#146b60] text-white py-3 rounded-lg hover:bg-[#0e574e] transition duration-300 font-semibold">
                    Crear cuenta
                </button>
            </form>
        </div>
    </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import Loader from "@/components/Loader.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

export default {
    components: {
        Loader,
        ErrorMessage,
    },
    data() {
        return {
            name: "",
            email: "",
            password: "",
            mostrarPassword: false,
            errorMessage: "",
            cargando: false,
        };
    },
    methods: {
        toggleMostrarPassword() {
            this.mostrarPassword = !this.mostrarPassword;
        },

        async register() {
            const auth = getAuth();
            this.errorMessage = "";
            this.cargando = true;

            const defaultPhotoURL = "https://i.imgur.com/2yaf2wb.png";

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
                const user = userCredential.user;

                await updateProfile(user, {
                    displayName: this.name,
                    photoURL: defaultPhotoURL,
                });

                // 🔽 Esperar selección de tipo de usuario
                const tipo = await this.seleccionarTipoUsuario();

                if (!tipo) {
                    this.errorMessage = "Debes seleccionar un tipo de usuario.";
                    return;
                }

                // 🔽 Guardar en Firestore
                const db = getFirestore();
                await setDoc(doc(db, "Tipo_de_usuario", user.uid), {
                    uid: user.uid,
                    nombre: this.name,
                    email: this.email,
                    tipo: tipo,
                    creadoEn: new Date()
                });

                Swal.fire({
                    icon: "success",
                    title: "¡Cuenta creada!",
                    text: "Tu perfil fue creado correctamente.",
                });

                this.$router.push("/");
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    this.errorMessage = 'Este correo ya está registrado. Inicia sesión o usa otro correo.';
                } else if (error.code === 'auth/invalid-email') {
                    this.errorMessage = 'El correo electrónico no es válido.';
                } else if (error.code === 'auth/weak-password') {
                    this.errorMessage = 'La contraseña es demasiado débil. Usá al menos 6 caracteres.';
                } else {
                    this.errorMessage = error.message;
                }
            } finally {
                this.cargando = false;
            }
        },

        seleccionarTipoUsuario() {
            return new Promise((resolve) => {
                Swal.fire({
                    title: 'Seleccioná tu rol',
                    html: `
                      <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1.5rem;">
                        <div class="swal-role" data-role="paciente">
                          <i class="fas fa-user-injured fa-2x"></i>
                          <p>Paciente</p>
                        </div>
                        <div class="swal-role" data-role="familiar">
                          <i class="fas fa-users fa-2x"></i>
                          <p>Familiar</p>
                        </div>
                        <div class="swal-role" data-role="doctor">
                          <i class="fas fa-user-md fa-2x"></i>
                          <p>Doctor</p>
                        </div>
                      </div>
                    `,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        const roles = Swal.getHtmlContainer().querySelectorAll(".swal-role");
                        roles.forEach((el) => {
                            el.addEventListener("click", () => {
                                const tipo = el.getAttribute("data-role");
                                resolve(tipo);
                                Swal.close();
                            });
                        });
                    }
                });
            });
        },
    }
};
</script>

<style scoped>
.swal-role {
    background-color: #f1f5f9;
    border-radius: 50%;
    width: 100px;
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.swal-role:hover {
    background-color: #e2e8f0;
    transform: scale(1.05);
}

.swal-role i {
    margin-bottom: 0.3rem;
    color: #146b60;
}

.swal-role p {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 500;
}
</style>
