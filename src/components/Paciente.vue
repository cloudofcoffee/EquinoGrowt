<template>
    <div
        class="w-full max-w-4xl mx-auto px-4 py-8 bg-white rounded-xl shadow-lg text-[#146b60]p-8 break-words overflow-hidden">
        <!-- Loader -->
        <Loader v-if="loading" mini />

        <!-- Datos del Paciente -->
        <div v-else-if="paciente">
            <!-- Encabezado -->
            <div class="flex items-center justify-between mb-6">
                <router-link to="/" class="text-2xl text-[#146b60] hover:text-[#0d4c3f]">
                    <i class="fas fa-arrow-left"></i>
                </router-link>
                <span class="text-sm font-semibold text-gray-400">Ficha del paciente</span>
                <img :src="paciente.foto || '/img/default-user.jpg'"
                    class="w-10 h-10 rounded-full object-cover border-2 border-[#146b60]" />
            </div>
            <!-- Perfil -->
            <div class="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left mb-8">
                <img :src="paciente.foto || '/img/default-user.jpg'"
                    class="w-28 h-28 rounded-full object-cover border-4 border-[#146b60]" />
                <div>
                    <h2 class="text-3xl font-bold">{{ paciente.nombre }}</h2>
                    <p class="text-gray-600 mt-1">
                        {{ paciente.condicionMedica || 'Sin diagnóstico' }} •
                        {{ paciente.edad || '-' }} años •
                        {{ paciente.obraSocial || 'Sin obra social' }}
                    </p>
                    <p class="text-[#146b60] font-medium mt-1">
                        {{ paciente.turnoTexto || 'Sin turno asignado' }}
                    </p>
                </div>
            </div>

            <!-- Comportamiento -->
            <div v-if="paciente.comportamiento?.length" class="mb-6">
                <h3 class="font-bold text-lg mb-2">Comportamiento</h3>
                <div class="flex flex-wrap gap-2">
                    <span v-for="etiqueta in paciente.comportamiento" :key="etiqueta"
                        class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {{ etiqueta }}
                    </span>
                </div>
            </div>

            <!-- Información General -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Datos básicos -->
                <div class="bg-gray-100 p-4 rounded-xl w-full min-w-0">
                    <h4 class="font-semibold text-lg mb-3">Información general</h4>
                    <p><strong>Nombre y apellido:</strong> {{ paciente.nombreCompleto }}</p>
                    <p>
                        <strong class="block sm:inline">Fecha de nacimiento:</strong>
                        <span
                            class="inline-flex items-center gap-1 bg-[#dff5eb] text-[#146b60] px-3 py-1 rounded-full text-sm font-semibold shadow-sm mt-1 sm:mt-0">
                            <i class="fa-solid fa-cake-candles"></i>
                            {{ formatoFecha(paciente.fechaNacimiento, false) }}
                        </span>
                    </p>
                    <p><strong>Edad:</strong> {{ paciente.edad || '-' }} años</p>
                    <p><strong>DNI:</strong> {{ paciente.dni || '-' }}</p>
                    <p><strong>Contacto:</strong> {{ paciente.email || '-' }}</p>
                </div>

                <!-- Otros datos -->
                <div class="bg-gray-100 p-4 rounded-xl">
                    <h4 class="font-semibold text-lg mb-3">Otros</h4>
                    <p><strong>Telefono:</strong> {{ paciente.telefono || 'No cargado' }}</p>
                    <p><strong>Dirección:</strong> {{ paciente.direccion || 'No cargada' }}</p>
                    <p><strong>Cuenta:</strong> {{ paciente.acompanante || 'No especificado' }}</p>
                    <p><strong>Obra Social:</strong> {{ paciente.obraSocial || 'No especificada' }}</p>
                </div>
            </div>

            <!-- Notas -->
            <div class="mt-6 bg-gray-100 p-4 rounded-xl w-full">
                <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-1">
                    <h4 class="font-semibold text-lg text-[#146b60]">Notas del doctor</h4>
                    <span v-if="notas.length" class="text-sm text-gray-500">
                        Actualizado el {{ formatoFecha(notas[0].fecha) }}
                    </span>
                </div>

                <!-- Campo para nueva nota -->
                <div v-if="editandoNota" class="mb-3 bg-white p-3 rounded-lg border border-gray-300 shadow-sm">
                    <label class="block text-sm font-semibold text-gray-600 mb-1">Seguimiento del paciente</label>
                    <textarea v-model="notaEditada"
                        class="w-full p-2 rounded-md border border-[#146b60] focus:outline-none focus:ring-1 focus:ring-[#146b60] text-sm resize-y transition"
                        rows="4"
                        placeholder="Escriba una observación clínica, comportamiento o reflexión de la sesión..."></textarea>
                    <div class="flex justify-end mt-2 gap-2">
                        <button @click="guardarNota"
                            class="bg-[#146b60] text-white px-4 py-1.5 rounded-md hover:bg-[#0d4c3f] transition text-sm">
                            Guardar
                        </button>
                        <button @click="cancelarEdicion" class="text-sm text-gray-600 hover:text-[#146b60] transition">
                            Cancelar
                        </button>
                    </div>
                </div>

                <!-- Botón agregar -->
                <div v-else class="mb-4">
                    <button @click="editandoNota = true"
                        class="flex items-center gap-2 bg-[#146b60] hover:bg-[#0d4c3f] text-white text-sm px-4 py-2 rounded-md shadow transition duration-200">
                        <i class="fas fa-plus"></i>
                        Agregar nota
                    </button>
                </div>

                <!-- Loader -->
                <div v-if="guardandoNota" class="flex items-center justify-center py-4">
                    <Loader mini />
                </div>

                <!-- Lista de notas -->
                <div v-if="notas.length">
                    <div v-for="(nota, i) in notas" :key="i" class="border-t border-gray-300 pt-3 mt-3">
                        <p class="text-sm whitespace-pre-line text-gray-800">{{ nota.contenido }}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            — {{ nota.autor }}, {{ formatoFecha(nota.fecha) }}
                        </p>
                    </div>
                </div>
                <p v-else class="text-sm text-gray-500">Sin notas todavía.</p>
            </div>

            <!-- ============================= -->
            <!--  Formulario de exportar informe -->
            <!-- ============================= -->
            <div class="mt-6 bg-gray-100 p-4 rounded-xl w-full">
                <h4 class="font-semibold text-lg text-[#146b60] mb-4">Exportar Informe</h4>
                <div ref="reportForm" class="space-y-4">
                    <!-- 1. Periodo -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Desde:</label>
                            <input type="date" v-model="reportStart"
                                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60]" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Hasta:</label>
                            <input type="date" v-model="reportEnd"
                                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60]" />
                        </div>
                    </div>

                    <!-- 2. Datos clave -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <!-- Datos personales -->
                        <div class="col-span-2">
                            <h5 class="text-[#146b60] font-semibold mb-2 border-b pb-1">Datos personales</h5>
                        </div>

                        <div>
                            <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <i class="fas fa-user"></i> Nombre y apellido:
                            </label>
                            <input type="text" v-model="reportData.fullName"
                                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60]" />
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <i class="fas fa-id-card"></i> DNI:
                            </label>
                            <input type="text" v-model="reportData.dni"
                                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60]" />
                        </div>

                        <div>
                            <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <i class="fas fa-globe-americas"></i> Nacionalidad:
                            </label>
                            <input type="text" v-model="reportData.nationality"
                                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60]" />
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <i class="fas fa-calendar-day"></i> Inicio de tratamiento:
                            </label>
                            <input type="date" v-model="reportData.treatmentStart"
                                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60]" />
                        </div>

                        <!-- Tratamiento -->
                        <div class="col-span-2">
                            <h5 class="text-[#146b60] font-semibold mb-2 border-b pb-1 mt-4">Tratamiento</h5>
                        </div>

                        <div>
                            <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <i class="fas fa-horse-head"></i> Centro de Equinoterapia:
                            </label>
                            <input type="text" v-model="reportData.center"
                                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60]" />
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <i class="fas fa-notes-medical"></i> Diagnóstico:
                            </label>
                            <input type="text" v-model="reportData.diagnosis"
                                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60]" />
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <i class="fas fa-briefcase-medical"></i> Obra social:
                            </label>
                            <input type="text" v-model="reportData.socialSecurity"
                                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60]" />
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <i class="fas fa-user-md"></i> Médico de cabecera:
                            </label>
                            <input type="text" v-model="reportData.doctor"
                                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60]" />
                        </div>

                        <!-- Observaciones -->
                        <div class="md:col-span-2">
                            <label class="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <i class="fas fa-comment-dots"></i> Observaciones:
                            </label>
                            <textarea v-model="reportData.notes" rows="3"
                                class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60] resize-y"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex gap-3 mt-4">
                    <button @click="exportPDF"
                        class="bg-[#146b60] hover:bg-[#0d4c3f] text-white px-4 py-2 rounded-md shadow-sm transition">
                        Descargar PDF
                    </button>
                    <button @click="sendReport" :disabled="sendingReport"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition disabled:opacity-50">
                        {{ sendingReport ? 'Enviando…' : 'Enviar por mail' }}
                    </button>
                </div>
            </div>

            <!-- VISTA OCULTA SOLO PARA EXPORTAR PDF -->
            <div ref="reportExport"
                class="hidden text-black bg-white p-10 rounded-xl w-full max-w-[800px] mx-auto border border-gray-300 shadow-md font-sans">

                <!-- Logo y encabezado -->
                <div class="flex items-center justify-between mb-8 border-b-2 border-[#cdeee2] pb-4">
                    <img src="/img/EquinoGrowt_logo.png" alt="EquinoGrowt" class="h-14" />
                    <div class="text-right">
                        <h2 class="text-3xl font-bold text-[#146b60]">Informe de Seguimiento</h2>
                        <p class="text-sm text-gray-600 mt-1">Desde {{ reportStart }} hasta {{ reportEnd }}</p>
                    </div>
                </div>

                <!-- Datos del paciente -->
                <div class="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
                    <div><span class="font-semibold text-[#146b60]">Nombre y apellido:</span> {{ reportData.fullName }}
                    </div>
                    <div><span class="font-semibold text-[#146b60]">DNI:</span> {{ reportData.dni }}</div>
                    <div><span class="font-semibold text-[#146b60]">Nacionalidad:</span> {{ reportData.nationality }}
                    </div>
                    <div><span class="font-semibold text-[#146b60]">Inicio de tratamiento:</span> {{
                        reportData.treatmentStart }}</div>
                    <div class="sm:col-span-2"><span class="font-semibold text-[#146b60]">Centro de
                            Equinoterapia:</span> {{ reportData.center }}</div>
                    <div class="sm:col-span-2"><span class="font-semibold text-[#146b60]">Diagnóstico:</span> {{
                        reportData.diagnosis }}</div>
                    <div><span class="font-semibold text-[#146b60]">Obra social:</span> {{ reportData.socialSecurity }}
                    </div>
                    <div><span class="font-semibold text-[#146b60]">Médico de cabecera:</span> {{ reportData.doctor }}
                    </div>
                </div>

                <!-- Observaciones -->
                <div class="bg-[#f8fdfa] border border-[#cdeee2] rounded-lg p-5">
                    <h3 class="text-lg font-semibold text-[#146b60] mb-2">Observaciones</h3>
                    <p class="whitespace-pre-line text-gray-700 text-sm leading-relaxed">
                        {{ reportData.notes || 'Sin observaciones adicionales.' }}
                    </p>
                </div>

                <!-- Footer -->
                <div class="mt-10 text-right text-xs text-gray-500 border-t pt-3">
                    <p>Generado automáticamente por EquinoGrowt</p>
                    <p>{{ new Date().toLocaleDateString('es-AR') }}</p>
                </div>
            </div>
        </div>

        <!-- Error -->
        <div v-else class="text-center text-red-500">Paciente no encontrado.</div>
    </div>
</template>

<script>
import { doc, getDoc, collection, addDoc, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { getAuth } from "firebase/auth";
import Loader from "../components/Loader.vue";
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import axios from 'axios';

export default {
    components: {
        Loader,
    },
    data() {
        return {
            paciente: null,
            loading: true,
            notas: [],
            notaEditada: '',
            editandoNota: false,
            guardandoNota: false,
            reportStart: '',      // fecha desde
            reportEnd: '',        // fecha hasta
            sendingReport: false, // loader para envío
            reportData: {
                fullName: '',
                dni: '',
                nationality: '',
                treatmentStart: '',
                center: '',
                diagnosis: '',
                socialSecurity: '',
                doctor: '',
                notes: '',
            },
        };
    },
    methods: {
        formatoFecha(fecha, mostrarHora = true) {
            if (!fecha) return "No cargada";

            if (typeof fecha === 'object' && typeof fecha.toDate === 'function') {
                fecha = fecha.toDate();
            }

            // Si viene como string (por ejemplo, "2025-06-24"), agregar hora para evitar desfase
            if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
                fecha = new Date(`${fecha}T12:00:00`); // ← Agrega hora del mediodía
            } else {
                fecha = new Date(fecha);
            }

            if (isNaN(fecha)) return "Fecha inválida";

            return fecha.toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                ...(mostrarHora && {
                    hour: "2-digit",
                    minute: "2-digit"
                }),
            });
        },

        esNotaReciente(fecha) {
            if (!fecha) return false;

            if (typeof fecha === 'object' && typeof fecha.toDate === 'function') {
                fecha = fecha.toDate();
            }

            const ahora = new Date();
            const diferenciaMs = ahora - new Date(fecha);
            const horas = diferenciaMs / (1000 * 60 * 60);
            return horas <= 24;
        },

        buscarTurnoAsignado(turnos, pacienteId) {
            for (const [fecha, pacientes] of Object.entries(turnos)) {
                if (pacientes[pacienteId]) {
                    return {
                        fecha,
                        horario: pacientes[pacienteId].horario,
                    };
                }
            }
            return null;
        },

        cancelarEdicion() {
            this.notaEditada = this.paciente.ultimaNota || '';
            this.editandoNota = false;
        },

        async guardarNota() {
            const idPaciente = this.$route.params.id;
            const auth = getAuth();
            const user = auth.currentUser;

            if (!this.notaEditada.trim()) return;

            this.guardandoNota = true; // ← loader parcial ON

            const nuevaNota = {
                contenido: this.notaEditada,
                fecha: new Date(),
                autor: this.paciente.nombreDoctor || user.displayName || 'Desconocido'
            };

            try {
                await addDoc(collection(db, "notas", idPaciente, "items"), nuevaNota);
                this.notas.unshift(nuevaNota);
                this.notaEditada = '';
                this.editandoNota = false;
            } catch (e) {
                console.error("Error al guardar la nota:", e);
                alert("No se pudo guardar la nota.");
            } finally {
                this.guardandoNota = false; // ← loader parcial OFF
            }
        },

        async exportPDF() {
            if (!this.reportStart || !this.reportEnd || !this.reportData.fullName || !this.reportData.dni) {
                return alert('Completa todos los campos obligatorios.');
            }

            const element = this.$refs.reportExport;

            try {
                // Mostramos temporalmente el contenido oculto para capturarlo
                element.classList.remove('hidden');

                const canvas = await html2canvas(element, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth() - 20;
                const props = pdf.getImageProperties(imgData);
                const pageHeight = (props.height * pageWidth) / props.width;

                pdf.addImage(imgData, 'PNG', 10, 10, pageWidth, pageHeight);
                pdf.save(`informe_${this.reportData.fullName.replace(/ /g, '_')}_${this.reportStart}.pdf`);
            } catch (err) {
                console.error(err);
                alert('Error al generar el PDF.');
            } finally {
                // Ocultamos nuevamente la sección
                element.classList.add('hidden');
            }
        },

        async sendReport() {
            // Validar fechas y datos clave como arriba…
            if (!this.reportStart || !this.reportEnd || !this.reportData.fullName) {
                return alert('Completa fechas y nombre del paciente.');
            }
            this.sendingReport = true;
            try {
                // Armamos un payload con todo junto
                await axios.post('/api/reports', {
                    startDate: this.reportStart,
                    endDate: this.reportEnd,
                    recipientEmail: this.paciente.email,
                    recipientType: 'patient',
                    reportDetails: this.reportData,   // <-- aquí van tus campos
                });
                alert('Informe enviado por correo correctamente.');
            } catch (err) {
                console.error(err);
                alert('Error al enviar el informe.');
            } finally {
                this.sendingReport = false;
            }
        },
    },
    async mounted() {
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        this.reportStart = lastWeek.toISOString().substr(0, 10);
        this.reportEnd = today.toISOString().substr(0, 10);

        const idPaciente = this.$route.params.id;
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        try {
            // Obtener datos del paciente
            const refPaciente = doc(db, "Tipo_de_usuario", idPaciente);
            const snapPaciente = await getDoc(refPaciente);

            if (!snapPaciente.exists()) {
                this.paciente = null;
                return;
            }

            const pacienteData = snapPaciente.data();

            // Inicializar campo editable con la nota actual
            this.notaEditada = pacienteData.ultimaNota || '';

            // Obtener los turnos del doctor actual
            const refDoctor = doc(db, "doctores", user.uid);
            const snapDoctor = await getDoc(refDoctor);

            let turnoAsignado = null;
            if (snapDoctor.exists()) {
                const turnos = snapDoctor.data().turnos || {};
                turnoAsignado = this.buscarTurnoAsignado(turnos, idPaciente);
            }

            // Asignar datos completos al paciente
            this.paciente = {
                ...pacienteData,
                turnoTexto: turnoAsignado
                    ? `Turno asignado el ${this.formatoFecha(turnoAsignado.fecha, false)}`
                    : "Sin turno asignado",
                foto: pacienteData.photoURL || null,
            };
            // Asignar datos completos al paciente para informe
            this.reportData = {
                fullName: this.paciente.nombreCompleto || '',
                dni: this.paciente.dni || '',
                nationality: this.paciente.nacionalidad || '',
                treatmentStart: '',
                center: this.paciente.centro || '',
                diagnosis: this.paciente.condicionMedica || '',
                socialSecurity: this.paciente.obraSocial || '',
                doctor: this.paciente.medicoCabecera || '',
                notes: '',
            };
            // Cargar las notas del paciente (subcolección)
            const notasRef = collection(db, "notas", idPaciente, "items");
            const q = query(notasRef, orderBy("fecha", "desc"));
            const notasSnap = await getDocs(q);

            this.notas = notasSnap.docs.map(doc => doc.data());
            this.notaEditada = '';
        } catch (e) {
            console.error("Error al cargar paciente:", e);
            this.paciente = null;
        } finally {
            this.loading = false;
        }
    },
};
</script>