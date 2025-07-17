<template>
  <div class="h-screen w-full flex overflow-hidden max-w-[1400px] mx-auto">
    <!-- Panel izquierdo: Lista de chats -->
    <div v-if="mostrarContactos" class="w-full md:w-1/3 border-r bg-white flex flex-col">
      <!-- Encabezado -->
      <div class="p-6 flex items-center justify-between border-b">
        <h2 class="text-2xl font-bold text-[#146b60]">Chats</h2>
        <img :src="fotoPerfilUsuario" class="w-12 h-12 rounded-full object-cover border-2 border-[#146b60]" />
      </div>

      <!-- Buscador -->
      <div class="px-2 py-4">
        <div class="relative w-full">
          <i
            class="fa-solid fa-magnifying-glass text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2 text-base"></i>
          <input v-model="busqueda" type="text" placeholder="Buscar contacto" class="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-100 text-base
             focus:outline-none focus:ring-2 focus:ring-[#146b60] focus:border-[#146b60]" />
        </div>
      </div>

      <!-- Lista de contactos -->
      <div class="overflow-y-auto px-2">
        <Loader v-if="cargandoChats" class="mt-10" />
        <div v-else v-for="contacto in contactosFiltrados" :key="contacto.uid" @click="abrirChat(contacto)"
          class="flex items-center mb-2 gap-4 px-4 py-4 hover:bg-gray-100 cursor-pointer border-2 border-[#146b60] rounded">
          <img :src="contacto.foto" class="w-12 h-12 rounded-full object-cover border-2 border-[#146b60]" />
          <div class="flex-1">
            <h3 class="font-semibold text-base">{{ contacto.nombre }}</h3>
            <p class="text-sm text-gray-500 truncate">{{ contacto.ultimoMensaje ? contacto.ultimoMensaje.slice(0, 7) +
              '...' : '' }}</p>
          </div>
          <div v-if="contacto.nuevosMensajes" class="bg-[#146b60] text-white text-xs px-2 py-1 rounded-full">
            {{ contacto.nuevosMensajes }}
          </div>
        </div>
      </div>
    </div>

    <!-- Panel derecho: Chat activo -->
    <div v-if="mostrarChat" key="chat" class="w-full md:flex flex-col md:w-2/3 bg-gray-50 brand-pattern">
      <div v-if="chatActivo" class="flex flex-col h-full">
        <!-- Header del chat -->
        <div class="p-6 border-b flex items-center justify-between bg-white">
          <div class="flex items-center gap-4">
            <img :src="chatActivo.foto" class="w-12 h-12 rounded-full object-cover border-2 border-[#146b60]" />
            <div>
              <h3 class="font-bold text-lg">{{ chatActivo.nombre }}</h3>
            </div>
          </div>
          <button @click="volverAContactos"
            class="text-[#146b60] bg-teal-100 rounded-full w-8 h-8 text-xl font-bold hover:bg-[#146b60] shadow hover:text-white transition">
            <!-- Solo en escritorio -->
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Mensajes -->
        <div ref="mensajesContainer" class="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <Loader v-if="cargandoMensajes" class="mt-10" />
          <div v-else v-for="grupo in mensajesAgrupados" :key="grupo.fecha">
            <!-- Separador de fecha flotante -->
            <div class="sticky top-0 z-10 flex justify-center">
              <span class="bg-[#146b60] text-white text-xs px-4 py-1 rounded-full shadow-md my-2">
                {{ grupo.fecha }}
              </span>
            </div>

            <!-- Mensajes del grupo -->
            <div v-for="mensaje in grupo.mensajes" :key="mensaje.id" class="flex items-center gap-2 mb-4"
              :class="mensaje.uid === usuario.uid ? 'justify-end' : 'justify-start'">

              <img v-if="mensaje.uid !== usuario.uid" :src="chatActivo.foto || '/img/default-user.jpg'"
                alt="Foto usuario" class="w-12 h-12 rounded-full object-cover border-2 border-[#146b60]" />

              <div :class="mensaje.uid === usuario.uid
                ? 'bg-[#146b60] text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl'
                : 'bg-green-100 text-gray-900 rounded-tr-xl rounded-bl-xl rounded-br-xl'"
                class="px-4 py-2 max-w-[75%] text-sm shadow">
                <p class="whitespace-pre-line">{{ mensaje.texto }}</p>
                <div class="text-[10px] mt-1 text-right"
                  :class="mensaje.uid === usuario.uid ? 'text-white/70' : 'text-gray-500'">
                  {{ formatearHora(mensaje.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-6 border-t bg-white">
          <form @submit.prevent="enviarMensaje" class="flex gap-3">
            <input v-model="nuevoMensaje" type="text" placeholder="Escribe un mensaje"
              class="flex-1 border border-gray-300 rounded-full px-5 py-3 text-base focus:outline-none focus:border-[#146b60] focus:ring-2 focus:ring-[#146b60]" />
            <button type="submit" class="bg-[#146b60] text-white px-6 py-3 rounded-full text-base">
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>

      <div v-else class="flex items-center justify-center h-full text-gray-400 text-xl px-6 text-center">
        Selecciona un chat para comenzar
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { db } from '@/firebase'
import { collection, doc, getDoc, getDocs, query, where, orderBy, addDoc, serverTimestamp, onSnapshot, setDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import Loader from '../components/Loader.vue'

const auth = getAuth()
const usuario = ref(auth.currentUser)
const busqueda = ref("")
const contactos = ref([])
const posiblesUsuarios = ref([])
const chats = ref([])
const chatActivo = ref(null)
const mensajes = ref([])
const nuevoMensaje = ref("")
const mensajesContainer = ref(null)
const esMovil = ref(window.innerWidth <= 768)
const cargandoChats = ref(false)
const cargandoMensajes = ref(false)

function actualizarModoResponsive() {
  esMovil.value = window.innerWidth <= 768
}

function obtenerEtiquetaFecha(timestamp) {
  const fecha = timestamp.toDate ? timestamp.toDate() : timestamp
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)

  const esMismoDia = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()

  if (esMismoDia(fecha, hoy)) return 'Hoy'
  if (esMismoDia(fecha, ayer)) return 'Ayer'

  return fecha.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
  })
}

const mensajesAgrupados = computed(() => {
  const grupos = []
  let grupoActual = null
  let ultimaFecha = null

  for (const mensaje of mensajes.value) {
    const fecha = mensaje.timestamp?.toDate?.() || mensaje.timestamp
    const etiqueta = obtenerEtiquetaFecha(fecha)

    if (etiqueta !== ultimaFecha) {
      grupoActual = {
        fecha: etiqueta,
        mensajes: []
      }
      grupos.push(grupoActual)
      ultimaFecha = etiqueta
    }

    grupoActual.mensajes.push(mensaje)
  }

  return grupos
})


onMounted(() => {
  window.addEventListener('resize', actualizarModoResponsive)
  cargarChatsYContactos()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', actualizarModoResponsive)
})

const mostrarContactos = computed(() => {
  return !esMovil.value || (esMovil.value && !chatActivo.value)
})

const mostrarChat = computed(() => {
  return !esMovil.value || (esMovil.value && chatActivo.value)
})

function volverAContactos() {
  chatActivo.value = null
}

const fotoPerfilUsuario = computed(() =>
  usuario.value?.photoURL || 'https://ui-avatars.com/api/?name=Usuario'
)

async function cargarChatsYContactos() {
  cargandoChats.value = true
  const q = query(
    collection(db, 'chats'),
    where('participantes', 'array-contains', usuario.value.uid)
  );

  const snapshot = await getDocs(q);
  const tempChats = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const otroUid = data.usuario1 === usuario.value.uid ? data.usuario2 : data.usuario1;

    try {
      const otroUserDoc = await getDoc(doc(db, 'Tipo_de_usuario', otroUid));
      if (otroUserDoc.exists()) {
        const otroUserData = otroUserDoc.data();
        if (otroUserData.tipo === 'admin') continue;

        tempChats.push({
          id: docSnap.id,
          nombre: otroUserData.nombre,
          foto: otroUserData.foto || otroUserData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(otroUserData.nombre)}`,
          uid: otroUid,
          ultimoMensaje: data.ultimoMensaje || '',
          timestamp: data.timestamp?.toDate?.() || new Date(),
          nuevosMensajes: 0,
        });
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  }

  chats.value = tempChats.sort((a, b) => b.timestamp - a.timestamp);
  contactos.value = chats.value;

  const todosUsuariosSnap = await getDocs(collection(db, 'Tipo_de_usuario'));
  posiblesUsuarios.value = todosUsuariosSnap.docs
    .filter(d => d.id !== usuario.value.uid)
    .map(d => {
      const data = d.data();
      return {
        nombre: data.nombre,
        foto: data.foto || data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nombre)}`,
        uid: d.id,
        tipo: data.tipo || '',
        ultimoMensaje: '',
      };
    })
    .filter(u => u.tipo !== 'admin');

  cargandoChats.value = false
}

function formatearHora(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : timestamp
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const contactosFiltrados = computed(() => {
  const termino = busqueda.value.toLowerCase().trim();
  if (!termino) return chats.value;
  return posiblesUsuarios.value.filter(c =>
    c.nombre.toLowerCase().includes(termino)
  );
})

function scrollAlFinal() {
  nextTick(() => {
    const container = mensajesContainer.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
}

async function abrirChat(contacto) {
  cargandoMensajes.value = true
  chatActivo.value = contacto
  mensajes.value = []

  const idChat = obtenerChatId(usuario.value.uid, contacto.uid)
  const refChat = doc(db, 'chats', idChat)

  const chatSnap = await getDoc(refChat)
  if (!chatSnap.exists()) {
    await setDoc(refChat, {
      usuario1: usuario.value.uid,
      usuario2: contacto.uid,
      participantes: [usuario.value.uid, contacto.uid],
      ultimoMensaje: '',
      timestamp: serverTimestamp()
    })

    chats.value.push({
      id: idChat,
      nombre: contacto.nombre,
      foto: contacto.foto,
      uid: contacto.uid,
      ultimoMensaje: '',
      nuevosMensajes: 0
    });
    contactos.value = chats.value;
  }

  const q = query(collection(refChat, 'mensajes'), orderBy('timestamp'))

  onSnapshot(q, (snapshot) => {
    mensajes.value = snapshot.docs.map(doc => doc.data())
    scrollAlFinal()
    cargandoMensajes.value = false
  })

  scrollAlFinal()
}

async function enviarMensaje() {
  if (!nuevoMensaje.value.trim()) return

  const idChat = obtenerChatId(usuario.value.uid, chatActivo.value.uid)
  const refChat = doc(db, 'chats', idChat)
  const refMensajes = collection(refChat, 'mensajes')

  const chatSnap = await getDoc(refChat)
  if (!chatSnap.exists()) {
    await setDoc(refChat, {
      usuario1: usuario.value.uid,
      usuario2: chatActivo.value.uid,
      participantes: [usuario.value.uid, chatActivo.value.uid],
      ultimoMensaje: nuevoMensaje.value,
      timestamp: serverTimestamp()
    })
  } else {
    await setDoc(refChat, {
      ultimoMensaje: nuevoMensaje.value,
      timestamp: serverTimestamp()
    }, { merge: true })
  }

  await addDoc(refMensajes, {
    texto: nuevoMensaje.value,
    uid: usuario.value.uid,
    timestamp: serverTimestamp()
  })

  // Crear notificación para el receptor
  await addDoc(collection(db, 'notificaciones'), {
    usuarioId: chatActivo.value.uid,
    titulo: `Nuevo chat de ${usuario.value.displayName || 'Usuario'}`,
    mensaje: nuevoMensaje.value.slice(0, 100), // Máximo 100 caracteres
    tipo: 'nuevo mensaje chat',
    leida: false,
    fecha: serverTimestamp()
  })

  nuevoMensaje.value = ""
}

function obtenerChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_')
}
</script>
