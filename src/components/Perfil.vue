<template>
  <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-auto mt-10 p-8 relative">
    <!-- Loader -->
    <Loader v-if="cargando" class="absolute inset-0 z-10 bg-white/80 flex items-center justify-center rounded-2xl" />

    <!-- Botón de cambiar contraseña -->
    <button @click="cambiarContrasena"
      class="absolute top-4 right-4 text-[#146b60] hover:text-[#0e574e] text-sm flex items-center gap-2">
      <i class="fas fa-lock"></i> Cambiar contraseña
    </button>

    <!-- Encabezado -->
    <h2 class="text-3xl font-bold text-center text-[#146b60] mb-6">Mi perfil</h2>

    <!-- Tarjeta de perfil -->
    <div class="flex flex-col md:flex-row items-center gap-6">
      <!-- Imagen con hover -->
      <div class="relative group w-32 h-32">
        <img :src="preview || user.photoURL || '/img/default-user.jpg'" alt="Foto de perfil"
          class="w-full h-full rounded-full border-4 border-[#146b60] shadow-md object-cover" />
        <div
          class="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
          @click="seleccionarFoto">
          <span class="text-white text-sm">Cambiar foto</span>
        </div>
        <input ref="inputFoto" type="file" accept="image/*" class="hidden" @change="cargarFoto" />
      </div>


      <!-- Info -->
      <div class="flex-1">
        <!-- Nombre editable -->
        <div class="flex items-center gap-2 mb-2">
          <input v-model="nuevoNombre"
            class="text-2xl font-bold text-[#146b60] border-b-2 border-[#146b60] focus:outline-none w-full bg-transparent" />
          <button @click="guardarNombre"
            class="text-sm bg-[#146b60] text-white px-3 py-1 rounded-lg hover:bg-[#0e574e] transition">
            Guardar
          </button>
        </div>

        <!-- Email -->
        <p class="text-gray-600"><strong>Email:</strong> {{ user.email }}</p>

        <!-- Tipo de usuario -->
        <p class="text-gray-600 capitalize mt-1 mb-1">
          <strong class="mr-1">Tipo:</strong>
          <span class="inline-block px-2 py-1 rounded-full text-sm" :class="{
            'bg-blue-100 text-blue-800': user.tipo === 'paciente',
            'bg-teal-100 text-teal-800': user.tipo === 'doctor',
            'bg-purple-100 text-purple-800': user.tipo === 'admin',
            'bg-yellow-100 text-yellow-800': user.tipo === 'pendiente'
          }">
            {{ user.tipo === 'pendiente' ? 'Doctor (pendiente)' : user.tipo }}
          </span>
        </p>

        <p v-if="user.tipo === 'paciente' && user.condicionMedica" class="text-gray-600">
          <strong>Condición médica:</strong> {{ user.condicionMedica }}
        </p>

        <!-- Verificación -->
        <p v-if="user.tipo === 'pendiente'" class="text-yellow-600 mt-2">
          <span class="font-bold">Estado:</span> En revisión por el equipo de EquinoGrowt <i
            class="fa-solid fa-clock"></i>
        </p>
        <p v-else class="text-green-600 mt-2">
          <span class="font-bold">Estado:</span> Verificado <i class="fa-solid fa-check"></i>
        </p>

        <!-- Ver título -->
        <a v-if="user.tituloDoctorURL" :href="user.tituloDoctorURL" target="_blank"
          class="text-blue-500 hover:underline mt-2 inline-block">
          Ver título profesional
        </a>

        <!-- Último acceso -->
        <p v-if="user.ultimoAcceso" class="text-gray-400 text-sm mt-2">
          Último acceso: {{ formatFecha(user.ultimoAcceso.toDate()) }}
        </p>
      </div>
    </div>

    <!-- Información adicional -->
    <div
      class="relative mt-10 bg-gradient-to-br from-white via-[#f7faf9] to-[#eafaf5] border border-[#cdeee2] rounded-2xl p-6 shadow-md transition-all duration-300">
      <!-- Encabezado -->
      <div class="mb-5">
        <!-- Contenedor flexible para desktop -->
        <div class="hidden sm:flex justify-between items-center">
          <h3 class="text-2xl font-semibold text-[#146b60] flex items-center gap-2">
            <i class="fa-solid fa-circle-info text-[#0e574e]"></i>
            Información adicional
          </h3>
          <button v-if="!modoEdicion" @click="modoEdicion = true"
            class="bg-[#146b60] text-white text-sm px-4 py-2 rounded-full hover:bg-[#0e574e] transition flex items-center gap-2 shadow">
            <i class="fa-solid fa-pen-to-square"></i> Editar
          </button>
        </div>

        <!-- Contenido para mobile -->
        <div class="flex sm:hidden items-center justify-center">
          <h3 class="text-lg font-semibold text-[#146b60] flex items-center gap-2 whitespace-nowrap">
            <i class="fa-solid fa-circle-info text-[#0e574e]"></i>
            Información adicional
          </h3>
        </div>
      </div>

      <!-- Campos -->
      <div class="space-y-4">
        <div v-for="(value, key) in infoExtra" :key="key"
          class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <label class="capitalize text-gray-600 font-medium sm:w-44 w-full">
            {{ key.replace(/([A-Z])/g, ' $1') }}:
          </label>

          <!-- Input editable -->
          <transition name="fade-slide" mode="out-in">
            <div v-if="modoEdicion" class="w-full" :key="key + '-edit'">
              <input v-model="infoExtra[key]" :type="key === 'fechaNacimiento' ? 'date' : 'text'"
                class="w-full border border-[#b2e0d3] bg-white rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#146b60] focus:outline-none transition shadow-sm" />
            </div>

            <!-- Texto normal -->
            <div v-else class="w-full text-gray-800 font-medium text-sm sm:text-base" :key="key + '-show'">
              {{ value || 'No especificado' }}
            </div>
          </transition>
        </div>
      </div>

      <!-- Botones de edición -->
      <transition name="fade-slide">
        <div v-if="modoEdicion" class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <button @click="guardarInfoExtra"
            class="bg-[#146b60] text-white px-5 py-2 rounded-lg hover:bg-[#0e574e] transition shadow flex items-center gap-2 justify-center">
            <i class="fa-solid fa-check"></i> Guardar
          </button>
          <button @click="cancelarEdicion"
            class="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition shadow flex items-center gap-2 justify-center">
            <i class="fa-solid fa-xmark"></i> Cancelar
          </button>
        </div>
      </transition>

      <!-- Botón editar en esquina inferior derecha del bloque (solo en mobile) -->
      <button v-if="!modoEdicion" @click="modoEdicion = true"
        class="sm:hidden absolute bottom-4 right-4 w-11 h-11 bg-[#146b60] text-white rounded-full shadow-lg hover:bg-[#0e574e] transition flex items-center justify-center"
        title="Editar información">
        <i class="fa-solid fa-pen-to-square text-base"></i>
      </button>
    </div>
  </div>
</template>

<script>
import Loader from "@/components/Loader.vue";
import { storageSecondary } from "@/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, updateProfile, updatePassword } from "firebase/auth";
import Swal from "sweetalert2";

export default {
  components: {
    Loader,
  },
  data() {
    return {
      user: {},
      nuevoNombre: "",
      cargando: true,
      fotoSeleccionada: null,
      preview: null,
      infoExtra: {
        dni: "",
        telefono: "",
        direccion: "",
        obraSocial: "",
        fechaNacimiento: "",
      },
      modoEdicion: false,
    };
  },
  async created() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return this.$router.push("/login");

    try {
      const db = getFirestore();
      const docRef = doc(db, "Tipo_de_usuario", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.user = data;
        this.nuevoNombre = data.nombre;
        this.infoExtra = {
          dni: data.dni || "",
          telefono: data.telefono || "",
          direccion: data.direccion || "",
          obraSocial: data.obraSocial || "",
          fechaNacimiento: data.fechaNacimiento?.split("T")[0] || "", // Para formato date
        };
      } else {
        console.error("No se encontró el perfil del usuario.");
      }
    } catch (e) {
      console.error("Error al obtener perfil:", e);
    } finally {
      this.cargando = false;
    }
  },
  methods: {
    seleccionarFoto() {
      this.$refs.inputFoto.click();
    },

    cargarFoto(event) {
      const archivo = event.target.files[0];
      if (archivo) {
        this.fotoSeleccionada = archivo;
        this.preview = URL.createObjectURL(archivo);
      }
    },

    async guardarNombre() {
      if (!this.nuevoNombre.trim()) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "El nombre no puede estar vacío.",
          timerProgressBar: true,
          timer: 2500,
          showConfirmButton: false
        });
        return;
      }

      try {
        this.cargando = true;
        const auth = getAuth();
        const db = getFirestore();
        const uid = auth.currentUser.uid;
        let photoURL = this.user.photoURL;

        // Subida de imagen si hay nueva foto
        if (this.fotoSeleccionada) {
          const storage = getStorage();
          const storageRef = ref(storageSecondary, `PhotoPerfil/${uid}`);
          await uploadBytes(storageRef, this.fotoSeleccionada);
          photoURL = await getDownloadURL(storageRef);

          await updateProfile(auth.currentUser, {
            photoURL,
          });

          await updateDoc(doc(db, "Tipo_de_usuario", uid), {
            photoURL,
          });

          this.user.photoURL = photoURL;
          this.fotoSeleccionada = null;
        }

        // Actualizar nombre
        await updateProfile(auth.currentUser, {
          displayName: this.nuevoNombre,
        });

        await updateDoc(doc(db, "Tipo_de_usuario", uid), {
          nombre: this.nuevoNombre,
        });

        this.user.nombre = this.nuevoNombre;
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "Tu perfil fue actualizado con éxito.",
          timerProgressBar: true,
          timer: 3000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Error al guardar perfil:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un problema al guardar el perfil.",
          timerProgressBar: true,
          timer: 2500,
          showConfirmButton: false
        });
      } finally {
        this.cargando = false;
      }
    },

    async cambiarContrasena() {
      const { value: formValues } = await Swal.fire({
        title: "Cambiar contraseña",
        html: `
          <input id="nueva-password" type="password" class="swal2-input" placeholder="Nueva contraseña" />
          <button id="toggle-password" type="button" class="text-[#146b60] text-sm underline mt-2">
            Mostrar contraseña
          </button>
        `,
        showCancelButton: true,
        confirmButtonText: "Actualizar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: '#146b60',
        cancelButtonColor: '#e53e3e',
        focusConfirm: false,
        preConfirm: () => {
          const password = document.getElementById("nueva-password").value;
          if (!password || password.length < 6) {
            Swal.showValidationMessage("La contraseña debe tener al menos 6 caracteres");
            return;
          }
          return password;
        },
        didOpen: () => {
          const passwordInput = document.getElementById("nueva-password");
          const toggleBtn = document.getElementById("toggle-password");

          toggleBtn.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            toggleBtn.textContent = isPassword ? "Ocultar contraseña" : "Mostrar contraseña";
          });
        },
      });

      if (formValues) {
        try {
          this.cargando = true;
          const auth = getAuth();
          await updatePassword(auth.currentUser, formValues);
          Swal.fire({
            icon: "success",
            title: "¡Listo!",
            text: "Tu contraseña fue actualizada con éxito.",
            timerProgressBar: true,
            timer: 2500,
            showConfirmButton: false
          });
        } catch (error) {
          console.error("Error al cambiar contraseña:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cambiar la contraseña. Reautentícate si es necesario.",
            timerProgressBar: true,
            timer: 2500,
            showConfirmButton: false
          });
        } finally {
          this.cargando = false;
        }
      }
    },

    async guardarInfoExtra() {
      try {
        this.cargando = true;
        const auth = getAuth();
        const db = getFirestore();
        const uid = auth.currentUser.uid;

        await updateDoc(doc(db, "Tipo_de_usuario", uid), {
          ...this.infoExtra,
        });

        this.modoEdicion = false; // 👈 Esta línea cierra el modo edición

        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "Tu información adicional fue guardada.",
          timerProgressBar: true,
          timer: 2500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error("Error al guardar info extra:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un problema al guardar la información.",
          timerProgressBar: true,
          timer: 2500,
          showConfirmButton: false
        });
      } finally {
        this.cargando = false;
      }
    },

    cancelarEdicion() {
      this.modoEdicion = false;
      // Restaurar los valores originales desde this.user
      this.infoExtra = {
        dni: this.user.dni || "",
        telefono: this.user.telefono || "",
        direccion: this.user.direccion || "",
        obraSocial: this.user.obraSocial || "",
        fechaNacimiento: this.user.fechaNacimiento?.split("T")[0] || "",
      };
    },

    formatFecha(fecha) {
      return fecha.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
