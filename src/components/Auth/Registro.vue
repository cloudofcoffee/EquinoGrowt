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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storageSecondary } from "@/firebase";
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

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
                const user = userCredential.user;

                const photoURL = "/img/default-user.jpg";
                await updateProfile(user, {
                    displayName: this.name,
                    photoURL: photoURL,
                });

                const tipo = await this.seleccionarTipoUsuario();
                if (!tipo) {
                    this.errorMessage = "Debes seleccionar un tipo de usuario.";
                    return;
                }

                let tituloURL = null;
                let datosUsuario = {
                    uid: user.uid,
                    nombre: this.name,
                    email: this.email,
                    creadoEn: new Date(),
                    photoURL: photoURL,
                };

                if (tipo === "doctor") {
                    tituloURL = await this.subirTituloDoctor(user.uid);
                    if (!tituloURL) {
                        this.errorMessage = "Debes subir un título para registrarte como doctor.";
                        return;
                    }
                    datosUsuario.tipo = "pendiente";
                    datosUsuario.solicitudDoctor = true;
                    datosUsuario.tituloDoctorURL = tituloURL;
                } else {
                    datosUsuario.tipo = tipo;
                    datosUsuario.solicitudDoctor = false;
                    datosUsuario.tituloDoctorURL = null;
                }

                const db = getFirestore();
                await setDoc(doc(db, "Tipo_de_usuario", user.uid), datosUsuario);

                Swal.fire({
                    icon: "success",
                    title: "¡Cuenta creada!",
                    text: tipo === "doctor"
                        ? "Tu solicitud como doctor fue enviada. El equipo revisará tu título."
                        : "Tu perfil fue creado correctamente.",
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
                    <div class="swal-role" data-role="paciente" style="cursor: pointer; text-align: center;">
                        <i class="fas fa-user-injured fa-3x"></i>
                        <p style="margin-top: 0.5rem;">Paciente</p>
                    </div>
                    <div class="swal-role" data-role="familiar" style="cursor: pointer; text-align: center;">
                        <i class="fas fa-users fa-3x"></i>
                        <p style="margin-top: 0.5rem;">Familiar</p>
                    </div>
                    <div class="swal-role" data-role="doctor" style="cursor: pointer; text-align: center;">
                        <i class="fas fa-user-md fa-3x"></i>
                        <p style="margin-top: 0.5rem;">Doctor</p>
                    </div>
                </div>
            `,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    customClass: {
                        popup: 'swal2-custom-popup'
                    },
                    didOpen: () => {
                        const roles = Swal.getHtmlContainer().querySelectorAll(".swal-role");
                        roles.forEach((el) => {
                            el.addEventListener("click", async () => {
                                const tipo = el.getAttribute("data-role");
                                if (tipo === "doctor") {
                                    const confirm = await Swal.fire({
                                        title: "Solicitud como Doctor",
                                        text: "Deberás subir tu título. Será revisado por la administración antes de activar tu perfil como doctor.",
                                        icon: "info",
                                        showCancelButton: true,
                                        confirmButtonText: "Continuar",
                                        cancelButtonText: "Cancelar",
                                    });
                                    if (!confirm.isConfirmed) {
                                        resolve(null);
                                        Swal.close();
                                        return;
                                    }
                                }
                                resolve(tipo);
                                Swal.close();
                            });
                        });
                    }
                });
            });
        },

        async subirTituloDoctor(uid) {
            return new Promise((resolve) => {
                Swal.fire({
                    title: "Subí tu título profesional",
                    html: `
                    <div class="swal-upload-container">
                        <label for="uploadTitulo" class="upload-button">
                            <i class="fas fa-upload"></i> Elegir archivo
                        </label>
                        <input type="file" id="uploadTitulo" accept="image/*,application/pdf" class="hidden-input">
                        <p id="fileName" class="upload-filename"></p>
                    </div>
                    `,

                    showCancelButton: true,
                    confirmButtonText: "Subir",
                    cancelButtonText: "Cancelar",
                    focusConfirm: false,
                    preConfirm: async () => {
                        const fileInput = Swal.getPopup().querySelector("#uploadTitulo");
                        const file = fileInput.files[0];

                        if (!file) {
                            Swal.showValidationMessage("Debes seleccionar un archivo.");
                            return;
                        }

                        const ext = file.name.split('.').pop();
                        const fileName = `titulo.${ext}`;
                        const fileRef = ref(storageSecondary, `comprobante/${uid}/${fileName}`);

                        try {
                            await uploadBytes(fileRef, file);
                            const url = await getDownloadURL(fileRef);
                            return url;
                        } catch (e) {
                            Swal.showValidationMessage("Error al subir el archivo.");
                            return;
                        }
                    },
                    didOpen: () => {
                        const fileInput = Swal.getPopup().querySelector("#uploadTitulo");
                        const fileNameDisplay = Swal.getPopup().querySelector("#fileName");

                        fileInput.addEventListener("change", () => {
                            if (fileInput.files.length > 0) {
                                fileNameDisplay.textContent = `Archivo seleccionado: ${fileInput.files[0].name}`;
                            } else {
                                fileNameDisplay.textContent = "";
                            }
                        });
                    }
                }).then((result) => {
                    if (result.isConfirmed && result.value) {
                        resolve(result.value);
                    } else {
                        resolve(null);
                    }
                });
            });
        }
    }
};
</script>
