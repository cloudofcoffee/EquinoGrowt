<template>
    <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row-reverse overflow-hidden relative">

        <!-- Loader -->
        <Loader v-if="cargando"
            class="absolute inset-0 z-10 bg-white/80 flex items-center justify-center rounded-2xl" />

        <!-- Columna Izquierda (Logo y Bienvenida) -->
        <div class="bg-[#146b60] text-white md:w-1/2 w-full p-10 flex flex-col items-center justify-center space-y-4">
            <img src="/img/EquinoGrowt.svg" alt="Logo"
                class="bg-white w-32 h-32 rounded-full border-4 border-white shadow-md transition-transform duration-300 hover:scale-105" />
            <h2 class="text-2xl md:text-3xl font-bold text-center leading-snug">
                ¿Sos nuevo?<br />¡Creá tu cuenta!
            </h2>
            <p class="text-sm text-center mt-2">
                ¿Ya tenés una cuenta?<br class="md:hidden" />
                <router-link to="/login"
                    class="text-blue-200 hover:text-blue-100 hover:underline transition duration-300 font-semibold">
                    Iniciá sesión acá
                </router-link>
            </p>
        </div>

        <!-- Columna Derecha (Formulario) -->
        <div :class="{ 'opacity-30 pointer-events-none': cargando }"
            class="md:w-1/2 w-full brand-pattern p-8 md:p-10 transition-opacity duration-300">
            <h2 class="text-2xl font-semibold text-[#146b60] bg-white mb-6 text-center md:text-left">
                Registrarme
            </h2>

            <ErrorMessage v-if="errorMessage" :message="errorMessage" class="mb-4" />

            <form @submit.prevent="register" class="space-y-6">

                <!-- Nombre completo -->
                <div class="relative">
                    <input id="name" type="text" v-model="name" required placeholder=" "
                        class="peer w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#146b60]" />
                    <label for="name"
                        class="absolute left-3 top-3 text-gray-500 text-sm bg-white px-2 rounded transition-all duration-200 cursor-text peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.6rem] peer-focus:text-sm peer-focus:text-[#146b60] peer-valid:top-[-0.6rem] peer-valid:text-sm peer-valid:text-[#146b60]">
                        Nombre completo
                    </label>
                </div>

                <!-- Correo electrónico -->
                <div class="relative">
                    <input id="email" type="email" v-model="email" required placeholder=" "
                        class="peer w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#146b60]" />
                    <label for="email"
                        class="absolute left-3 top-3 text-gray-500 text-sm bg-white px-2 rounded transition-all duration-200 cursor-text peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.6rem] peer-focus:text-sm peer-focus:text-[#146b60] peer-valid:top-[-0.6rem] peer-valid:text-sm peer-valid:text-[#146b60]">
                        Correo electrónico
                    </label>
                </div>

                <!-- Contraseña -->
                <div class="relative">
                    <input id="password" :type="mostrarPassword ? 'text' : 'password'" v-model="password" required
                        placeholder=" "
                        class="peer w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#146b60]" />
                    <label for="password"
                        class="absolute left-3 top-3 text-gray-500 text-sm bg-white px-2 rounded transition-all duration-200 cursor-text peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.6rem] peer-focus:text-sm peer-focus:text-[#146b60] peer-valid:top-[-0.6rem] peer-valid:text-sm peer-valid:text-[#146b60]">
                        Contraseña
                    </label>

                    <!-- Ícono de visibilidad -->
                    <button type="button" @click="toggleMostrarPassword"
                        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#146b60] transition"
                        aria-label="Mostrar u ocultar contraseña">
                        <i :class="mostrarPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                </div>

                <!-- Botón de registro -->
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
            condicionMedica: "",
            edad: null,
            tituloTempURL: null,
            acompanante: "Administrada por padres",
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
                // ✅ Primero pedimos el tipo de usuario y datos adicionales
                const tipo = await this.seleccionarTipoUsuario();
                if (!tipo) {
                    this.errorMessage = "Debes seleccionar un tipo de usuario.";
                    return;
                }

                let tituloURL = null;

                if (tipo === "doctor") {
                    const tempURL = await this.subirTituloDoctor("temp");
                    if (!tempURL) {
                        this.errorMessage = "Debes subir un título para registrarte como doctor.";
                        this.cargando = false;
                        return;
                    }
                    this.tituloTempURL = tempURL;
                }

                // ✅ Solo si el usuario completó todos los pasos, lo registramos
                const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
                const user = userCredential.user;

                const photoURL = "/img/default-user.jpg";
                await updateProfile(user, {
                    displayName: this.name,
                    photoURL: photoURL,
                });

                let datosUsuario = {
                    uid: user.uid,
                    nombre: this.name,
                    email: this.email,
                    creadoEn: new Date(),
                    photoURL: photoURL,
                };

                if (tipo === "doctor") {
                    if (this.tituloTempURL) {
                        tituloURL = this.tituloTempURL;
                    }

                    datosUsuario.tipo = "pendiente";
                    datosUsuario.solicitudDoctor = true;
                    datosUsuario.tituloDoctorURL = tituloURL;
                } else {
                    datosUsuario.tipo = tipo;
                    datosUsuario.solicitudDoctor = false;
                    datosUsuario.tituloDoctorURL = null;

                    if (tipo === "paciente") {
                        datosUsuario.condicionMedica = this.condicionMedica;
                        datosUsuario.edad = this.edad;
                        datosUsuario.acompanante = this.acompanante;
                    }
                }

                const db = getFirestore();
                await setDoc(doc(db, "Tipo_de_usuario", user.uid), datosUsuario);

                Swal.fire({
                    icon: "success",
                    title: "¡Cuenta creada!",
                    text: tipo === "doctor"
                        ? "Tu solicitud como doctor fue enviada. El equipo revisará tu título."
                        : "Tu perfil fue creado correctamente.",
                    timerProgressBar: true,
                    timer: 3000,
                    showConfirmButton: false
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

                                else {
                                    const { value: formValues } = await Swal.fire({
                                        title: "Información del paciente",
                                        html: `
                                        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                                            <div style="position: relative;">
                                                <input id="swal-input-edad" type="number" min="0" max="120" placeholder=" " style="width: 100%; padding: 12px; font-size: 15px; border: 1px solid #ccc; border-radius: 8px; background: white; outline: none;" class="focus:outline-none focus:ring-2 focus:ring-[#146b60]" />
                                                <label for="swal-input-edad" style="position: absolute; left: 12px; top: 12px; color: #888; font-size: 15px; background: white; padding: 0 4px; transition: 0.2s; pointer-events: none;">Edad</label>
                                            </div>
                                            <div style="position: relative;">
                                                <textarea id="swal-input-condicion" rows="3" placeholder=" " style="width: 100%; padding: 12px; font-size: 15px; border: 1px solid #ccc; border-radius: 8px; background: white; outline: none; resize: vertical;" class="focus:outline-none focus:ring-2 focus:ring-[#146b60]"></textarea>
                                                <label for="swal-input-condicion" style="position: absolute; left: 12px; top: 12px; color: #888; font-size: 15px; background: white; padding: 0 4px; transition: 0.2s; pointer-events: none;">Condición médica</label>
                                            </div>
                                            <div style="position: relative;">
                                                <select id="swal-input-acompanante" class="focus:outline-none focus:ring-2 focus:ring-[#146b60]" style="width: 100%; padding: 12px; font-size: 15px; border: 1px solid #ccc; border-radius: 8px; background: white; outline: none;">
                                                    <option disabled selected value="">Seleccione una opción</option>
                                                    <option value="Administrada por padres">Administrada por padres</option>
                                                    <option value="Propia">Propia</option>
                                                </select>
                                                <label for="swal-input-acompanante" style="position: absolute; left: 12px; top: 12px; color: #888; font-size: 15px; background: white; padding: 0 4px; transition: 0.2s; pointer-events: none;">Cuenta administrada por</label>
                                            </div>
                                        </div>
                                        `,
                                        background: "#f8f9fa",
                                        focusConfirm: false,
                                        showCancelButton: true,
                                        confirmButtonText: "Guardar",
                                        cancelButtonText: "Cancelar",
                                        customClass: {
                                            popup: 'rounded-xl',
                                            confirmButton: 'bg-[#146b60] text-white px-4 py-2 rounded-lg',
                                            cancelButton: 'text-gray-50 bg-red-600 px-4 py-2 rounded-lg'
                                        },
                                        didOpen: () => {
                                            const fields = ['swal-input-edad', 'swal-input-condicion', 'swal-input-acompanante'];
                                            fields.forEach(id => {
                                                const input = document.getElementById(id);
                                                const label = document.querySelector(`label[for="${id}"]`);
                                                const handleFloating = () => {
                                                    if (input.value) {
                                                        label.style.top = "-8px";
                                                        label.style.fontSize = "13px";
                                                        label.style.fontWeight = "600";
                                                        label.style.color = "#146b60";
                                                    } else {
                                                        label.style.top = "12px";
                                                        label.style.fontSize = "15px";
                                                        label.style.fontWeight = "normal";
                                                        label.style.color = "#888";
                                                    }
                                                };
                                                input.addEventListener("input", handleFloating);
                                                input.addEventListener("focus", handleFloating);
                                                input.addEventListener("blur", handleFloating);
                                                handleFloating();
                                            });
                                        },
                                        preConfirm: () => {
                                            const edad = document.getElementById("swal-input-edad").value;
                                            const condicion = document.getElementById("swal-input-condicion").value.trim();
                                            const acompanante = document.getElementById("swal-input-acompanante").value;

                                            if (!edad || isNaN(edad) || edad < 0 || edad > 120) {
                                                Swal.showValidationMessage("Ingresá una edad válida entre 0 y 120.");
                                                return;
                                            }

                                            if (!condicion) {
                                                Swal.showValidationMessage("Debés ingresar una condición médica.");
                                                return;
                                            }

                                            if (!acompanante) {
                                                Swal.showValidationMessage("Seleccioná quién administra la cuenta.");
                                                return;
                                            }

                                            return { edad, condicion, acompanante };
                                        }
                                    });

                                    if (!formValues) {
                                        resolve(null);
                                        Swal.close();
                                        return;
                                    }

                                    this.condicionMedica = formValues.condicion;
                                    this.edad = parseInt(formValues.edad);
                                    this.acompanante = formValues.acompanante;
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
                        <div class="swal-upload-container" style="display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-top: 1rem;">
                            <label for="uploadTitulo" id="uploadLabel" style="background-color: #146b60; color: white; padding: 0.75rem 1.5rem; border-radius: 9999px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 600; transition: background-color 0.3s ease;" onmouseover="this.style.backgroundColor='#0e574e';" onmouseout="this.style.backgroundColor='#146b60';">
                                <i class="fas fa-upload"></i>
                                <span id="labelText">Elegir archivo</span>
                            </label>
                            <input type="file" id="uploadTitulo" accept="image/*,application/pdf" style="display: none;" />
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: "Guardar",
                    cancelButtonText: "Cancelar",
                    focusConfirm: false,
                    customClass: {
                        confirmButton: 'bg-[#146b60] text-white px-4 py-2 rounded-lg',
                        cancelButton: 'text-gray-50 bg-red-600 px-4 py-2 rounded-lg'
                    },
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
                        const fileNameDisplay = Swal.getPopup().querySelector("#labelText");

                        fileInput.addEventListener("change", () => {
                            fileNameDisplay.textContent = fileInput.files.length > 0
                                ? `Archivo seleccionado: ${fileInput.files[0].name}`
                                : "No se ha seleccionado ningún archivo";
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
