<template>
    <div class="relative">
        <!-- Ícono campana -->
        <button @click="toggleDropdown"
            class="relative bg-teal-600 hover:bg-teal-700 text-white w-9 h-9 rounded-full transition duration-200 flex items-center justify-center"
            title="Notificaciones">
            <i class="fa-solid fa-bell"></i>

            <span v-if="cantidadNotis > 0"
                class="absolute -top-1 -right-1 bg-red-600 w-3 h-3 rounded-full border-2 border-white shadow-md">
            </span>
        </button>

        <!-- Dropdown adaptado para escritorio y mobile -->
        <div v-if="mostrar"
            class="absolute right-0 mt-2 w-64 max-w-[90vw] sm:max-w-xs bg-white border rounded-lg shadow-lg z-50 sm:right-0 sm:mt-2">
            <div class="p-4 border-b text-lg font-bold text-[#146b60] flex justify-between items-center">
                <span>Tus notificaciones</span>
            </div>
            <div v-if="loading" class="p-4 text-center text-gray-500">Cargando...</div>
            <div v-else-if="notificaciones.length === 0" class="p-4 text-center text-gray-500">Sin notificaciones</div>
            <ul v-else class="max-h-80 overflow-y-auto">
                <li v-for="noti in notificaciones" :key="noti.id" class="p-4 hover:bg-gray-50 border-b relative">
                    <!-- Botón de eliminar o loader -->
                    <div class="absolute top-3 right-3">
                        <Loader v-if="notificacionEnProceso === noti.id" class="w-4 h-4" />
                        <button v-else @click="eliminarNotificacion(noti.id)"
                            class="text-white transition bg-red-500 rounded-full p-1 hover:bg-white hover:text-red-700 text-sm w-6 h-6 " title="Eliminar notificación">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <h4 class="font-semibold text-black pr-6">{{ noti.titulo }}</h4>
                    <p class="text-sm text-black">{{ noti.mensaje || 'Sin contenido de mensaje' }}</p>
                    <span class="text-xs text-gray-400">{{ formatearFecha(noti.fecha) }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import Loader from "@/components/Loader.vue";


export default {
    data() {
        return {
            mostrar: false,
            loading: false,
            notificaciones: [],
            cantidadNotis: 0,
            notificacionEnProceso: null,
        };
    },
    methods: {
        toggleDropdown() {
            this.mostrar = !this.mostrar;
            if (this.mostrar) {
                this.cargarNotificaciones();
            }
        },
        async cargarNotificaciones() {
            this.loading = true;
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            try {
                const db = getFirestore();
                const notiRef = collection(db, "notificaciones");

                const q = query(notiRef, where("usuarioId", "==", user.uid));
                const snap = await getDocs(q);

                this.notificaciones = [];
                let nuevasNoLeidas = 0;

                for (const docSnap of snap.docs) {
                    const data = docSnap.data();
                    const noti = { id: docSnap.id, ...data };
                    this.notificaciones.push(noti);

                    // Si no estaba leída, la marcamos como leída
                    if (noti.leida === false) {
                        const docRef = doc(db, "notificaciones", docSnap.id);
                        await updateDoc(docRef, { leida: true });
                        nuevasNoLeidas++;
                    }
                }

                // Actualizamos cantidadNotis solo con las no leídas previas (badge)
                this.cantidadNotis -= nuevasNoLeidas;
                if (this.cantidadNotis < 0) this.cantidadNotis = 0;
            } catch (e) {
                console.error("Error al cargar notificaciones:", e);
            }

            this.loading = false;
        },
        async eliminarNotificacion(id) {
            this.notificacionEnProceso = id;

            try {
                const db = getFirestore();
                await deleteDoc(doc(db, "notificaciones", id));
                this.notificaciones = this.notificaciones.filter(n => n.id !== id);
                this.cantidadNotis = this.notificaciones.filter(n => !n.leida).length;
            } catch (e) {
                console.error("Error al eliminar notificación:", e);
            }

            this.notificacionEnProceso = null;
        },
        formatearFecha(fecha) {
            if (!fecha?.toDate) return "";
            return fecha.toDate().toLocaleString("es-AR", {
                weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
            });
        },
    },
};
</script>