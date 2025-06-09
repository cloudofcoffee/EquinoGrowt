<template>
  <div class="flex flex-col min-h-screen">
    <!-- Navbar -->
    <nav class="bg-teal-950 text-white shadow-md">
      <div class="container mx-auto flex items-center justify-between px-4 py-3">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2">
          <img src="/img/EquinoGrowt_logo.svg" alt="EquinoGrowt Logo" class="w-40 h-auto" />
        </router-link>

        <!-- Menú móvil -->
        <button class="md:hidden" @click="menuOpen = !menuOpen">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Menú escritorio -->
        <ul class="hidden md:flex items-center space-x-4 text-base font-medium">
          <li v-if="!isLoggedIn">
            <router-link to="/bienvenidos" class="relative inline-block hover:text-[#cfe8e4] transition"
              exact-active-class="text-[#cfe8e4] transition active-link">Bienvenidos</router-link>
          </li>
          <li v-if="!isLoggedIn">
            <router-link to="/login" class="relative inline-block hover:text-[#cfe8e4] transition"
              active-class="text-[#cfe8e4] transition active-link">Login</router-link>
          </li>
          <li v-if="!isLoggedIn">
            <router-link to="/registro" class="relative inline-block hover:text-[#cfe8e4] transition"
              active-class="text-[#cfe8e4] transition active-link">Registro</router-link>
          </li>
          <li v-if="isLoggedIn">
            <router-link to="/" class="relative inline-block hover:text-[#cfe8e4] transition"
              active-class="text-[#cfe8e4] transition active-link">Inicio</router-link>
          </li>
          <li v-if="isLoggedIn && userRole === 'doctor'">
            <router-link to="/pacientes" class="relative inline-block hover:text-[#cfe8e4] transition"
              active-class="text-[#cfe8e4] transition active-link">Pacientes</router-link>
          </li>
          <li v-if="isLoggedIn">
            <router-link to="/perfil" @click="menuOpen = false"
              class="flex items-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full transition duration-200 space-x-2"
              active-class="bg-teal-700">
              <img :src="userPhoto" alt="Foto de perfil" class="w-6 h-6 rounded-full object-cover" />
              <span class="hidden sm:inline">Perfil</span>
            </router-link>
          </li>
          <li v-if="isLoggedIn">
            <button @click="logout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition duration-200 flex items-center space-x-2"
              title="Cerrar sesión">
              <i class="fa-solid fa-right-from-bracket"></i>
              <span class="hidden sm:inline">Salir</span>
            </button>
          </li>
        </ul>
      </div>

      <!-- Menú móvil desplegable -->
      <transition name="fade">
        <ul v-if="menuOpen" class="md:hidden bg-teal-900 px-4 pb-4 space-y-3 font-medium">
          <li v-if="!isLoggedIn">
            <router-link to="/bienvenidos" @click="menuOpen = false"
              class="relative inline-block py-2 hover:text-[#cfe8e4]"
              exact-active-class="text-[#cfe8e4] transition active-link">Bienvenidos</router-link>
          </li>
          <li v-if="!isLoggedIn">
            <router-link to="/login" @click="menuOpen = false"
              class="relative inline-block py-2 hover:text-[#cfe8e4] transition"
              active-class="text-[#cfe8e4] transition active-link">Login</router-link>
          </li>
          <li v-if="!isLoggedIn">
            <router-link to="/registro" @click="menuOpen = false"
              class="relative inline-block py-2 hover:text-[#cfe8e4] transition"
              active-class="text-[#cfe8e4] transition active-link">Registro</router-link>
          </li>
          <li v-if="isLoggedIn">
            <router-link to="/" @click="menuOpen = false"
              class="relative inline-block py-2 hover:text-[#cfe8e4] transition"
              active-class="text-[#cfe8e4] transition active-link">Inicio</router-link>
          </li>
          <li v-if="isLoggedIn && userRole === 'doctor'">
            <router-link to="/pacientes" class="hover:text-[#cfe8e4] transition"
              active-class="text-[#cfe8e4] transition">Pacientes</router-link>
          </li>
          <li v-if="isLoggedIn">
            <router-link to="/perfil" @click="menuOpen = false"
              class="flex items-center py-2 px-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition duration-200 space-x-2"
              active-class="bg-teal-700">
              <img :src="userPhoto" alt="Foto de perfil" class="w-6 h-6 rounded-full object-cover" />
              <span>Perfil</span>
            </router-link>
          </li>
          <li v-if="isLoggedIn">
            <button @click="logout"
              class="w-full text-left py-2 px-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200">
              <i class="fa-solid fa-right-from-bracket mr-2"></i> Salir
            </button>
          </li>
        </ul>
      </transition>
    </nav>

    <!-- Contenido -->
    <main class="flex items-center justify-center container mx-auto px-4 py-6">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-[#0e0e0e] text-gray-200 pt-10 border-t">
      <div class="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

        <!-- Logo y descripción -->
        <div>
          <div class="flex items-center space-x-3 mb-4">
            <img src="/img/EquinoGrowt_logo.svg" alt="EquinoGrowt Logo" class="rounded bg-white p-2 w-14 h-14">
            <span class="text-2xl font-bold">&copy; EquinoGrowt</span>
          </div>
          <p class="text-sm">
            EquinoGrowt ofrece equino terapia para mejorar el bienestar físico y emocional a través del vínculo con los
            caballos.
          </p>
        </div>

        <!-- Enlaces útiles -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-teal-700">Enlaces</h3>
          <ul class="space-y-2 text-sm">
            <li><router-link to="/bienvenidos" class="hover:underline">Bienvenidos</router-link></li>
            <li v-if="!isLoggedIn"><router-link to="/login" class="hover:underline">Login</router-link></li>
            <li v-if="!isLoggedIn"><router-link to="/registro" class="hover:underline">Registro</router-link></li>
            <li v-if="isLoggedIn"><router-link to="/" class="hover:underline">Inicio</router-link></li>
            <li v-if="isLoggedIn"><router-link to="/perfil" class="hover:underline">Perfil</router-link></li>
            <li v-if="isLoggedIn && userRole === 'doctor'"><router-link to="/pacientes"
                class="hover:underline">Pacientes</router-link></li>
          </ul>
        </div>

        <!-- Contacto -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-teal-700">Contacto</h3>
          <ul class="space-y-2 text-sm">
            <li><i class="fas fa-envelope mr-2"></i> contacto@equinogrowt.com</li>
            <li><i class="fas fa-phone mr-2"></i> +54 9 11 1234 5678</li>
            <li><i class="fas fa-map-marker-alt mr-2"></i> Buenos Aires, Argentina</li>
          </ul>
        </div>

        <!-- Redes sociales -->
        <div>
          <h3 class="text-lg font-semibold mb-4 text-teal-700">Seguinos</h3>
          <div class="flex space-x-4 text-xl">
            <a href="https://www.facebook.com/" target="_blank" class="hover:text-teal-500 transition"><i
                class="fab fa-facebook-f"></i></a>
            <a href="https://x.com/home" target="_blank" class="hover:text-teal-500 transition"><i
                class="fab fa-twitter"></i></a>
            <a href="https://www.instagram.com/equinogrowt/?utm_source=ig_web_button_share_sheet" target="_blank"
              class="hover:text-teal-500 transition"><i class="fab fa-instagram"></i></a>
            <a href="https://www.youtube.com" target="_blank" class="hover:text-teal-500 transition"><i
                class="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>

      <!-- Línea -->
      <div class="border-t border-teal-700 my-6"></div>

      <!-- Derechos -->
      <div class="text-center text-sm text-gray-200 hover:text-gray-400 transition pb-6">
        &copy; 2025 <span class="font-semibold">EquinoGrowt</span>. Todos los derechos reservados.
      </div>
    </footer>
  </div>
</template>

<!-- Contenido -->
<script>
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { ref } from "vue";
const menuOpen = ref(false);

export default {
  data() {
    return {
      menuOpen: false,
      isLoggedIn: false,
      userEmail: "",
      userRole: "",
      userPhoto: "/img/default-user.jpg"
    };
  },
  watch: {
    $route(to) {
      this.menuOpen = false;
      const rutasOcultas = ["/login", "/registro", "/bienvenidos"];
      this.mostrarBarraInferior = !rutasOcultas.includes(to.path);
    },
  },
  created() {
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.isLoggedIn = true;
        this.userEmail = user.email;

        const db = getFirestore();
        const docRef = doc(db, "Tipo_de_usuario", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.userRole = data.tipo;
          this.userPhoto = data.photoURL || this.userPhoto;
        }
      } else if (this.$route.path !== "/login" && this.$route.path !== "/registro") {
        this.$router.push("/login");
      }
    });
  },
  methods: {
    async logout() {
      const auth = getAuth();
      await signOut(auth);
      this.isLoggedIn = false;
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  box-sizing: border-box;
}

main {
  align-content: center;
  min-height: 77.8vh;
  margin: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.active-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #cfe8e4;
}


.active-link::after {
  transition: width 0.3s ease;
}

.swal-upload-container {
  text-align: center;
  padding: 1rem;
}

.upload-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #146b60;
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.upload-button:hover {
  background-color: #0e574e;
}

.hidden-input {
  display: none;
}

.upload-filename {
  margin-top: 1rem;
  font-weight: 500;
}
</style>
