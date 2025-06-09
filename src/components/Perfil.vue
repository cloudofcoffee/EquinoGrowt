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
      <!-- Imagen -->
      <img :src="user.photoURL || '/img/default-user.jpg'" alt="Foto de perfil"
        class="w-32 h-32 rounded-full border-4 border-[#146b60] shadow-md object-cover" />

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
        <p class="text-gray-600 capitalize">
          <strong class="mr-1">Tipo:</strong>
          <span class="inline-block px-2 py-1 rounded-full text-sm" :class="{
            'bg-blue-100 text-blue-800': user.tipo === 'paciente',
            'bg-purple-100 text-purple-800': user.tipo === 'familiar',
            'bg-green-100 text-green-800': user.tipo === 'doctor',
            'bg-yellow-100 text-yellow-800': user.tipo === 'pendiente'
          }">
            {{ user.tipo === 'pendiente' ? 'Doctor (pendiente)' : user.tipo }}
          </span>
        </p>

        <!-- Verificación -->
        <p v-if="user.tipo === 'pendiente'" class="text-yellow-600 mt-2">
          Estado: En revisión por el equipo de EquinoGrowt 🕒
        </p>
        <p v-else class="text-green-600 mt-2">
          Estado: Verificado ✅
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
  </div>
</template>

<script>
import Loader from "@/components/Loader.vue";
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
        this.user = docSnap.data();
        this.nuevoNombre = this.user.nombre;
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
    async guardarNombre() {
      if (!this.nuevoNombre.trim()) {
        Swal.fire("Error", "El nombre no puede estar vacío.", "error");
        return;
      }

      try {
        this.cargando = true;
        const auth = getAuth();
        const db = getFirestore();
        const uid = auth.currentUser.uid;

        await updateProfile(auth.currentUser, {
          displayName: this.nuevoNombre,
        });

        const docRef = doc(db, "Tipo_de_usuario", uid);
        await updateDoc(docRef, {
          nombre: this.nuevoNombre,
        });

        this.user.nombre = this.nuevoNombre;

        Swal.fire("¡Actualizado!", "Tu nombre fue actualizado con éxito.", "success");
      } catch (error) {
        console.error("Error al guardar nombre:", error);
        Swal.fire("Error", "Ocurrió un problema al guardar el nombre.", "error");
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
          Swal.fire("¡Listo!", "Tu contraseña fue actualizada con éxito.", "success");
        } catch (error) {
          console.error("Error al cambiar contraseña:", error);
          Swal.fire("Error", "No se pudo cambiar la contraseña. Reautenticate si es necesario.", "error");
        } finally {
          this.cargando = false;
        }
      }
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
