<template>
  <div class="flex flex-col min-h-screen">
    <!-- Navbar -->
    <nav :class="['text-white shadow-md', userRole === 'admin' ? 'bg-[#0d0d0d]' : 'bg-teal-950']">
      <div class="container mx-auto flex items-center justify-between px-4 py-3">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2">
          <img src="/img/EquinoGrowt_logo.svg" alt="EquinoGrowt Logo" class="w-40 h-auto" />
        </router-link>

        <!-- Íconos de mobile alineados horizontalmente -->
        <div v-if="isLoggedIn" class="md:hidden flex items-center space-x-2">
          <Notificaciones :mostrar="mostrarNoti" @cerrar="mostrarNoti = false" />
          <button
            class="bg-red-600 hover:bg-red-700 w-10 h-10 text-white flex items-center justify-center rounded-full transition duration-200"
            @click="logout" title="Cerrar sesión">
            <i class="fa-solid fa-right-from-bracket text-lg"></i>
          </button>
        </div>

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
          <li v-if="isLoggedIn">
            <router-link to="/chat" class="relative inline-block hover:text-[#cfe8e4] transition"
              active-class="text-[#cfe8e4] transition active-link">Chat</router-link>
          </li>
          <li v-if="isLoggedIn">
            <router-link to="/calendario" class="relative inline-block hover:text-[#cfe8e4] transition"
              active-class="text-[#cfe8e4] transition active-link">Calendario</router-link>
          </li>
          <Notificaciones v-if="isLoggedIn" :mostrar="mostrarNoti" @cerrar="mostrarNoti = false" />
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
    </nav>

    <!-- Contenido -->
    <main class="flex items-center justify-center container mx-auto px-4 py-6">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="hidden lg:block bg-[#0e0e0e] text-gray-200 pt-10 border-t">
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
            <li v-if="isLoggedIn"><router-link to="/chat" class="hover:underline">Chat</router-link></li>
            <li v-if="isLoggedIn"><router-link to="/perfil" class="hover:underline">Perfil</router-link></li>
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

    <!-- Barra de navegación inferior -->
    <div class="lg:hidden fixed bottom-0 w-full bg-teal-800 shadow-xl rounded-t-2xl z-50">
      <div class="flex justify-around items-center py-3 px-4">

        <!-- Bienvenidos -->
        <router-link v-if="!isLoggedIn" to="/bienvenidos" class="flex flex-col items-center transition-all duration-200"
          :class="{ 'text-white': $route.path !== '/bienvenidos', 'text-teal-200': $route.path === '/bienvenidos' }">
          <i class="fa-solid fa-door-open text-2xl mb-1"></i>
          <span class="text-xs font-medium">Bienvenidos</span>
        </router-link>

        <!-- Login -->
        <router-link v-if="!isLoggedIn" to="/login" class="flex flex-col items-center transition-all duration-200"
          :class="{ 'text-white': $route.path !== '/login', 'text-teal-200': $route.path === '/login' }">
          <i class="fa-solid fa-right-to-bracket text-2xl mb-1"></i>
          <span class="text-xs font-medium">Login</span>
        </router-link>

        <!-- Registro -->
        <router-link v-if="!isLoggedIn" to="/registro" class="flex flex-col items-center transition-all duration-200"
          :class="{ 'text-white': $route.path !== '/registro', 'text-teal-200': $route.path === '/registro' }">
          <i class="fa-solid fa-user-plus text-2xl mb-1"></i>
          <span class="text-xs font-medium">Registro</span>
        </router-link>

        <!-- Inicio -->
        <router-link v-if="isLoggedIn" to="/" class="flex flex-col items-center transition-all duration-200"
          :class="{ 'text-white': $route.path !== '/', 'text-teal-200': $route.path === '/' }">
          <i class="fa-solid fa-house text-2xl mb-1"></i>
          <span class="text-xs font-medium">Inicio</span>
        </router-link>

        <!-- Mensajes -->
        <router-link v-if="isLoggedIn" to="/chat" class="flex flex-col items-center transition-all duration-200"
          :class="{ 'text-white': $route.path !== '/chat', 'text-teal-200': $route.path === '/chat' }">
          <i class="fa-solid fa-comment-dots text-2xl mb-1"></i>
          <span class="text-xs font-medium">Mensajes</span>
        </router-link>

        <!-- Calendario -->
        <router-link v-if="isLoggedIn" to="/calendario" class="flex flex-col items-center transition-all duration-200"
          :class="{ 'text-white': $route.path !== '/calendario', 'text-teal-200': $route.path === '/calendario' }">
          <i class="fa-solid fa-calendar-days text-2xl mb-1"></i>
          <span class="text-xs font-medium">Calendario</span>
        </router-link>

        <!-- Perfil -->
        <router-link v-if="isLoggedIn" to="/perfil" class="flex flex-col items-center transition-all duration-200"
          :class="{ 'text-white': $route.path !== '/perfil', 'text-teal-200': $route.path === '/perfil' }">
          <img :src="userPhoto" alt="Foto de perfil"
            class="w-8 h-8 rounded-full object-cover mb-1 border-2 border-teal-200 shadow-md" />
          <span class="text-xs font-medium">Perfil</span>
        </router-link>

      </div>
    </div>

  </div>
</template>

<!-- Contenido -->
<script>
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import Notificaciones from "@/components/Notificaciones.vue";

export default {
  data() {
    return {
      menuOpen: false,
      isLoggedIn: false,
      userEmail: "",
      userRole: "",
      userPhoto: "/img/default-user.jpg",
      notificaciones: [],
      cantidadNotis: 0,
      notisDropdownAbierto: false,
    };
  },
  components: { Notificaciones },
  watch: {
    $route(to) {
      this.menuOpen = false;
      this.actualizarFondo();
    },
  },
  methods: {
    async logout() {
      const auth = getAuth();
      await signOut(auth);
      this.isLoggedIn = false;
      this.$router.push("/login");
    },
    async obtenerNotificaciones() {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return;

      const q = query(
        collection(db, "notificaciones"),
        where("usuarioId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      this.notificaciones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.cantidadNotis = this.notificaciones.filter(n => !n.leida).length;
    },
    toggleDropdown() {
      this.notisDropdownAbierto = !this.notisDropdownAbierto;
    },
    actualizarFondo() {
      const appDiv = document.getElementById("app");
      if (!appDiv) return;

      // Limpiar clases anteriores
      appDiv.classList.remove(
        'bg-gradient-to-br',
        'from-[#0d3b2e]',
        'via-[#146b60]',
        'to-[#0d3b2e]',
        'bg-white'
      );

      // Agregar la clase correspondiente
      if (this.$route.path === '/login' || this.$route.path === '/registro') {
        appDiv.classList.add(
          'bg-gradient-to-br',
          'from-[#0d3b2e]',
          'via-[#146b60]',
          'to-[#0d3b2e]'
        );
      } else {
        appDiv.classList.add('bg-white');
      }
    }
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

        await this.obtenerNotificaciones();
      } else if (this.$route.path !== "/login" && this.$route.path !== "/registro") {
        this.$router.push("/login");
      }
    });

    // Asegura que se aplique el fondo al cargar por primera vez
    this.actualizarFondo();
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
  padding-bottom: 5rem;
  /* espacio para la barra inferior */
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
