<template>
    <!-- Contenedor general adaptativo -->
    <div
        class="flex flex-col md:flex-row items-start justify-center gap-1 md:gap-6 p-4 md:p-10 max-w-5xl mx-auto bg-white shadow-lg rounded-2xl">
        <Loader v-if="cargando"
            class="absolute inset-0 z-10 bg-white/80 flex items-center justify-center rounded-2xl" />

        <!-- Vista móvil - solo calendario con barrita inferior -->
        <div class="flex flex-col items-center justify-center p-4 pt-6 max-w-sm mx-auto bg-white shadow rounded-2xl">

            <!-- Encabezado -->
            <div class="flex items-center justify-between w-full mb-4">
                <div>
                    <h1 class="text-xl font-semibold text-[#146b60]">
                        Hola {{ tipoUsuario === 'doctor' ? 'D.r ' + nombreUsuario : nombreUsuario }}
                    </h1>
                    <p class="text-gray-500 capitalize text-sm">{{ mesActual }} {{ añoActual }}</p>
                </div>
                <img v-if="fotoPerfil" :src="fotoPerfil" alt="Foto de perfil"
                    class="w-12 h-12 rounded-full object-cover border-2 border-[#146b60]" />
            </div>

            <!-- Calendario -->
            <div class="grid grid-cols-7 gap-y-3 text-center text-sm text-gray-700 w-full mb-4 relative">
                <div v-for="(dia, index) in diasSemana" :key="index" class="font-semibold text-[#146b60]">
                    {{ dia }}
                </div>

                <div v-for="n in primerDiaMes" :key="'vacio-' + n" class="text-gray-300 select-none">
                    &nbsp;
                </div>

                <div v-for="dia in diasDelMes" :key="dia"
                    class="relative flex items-center justify-center w-10 h-10 mx-auto rounded-full cursor-pointer transition-all group"
                    :class="{
                        'bg-[#146b60] text-white': esHoy(dia),
                        'hover:bg-[#d6f0ec] text-[#146b60]': !esHoy(dia),
                        'ring-2 ring-[#146b60]': fechaSeleccionada === formatFecha(añoActual, fechaActual.getMonth(), dia)
                    }" @click="seleccionarDia(dia)">
                    {{ dia }}

                    <!-- Marquita de turno -->
                    <div v-if="getPacienteDelDia(dia)" class="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#146b60]">
                    </div>

                    <!-- Tooltip estilizado mejorado -->
                    <div v-if="getPacienteDelDia(dia)"
                        class="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#146b60] text-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity z-40 pointer-events-none">
                        {{ getPacienteDelDia(dia) }}
                    </div>
                </div>
            </div>

            <!-- Barrita de sección -->
            <div class="w-16 h-1.5 bg-gray-300 rounded-full mb-2"></div>
        </div>

        <!-- Contenedor de contenido derecho -->
        <div v-if="tipoUsuario === 'doctor' || (turnoSeleccionado && turnoSeleccionado.length > 0)"
            class="w-full md:w-1/2 space-y-4">
            <!-- ✅ Formulario de agendado: solo para doctores -->
            <div v-if="tipoUsuario === 'doctor'" class="space-y-4">
                <h2 class="text-[#146b60] font-semibold text-lg mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-calendar-day"></i>
                    Agenda
                </h2>

                <!-- Campo: Nombre del paciente -->
                <div class="relative">
                    <i
                        class="fa-solid fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input type="text" v-model="nombrePaciente" @input="buscarPacientes"
                        placeholder="Nombre del paciente"
                        class="w-full border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#146b60] text-sm" />

                    <!-- Resultados del autocomplete -->
                    <ul v-if="resultadosPacientes.length"
                        class="absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-40 overflow-y-auto text-sm">
                        <li v-for="paciente in resultadosPacientes" :key="paciente.uid"
                            @click="seleccionarPaciente(paciente)" class="px-4 py-2 cursor-pointer hover:bg-gray-100">
                            {{ paciente.nombre }}
                        </li>
                    </ul>
                </div>

                <!-- Campo: Fecha seleccionada -->
                <div class="relative">
                    <i
                        class="fa-solid fa-calendar-day absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input type="text" :value="fechaSeleccionada || 'Seleccione un día del calendario'" readonly
                        class="w-full border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#146b60] bg-gray-50 text-gray-600 text-sm" />
                </div>

                <!-- Horarios -->
                <div class="flex flex-row gap-4">
                    <div class="relative w-full">
                        <i
                            class="fa-solid fa-clock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input type="time" v-model="horaInicio"
                            class="w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#146b60] pl-10 pr-4 py-3 text-sm" />
                    </div>
                    <div class="relative w-full">
                        <i
                            class="fa-solid fa-hourglass-end absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input type="time" v-model="horaFin"
                            class="w-full border focus:outline-none focus:ring-2 focus:ring-[#146b60] rounded-lg pl-10 pr-4 py-3 text-sm" />
                    </div>
                </div>

                <!-- Botón agendar -->
                <button @click="agendarTurno"
                    class="w-full bg-[#146b60] text-white py-3 rounded-lg hover:bg-[#0f594f] transition text-sm">
                    <i class="fa-solid fa-calendar-plus mr-2"></i> Agendar
                </button>
            </div>

            <!-- ✅ Vista de turnos del día: para doctor y paciente -->
            <div v-if="turnoSeleccionado && turnoSeleccionado.length > 0"
                class="relative mt-6 p-5 rounded-xl shadow-md border bg-white space-y-3">
                <!-- Botón flotante para cerrar -->
                <button @click="turnoSeleccionado = null"
                    class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 transition">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>

                <h3 class="text-lg font-bold text-[#146b60] flex items-center gap-2 mb-4">
                    <i class="fa-solid fa-calendar-check"></i> Turnos del {{ fechaSeleccionada }}
                </h3>

                <!-- Lista de turnos -->
                <div v-for="(turno, index) in turnoSeleccionado" :key="index"
                    class="relative text-sm text-gray-700 space-y-1 border border-gray-200 rounded-lg p-4 mb-2">
                    <!-- Botón para eliminar turno (solo doctor) -->
                    <button v-if="tipoUsuario === 'doctor'" @click="eliminarTurnoIndividual(turno)"
                        class="absolute top-2 right-2 text-red-500 hover:text-red-700 transition text-xs">
                        <i class="fa-solid fa-trash"></i>
                    </button>

                    <!-- Info según el tipo de usuario -->
                    <p v-if="tipoUsuario === 'doctor'">
                        <i class="fa-solid fa-user text-[#146b60] mr-1"></i>
                        <strong>Paciente:</strong> {{ turno.paciente }}
                    </p>
                    <p v-else>
                        <i class="fa-solid fa-user-doctor text-[#146b60] mr-1"></i>
                        <strong>Doctor:</strong> {{ turno.doctor }}
                    </p>

                    <p>
                        <i class="fa-solid fa-clock text-[#146b60] mr-1"></i>
                        <strong>Horario:</strong> {{ formatHora(turno.inicio) }} - {{ formatHora(turno.fin) }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, deleteDoc, setDoc, getDocs, collection } from "firebase/firestore";
import { auth, db } from "@/firebase";
import Swal from "sweetalert2";
import Loader from "../components/Loader.vue"

const swal = Swal.mixin({
    customClass: {
        confirmButton: 'bg-[#146b60] text-white px-4 py-2 rounded hover:bg-[#0f594f]',
        cancelButton: 'bg-gray-200 text-gray-800 px-4 py-2 rounded'
    },
    buttonsStyling: false
});

export default {
    data() {
        return {
            nombreUsuario: "",
            tipoUsuario: "",
            fotoPerfil: "",
            fechaActual: new Date(),
            fechaSeleccionada: null,
            diasSemana: ["W", "T", "F", "S", "S", "M", "T"],
            diasConTurnos: [],
            nombrePaciente: "",
            resultadosPacientes: [],
            pacienteSeleccionado: null,
            horaInicio: "",
            horaFin: "",
            esMobile: false,
            cargando: false,
            turnoSeleccionado: null,
        };
    },
    components: {
        Loader,
    },
    computed: {
        añoActual() {
            return this.fechaActual.getFullYear();
        },
        mesActual() {
            return this.fechaActual.toLocaleString("es-ES", { month: "long" });
        },
        primerDiaMes() {
            const fecha = new Date(this.añoActual, this.fechaActual.getMonth(), 1);
            return (fecha.getDay() + 6) % 7; // Ajuste para que empiece en "W"
        },
        diasDelMes() {
            const año = this.añoActual;
            const mes = this.fechaActual.getMonth() + 1;
            return new Date(año, mes, 0).getDate();
        },
    },
    methods: {
        formatFecha(año, mes, dia) {
            const fecha = new Date(año, mes, dia);
            return fecha.toISOString().split('T')[0]; // yyyy-mm-dd
        },

        esHoy(dia) {
            const hoy = new Date();
            return (
                hoy.getDate() === dia &&
                hoy.getMonth() === this.fechaActual.getMonth() &&
                hoy.getFullYear() === this.fechaActual.getFullYear()
            );
        },

        async cargarUsuario() {
            this.cargando = true;
            return new Promise((resolve) => {
                onAuthStateChanged(auth, async (user) => {
                    if (user) {
                        try {
                            const docRef = doc(db, "Tipo_de_usuario", user.uid);
                            const docSnap = await getDoc(docRef);
                            if (docSnap.exists()) {
                                const datos = docSnap.data();
                                this.nombreUsuario = datos.nombre || "Usuario";
                                this.fotoPerfil = datos.fotoPerfil || user.photoURL;
                                this.tipoUsuario = datos.tipo || "";
                            } else {
                                this.nombreUsuario = user.displayName || "Usuario";
                                this.fotoPerfil = user.photoURL || "";
                            }
                        } catch (error) {
                            console.error("Error al cargar usuario:", error);
                        } finally {
                            this.cargando = false;
                            resolve();
                        }
                    } else {
                        this.cargando = false;
                        resolve();
                    }
                });
            });
        },

        async buscarPacientes() {
            const q = this.nombrePaciente.toLowerCase();
            if (q.length < 2) {
                this.resultadosPacientes = [];
                return;
            }

            const snapshot = await getDocs(collection(db, "Tipo_de_usuario"));
            this.resultadosPacientes = snapshot.docs
                .map(doc => ({ uid: doc.id, ...doc.data() }))
                .filter(user =>
                    user.tipo === "paciente" &&
                    user.nombre?.toLowerCase().includes(q)
                );
        },

        seleccionarPaciente(paciente) {
            this.nombrePaciente = paciente.nombre;
            this.pacienteSeleccionado = paciente;
            this.resultadosPacientes = [];
        },

        async agendarTurno() {
            this.cargando = true;
            try {
                if (!this.pacienteSeleccionado || !this.fechaSeleccionada || !this.horaInicio || !this.horaFin) {
                    await swal.fire({
                        icon: 'warning',
                        title: 'Completa los campos',
                        text: `Debes completar todos los campos para poder agendar un turno`,
                    });
                    return;
                }

                const [año, mes, dia] = this.fechaSeleccionada.split("-").map(Number);
                const fecha = `${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

                const turno = {
                    doctor: this.nombreUsuario,
                    doctorUid: auth.currentUser.uid,
                    paciente: this.pacienteSeleccionado.nombre,
                    pacienteUid: this.pacienteSeleccionado.uid,
                    fecha,
                    inicio: this.horaInicio,
                    fin: this.horaFin,
                    creado: new Date()
                };

                const refPaciente = doc(db, "Tipo_de_usuario", this.pacienteSeleccionado.uid);
                const docSnap = await getDoc(refPaciente);
                const data = docSnap.exists() ? docSnap.data() : {};
                const turnosPaciente = data.turnos || [];
                turnosPaciente.push(turno);
                await setDoc(refPaciente, { ...data, turnos: turnosPaciente }, { merge: true });

                const refTurnoDoctor = doc(db, "doctores", auth.currentUser.uid, "turnos", `${fecha}_${this.pacienteSeleccionado.uid}`);
                await setDoc(refTurnoDoctor, turno);

                await swal.fire({
                    icon: 'success',
                    title: 'Turno agendado',
                    text: `Turno para ${this.pacienteSeleccionado.nombre} el día ${turno.fecha}`,
                });

                this.obtenerDiasConTurnos();
            } catch (error) {
                console.error("Error al agendar turno:", error);
                await swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al agendar el turno.',
                });
            } finally {
                this.cargando = false;
            }
        },

        async obtenerDiasConTurnos() {
            this.diasConTurnos = [];
            this.cargando = true;

            try {
                const user = auth.currentUser;
                if (!user) return;

                if (this.tipoUsuario === "doctor") {
                    const snapshot = await getDocs(collection(db, "doctores", user.uid, "turnos"));
                    snapshot.forEach(doc => {
                        const turno = doc.data();
                        const [año, mes, dia] = turno.fecha.split("-").map(Number);
                        const fecha = new Date(año, mes - 1, dia);
                        if (
                            fecha.getMonth() === this.fechaActual.getMonth() &&
                            fecha.getFullYear() === this.fechaActual.getFullYear()
                        ) {
                            const dia = fecha.getDate();
                            const existente = this.diasConTurnos.find(t => t.dia === dia);

                            const nuevoTurno = {
                                paciente: turno.paciente,
                                pacienteUid: turno.pacienteUid,
                                inicio: turno.inicio,
                                fin: turno.fin
                            };

                            if (existente) {
                                existente.turnos.push(nuevoTurno);
                            } else {
                                this.diasConTurnos.push({ dia, turnos: [nuevoTurno] });
                            }
                        }
                    });
                } else if (this.tipoUsuario === "paciente") {
                    const ref = doc(db, "Tipo_de_usuario", user.uid);
                    const docSnap = await getDoc(ref);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const turnos = data.turnos || [];

                        for (const turno of turnos) {
                            const [año, mes, dia] = turno.fecha.split("-").map(Number);
                            const fecha = new Date(año, mes - 1, dia);
                            if (
                                fecha.getMonth() === this.fechaActual.getMonth() &&
                                fecha.getFullYear() === this.fechaActual.getFullYear()
                            ) {
                                // 🔍 Obtener nombre del doctor
                                let nombreDoctor = "";
                                try {
                                    const docRef = doc(db, "Tipo_de_usuario", turno.doctorUid);
                                    const doctorSnap = await getDoc(docRef);
                                    if (doctorSnap.exists()) {
                                        nombreDoctor = doctorSnap.data().nombre || "";
                                    }
                                } catch (e) {
                                    console.warn("No se pudo obtener el nombre del doctor", e);
                                }

                                this.diasConTurnos.push({
                                    dia: fecha.getDate(),
                                    turnos: [{
                                        inicio: turno.inicio,
                                        fin: turno.fin,
                                        doctor: nombreDoctor
                                    }]
                                });
                            }
                        }
                    }
                }

            } catch (error) {
                console.error("Error al obtener turnos:", error);
            } finally {
                this.cargando = false;
            }
        },

        async eliminarTurnoIndividual(turno) {
            const fecha = this.fechaSeleccionada;
            const pacienteUid = turno.pacienteUid;

            const confirm = await swal.fire({
                title: '¿Eliminar turno?',
                text: 'Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
            });

            if (!confirm.isConfirmed) return;

            this.cargando = true;

            try {
                // 🔥 Eliminar el documento del turno del doctor completamente
                const refDoctor = doc(db, "doctores", auth.currentUser.uid, "turnos", `${fecha}_${pacienteUid}`);
                await deleteDoc(refDoctor); // ✅ Eliminación total

                // 🔥 Eliminar el turno del array en el documento del paciente
                const refPaciente = doc(db, "Tipo_de_usuario", pacienteUid);
                const docSnap = await getDoc(refPaciente);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const nuevosTurnos = (data.turnos || []).filter(
                        t => t.fecha !== fecha || t.doctorUid !== auth.currentUser.uid
                    );
                    await setDoc(refPaciente, { ...data, turnos: nuevosTurnos }, { merge: true });
                }

                // ✅ Actualizar la interfaz
                this.turnoSeleccionado = this.turnoSeleccionado.filter(t => t.pacienteUid !== pacienteUid);
                await swal.fire('Eliminado', 'El turno fue eliminado.', 'success');

                // Cerrar panel si no quedan turnos
                if (this.turnoSeleccionado.length === 0) {
                    this.turnoSeleccionado = null;
                    this.fechaSeleccionada = null;
                }

                // Refrescar días con turnos
                this.obtenerDiasConTurnos();

            } catch (error) {
                console.error(error);
                await swal.fire('Error', 'No se pudo eliminar el turno.', 'error');
            } finally {
                this.cargando = false;
            }
        },

        seleccionarDia(dia) {
            const fecha = this.formatFecha(this.añoActual, this.fechaActual.getMonth(), dia);

            if (this.fechaSeleccionada === fecha) {
                this.fechaSeleccionada = null;
                this.turnoSeleccionado = null;
                return;
            }

            this.fechaSeleccionada = fecha;

            const entry = this.diasConTurnos.find(t => t.dia === dia);
            this.turnoSeleccionado = entry ? entry.turnos : null;
        },

        getPacienteDelDia(dia) {
            const entry = this.diasConTurnos.find(t => t.dia === dia);
            if (!entry || !entry.turnos || entry.turnos.length === 0) return null;

            if (this.tipoUsuario === "doctor") {
                return entry.turnos.map(t => t.paciente).join("\n");
            } else if (this.tipoUsuario === "paciente") {
                return entry.turnos.map(t => `Dr. ${t.doctor}`).join("\n");
            }

            return null;
        },

        formatHora(hora) {
            if (!hora) return "";
            const [h, m] = hora.split(":").map(Number);
            const date = new Date();
            date.setHours(h, m);
            return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: true });
        },
    },
    mounted() {
        this.cargarUsuario().then(() => {
            this.obtenerDiasConTurnos();
        });
        this.esMobile = window.innerWidth < 768;
    }
};
</script>

<style scoped>
@media (min-width: 768px) {
    .max-w-md {
        max-width: 768px;
    }

    input,
    .input-box {
        height: 48px;
        font-size: 1rem;
    }
}
</style>
