<template>
    <div class="relative">
        <!-- Ícono campana -->
        <button @click="toggleDropdown"
            class="relative bg-teal-600 hover:bg-teal-700 text-white md:h-9 w-10 md:w-9 h-10 rounded-full transition duration-200 flex items-center justify-center"
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
                    <!-- Botón de eliminar solo para notificaciones normales -->
                    <div class="absolute top-3 right-3" v-if="noti.tipo !== 'solicitud_turno'">
                        <Loader v-if="notificacionEnProceso === noti.id" class="w-4 h-4" />
                        <button v-else @click="eliminarNotificacion(noti.id)"
                            class="text-white transition bg-red-500 rounded-full p-1 hover:bg-white hover:text-red-700 text-sm w-6 h-6">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <h4 class="font-semibold text-black pr-6">{{ noti.titulo }}</h4>
                    <p class="text-sm text-black">{{ noti.mensaje || 'Sin contenido de mensaje' }}</p>
                    <span class="text-xs text-gray-400">{{ formatearFecha(noti.fecha) }}</span>

                    <!-- Botones aceptar/rechazar para solicitudes de turno -->
                    <div v-if="noti.tipo === 'solicitud-turno'" class="mt-3 flex gap-2">
                        <button @click="aceptarTurno(noti)"
                            class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                            Aceptar
                        </button>
                        <button @click="eliminarNotificacion(noti.id)"
                            class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                            Rechazar
                        </button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
    getFirestore, collection, query, where, getDocs, getDoc, doc, updateDoc, deleteDoc, setDoc, addDoc, serverTimestamp
} from "firebase/firestore";
import Loader from "@/components/Loader.vue";
import Swal from "sweetalert2";

export default {
    components: { Loader },
    data() {
        return {
            mostrar: false,
            loading: false,
            notificaciones: [],
            cantidadNotis: 0,
            notificacionEnProceso: null,
            cargando: false, // para aceptarTurno
            userUid: null,
            db: null
        };
    },
    mounted() {
        const auth = getAuth();
        this.db = getFirestore();

        // Esperar autenticación para obtener UID
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.userUid = user.uid;
                this.contarNotificacionesNoLeidas();
            } else {
                this.userUid = null;
                this.notificaciones = [];
                this.cantidadNotis = 0;
            }
        });
    },
    methods: {
        toggleDropdown() {
            this.mostrar = !this.mostrar;
            if (this.mostrar) {
                this.cargarNotificaciones();
            }
        },

        async contarNotificacionesNoLeidas() {
            if (!this.userUid) return;
            try {
                const q = query(collection(this.db, "notificaciones"), where("usuarioId", "==", this.userUid), where("leida", "==", false));
                const snap = await getDocs(q);
                this.cantidadNotis = snap.size;
            } catch (e) {
                console.error("Error al contar notificaciones:", e);
            }
        },

        async cargarNotificaciones() {
            if (!this.userUid) return;
            this.loading = true;
            try {
                const q = query(collection(this.db, "notificaciones"), where("usuarioId", "==", this.userUid));
                const snap = await getDocs(q);

                this.notificaciones = [];
                for (const docSnap of snap.docs) {
                    const data = docSnap.data();
                    const noti = { id: docSnap.id, ...data };
                    this.notificaciones.push(noti);

                    if (!noti.leida) {
                        await updateDoc(doc(this.db, "notificaciones", docSnap.id), { leida: true });
                    }
                }
                this.cantidadNotis = this.notificaciones.filter(n => !n.leida).length;
            } catch (e) {
                console.error("Error al cargar notificaciones:", e);
            }
            this.loading = false;
        },

        async eliminarNotificacion(id) {
            this.notificacionEnProceso = id;
            try {
                await deleteDoc(doc(this.db, "notificaciones", id));
                this.notificaciones = this.notificaciones.filter(n => n.id !== id);
                this.cantidadNotis = this.notificaciones.filter(n => !n.leida).length;
            } catch (e) {
                console.error("Error al eliminar notificación:", e);
            }
            this.notificacionEnProceso = null;
        },

        async aceptarTurno(noti) {
            this.cargando = true;
            try {
                const doctorUid = this.userUid;
                if (!doctorUid) {
                    await Swal.fire('Error', 'No se encontró el usuario logueado.', 'error');
                    return;
                }

                const pacienteUid = noti.pacienteUid || noti.usuarioId;
                let pacienteNombre = noti.pacienteNombre || noti.paciente || null;
                let fecha = noti.fechaTurno || null;
                let inicio = noti.inicioTurno || null;
                let fin = noti.finTurno || null;
                const msg = noti.mensaje || '';

                const normalizeFecha = (input) => {
                    if (!input) return null;
                    if (input instanceof Date) {
                        const y = input.getFullYear();
                        const m = String(input.getMonth() + 1).padStart(2, '0');
                        const d = String(input.getDate()).padStart(2, '0');
                        return `${y}-${m}-${d}`;
                    }
                    const iso = input.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
                    if (iso) return `${iso[1]}-${String(iso[2]).padStart(2, '0')}-${String(iso[3]).padStart(2, '0')}`;
                    const dmy = input.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
                    if (dmy) return `${dmy[3]}-${String(dmy[2]).padStart(2, '0')}-${String(dmy[1]).padStart(2, '0')}`;
                    return null;
                };

                if (!pacienteNombre) {
                    const nameMatch = msg.match(/^(.+?)\s+solicita/i);
                    if (nameMatch) pacienteNombre = nameMatch[1].trim();
                }
                if (!fecha) {
                    const dateMatch = msg.match(/\b(20\d{2}[-\/]\d{1,2}[-\/]\d{1,2})\b/);
                    if (dateMatch) fecha = normalizeFecha(dateMatch[1]);
                } else {
                    fecha = normalizeFecha(fecha);
                }
                if (!inicio || !fin) {
                    const timeMatches = msg.match(/(\d{1,2}:\d{2})/g);
                    if (timeMatches) {
                        if (!inicio) inicio = timeMatches[0];
                        if (!fin && timeMatches[1]) fin = timeMatches[1];
                    }
                }

                if (!pacienteUid || !fecha || !inicio || !fin) {
                    await Swal.fire({
                        icon: 'warning',
                        title: 'Datos incompletos',
                        html: `Faltan datos para aceptar el turno`,
                        timerProgressBar: true,
                        timer: 4000
                    });
                    return;
                }

                // Obtener nombre del doctor
                let doctorNombre = '';
                const docRefDoc = doc(this.db, "Tipo_de_usuario", doctorUid);
                const snapDoc = await getDoc(docRefDoc);
                if (snapDoc.exists()) doctorNombre = snapDoc.data().nombre || '';

                // Mismo formato que agendarTurno
                const turno = {
                    doctor: doctorNombre || 'Doctor',
                    doctorUid,
                    paciente: pacienteNombre || '',
                    pacienteUid,
                    fecha,
                    inicio,
                    fin,
                    creado: new Date()
                };

                // Guardar en paciente
                const refPaciente = doc(this.db, "Tipo_de_usuario", pacienteUid);
                const snapPaciente = await getDoc(refPaciente);
                const dataPaciente = snapPaciente.exists() ? snapPaciente.data() : {};
                const turnosPaciente = dataPaciente.turnos || [];
                turnosPaciente.push(turno);
                await setDoc(refPaciente, { ...dataPaciente, turnos: turnosPaciente }, { merge: true });

                // Guardar en doctor
                const refTurnoDoctor = doc(this.db, "doctores", doctorUid, "turnos", `${fecha}_${pacienteUid}`);
                await setDoc(refTurnoDoctor, turno);

                // Eliminar notificación original
                if (noti.id) {
                    await deleteDoc(doc(this.db, "notificaciones", noti.id));
                    this.notificaciones = this.notificaciones.filter(n => n.id !== noti.id);
                }

                // Notificación al paciente
                await addDoc(collection(this.db, 'notificaciones'), {
                    usuarioId: pacienteUid,
                    titulo: 'Turno aceptado',
                    mensaje: `Tu turno para el ${fecha} de ${inicio} a ${fin} fue aceptado.`,
                    tipo: 'turno-aceptado',
                    leida: false,
                    fecha: serverTimestamp()
                });

                await Swal.fire({
                    icon: 'success',
                    title: 'Turno aceptado',
                    text: `Turno para ${pacienteNombre} el ${fecha}`,
                    timerProgressBar: true,
                    timer: 2500,
                    showConfirmButton: false
                });

                // 🔄 Aquí podés disparar un evento global para que el calendario se actualice
                // this.$emit("turnoAceptado", turno);

            } catch (error) {
                console.error("Error en aceptarTurno:", error);
                await Swal.fire('Error', 'Ocurrió un error al aceptar el turno.', 'error');
            } finally {
                this.cargando = false;
            }
        },

        formatearFecha(fecha) {
            if (!fecha?.toDate) return "";
            return fecha.toDate().toLocaleString("es-AR", {
                weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
            });
        }
    }
};
</script>
