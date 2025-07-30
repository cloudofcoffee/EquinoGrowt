<template>
    <h1 class="text-2xl sm:text-3xl font-bold text-[#146b60] mb-6 text-center sm:text-left">
        Panel de Administración
    </h1>

    <Loader v-if="cargandoUsuarios" />

    <div v-else>
        <!-- Estadísticas principales -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <!-- Card estadística -->
            <div class="bg-white border border-gray-200 rounded-2xl shadow p-5 flex items-center gap-4">
                <i class="fas fa-users text-3xl text-[#146b60]"></i>
                <div>
                    <p class="text-sm text-gray-500">Total de usuarios</p>
                    <h2 class="text-2xl font-bold text-[#146b60]">{{ totalUsuarios }}</h2>
                </div>
            </div>

            <div class="bg-white border border-gray-200 rounded-2xl shadow p-5 flex items-center gap-4">
                <i class="fas fa-user-injured text-3xl text-[#146b60]"></i>
                <div>
                    <p class="text-sm text-gray-500">Pacientes activos</p>
                    <h2 class="text-2xl font-bold text-[#146b60]">{{ pacientesActivos }}</h2>
                </div>
            </div>

            <div class="bg-white border border-gray-200 rounded-2xl shadow p-5 flex items-center gap-4">
                <i class="fas fa-user-md text-3xl text-[#146b60]"></i>
                <div>
                    <p class="text-sm text-gray-500">Doctores registrados</p>
                    <h2 class="text-2xl font-bold text-[#146b60]">{{ doctoresRegistrados }}</h2>
                </div>
            </div>
        </div>

        <!-- Estado de perfiles -->
        <div class="bg-white border border-gray-200 rounded-2xl shadow p-6 mb-10">
            <h2 class="text-xl sm:text-2xl font-semibold text-[#146b60] mb-4 text-center sm:text-left">
                Estado de los perfiles
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center sm:text-left">
                    <p class="text-sm text-gray-600">Perfiles incompletos</p>
                    <h3 class="text-2xl font-bold text-red-600">{{ perfilesIncompletos }}</h3>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center sm:text-left">
                    <p class="text-sm text-gray-600">Perfiles completos</p>
                    <h3 class="text-2xl font-bold text-green-600">{{ perfilesCompletos }}</h3>
                </div>
            </div>
        </div>

        <!-- Sección de validación de doctores -->
        <Loader v-if="cargandoAccionDoctor"
            class="absolute inset-0 z-10 bg-white/80 flex items-center justify-center rounded-2xl" />
        <div class="mt-10 bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
            <h2
                class="text-md md:text-2xl font-bold text-[#146b60] mb-6 flex items-center gap-2 justify-center md:justify-start">
                <i class="fas fa-user-clock text-[#146b60] text-md md:text-xl"></i>
                Doctores pendientes
            </h2>

            <div v-if="doctoresPendientes.length" class="space-y-6">
                <div v-for="doctor in doctoresPendientes" :key="doctor.id"
                    class="bg-[#f9fdfc] border border-[#e0f0ec] rounded-2xl p-5 flex flex-col sm:flex-row md:items-start items-center gap-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <!-- Foto -->
                    <img :src="doctor.photoURL" alt="foto"
                        class="w-32 h-32 object-cover rounded-full border-2 border-[#146b60] mx-auto sm:mx-0" />

                    <!-- Info y botones -->
                    <div class="flex flex-col gap-3 w-full">
                        <!-- Info -->
                        <div class="text-sm text-gray-700">
                            <p class="font-semibold text-lg text-[#146b60] text-center sm:text-left">
                                {{ doctor.nombreCompleto }}
                            </p>
                            <p class="md:mb-0 mb-2"><strong>Nombre:</strong> <br class="inline md:hidden">{{
                                doctor.nombre }}</p>
                            <p class="md:mb-0 mb-2"><strong>Email:</strong> {{ doctor.email }}</p>
                            <a :href="doctor.tituloDoctorURL" target="_blank"
                                class="text-[#146b60] underline hover:text-[#0e4b44] block mt-1">
                                Ver título profesional
                            </a>
                        </div>

                        <!-- Botones -->
                        <div class="flex flex-col sm:flex-row gap-3 w-full">
                            <button @click="aceptarDoctor(doctor)"
                                class="bg-[#146b60] hover:bg-[#0e4b44] text-white px-5 py-2 rounded-xl font-medium w-full sm:w-auto">
                                Aceptar
                            </button>
                            <button @click="rechazarDoctor(doctor)"
                                class="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-medium w-full sm:w-auto">
                                Rechazar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <p v-else class="text-gray-500 text-center text-sm">
                No hay solicitudes pendientes.
            </p>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore'
import Loader from '../components/Loader.vue'
import Swal from 'sweetalert2'

const usuarios = ref([])
const totalUsuarios = ref(0)
const pacientesActivos = ref(0)
const doctoresRegistrados = ref(0)
const perfilesCompletos = ref(0)
const perfilesIncompletos = ref(0)
const doctoresPendientes = ref([])
const cargandoUsuarios = ref(true)
const cargandoAccionDoctor = ref(false)

const camposObligatorios = ['dni', 'email', 'fechaNacimiento', 'nombre', 'nombreCompleto', 'nacionalidad', 'photoURL']

onMounted(async () => {
    cargandoUsuarios.value = true
    try {
        const usuariosSnap = await getDocs(collection(db, 'Tipo_de_usuario'))
        usuarios.value = usuariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        totalUsuarios.value = usuarios.value.length
        pacientesActivos.value = usuarios.value.filter(u => u.tipo === 'paciente').length
        doctoresRegistrados.value = usuarios.value.filter(u => u.tipo === 'doctor').length

        perfilesIncompletos.value = usuarios.value.filter(u => Object.keys(u).length < 10).length
        perfilesCompletos.value = totalUsuarios.value - perfilesIncompletos.value

        doctoresPendientes.value = usuarios.value.filter(u => u.tipo === 'pendiente' && u.solicitudDoctor)
    } catch (e) {
        console.error('Error al cargar usuarios:', e)
    } finally {
        cargandoUsuarios.value = false
    }
})

const aceptarDoctor = async (doctor) => {
    const result = await Swal.fire({
        title: '¿Aceptar solicitud?',
        text: `¿Estás seguro de aceptar a ${doctor.nombre} como doctor?`,
        icon: 'question',
        showCancelButton: true,
        buttonsStyling: false,
        customClass: {
            confirmButton: 'bg-[#146b60] hover:bg-[#0e574e] text-white px-4 py-2 rounded-md ml-2',
            cancelButton: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md',
            actions: 'flex justify-end gap-4 mt-4',
            popup: 'rounded-xl p-6',
        },
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
        cargandoAccionDoctor.value = true
        try {
            await updateDoc(doc(db, 'Tipo_de_usuario', doctor.id), { tipo: 'doctor' })
            doctoresPendientes.value = doctoresPendientes.value.filter(d => d.id !== doctor.id)
            Swal.fire({
                icon: 'success',
                title: 'Aceptado',
                text: `El doctor fue aprobado correctamente.`,
                timerProgressBar: true,
                timer: 2500,
                showConfirmButton: false
            });
            // Crear notificación de aceptación
            await addDoc(collection(db, 'notificaciones'), {
                usuarioId: doctor.uid,
                titulo: 'Solicitud aceptada',
                mensaje: 'Tu solicitud para ser doctor fue aceptada. Ya puedes acceder con privilegios de doctor.',
                tipo: 'validación doctor',
                leida: false,
                fecha: serverTimestamp()
            })
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `No se pudo aprobar al doctor.`,
                timerProgressBar: true,
                timer: 3500,
                showConfirmButton: false
            });
            console.error(error)
        }
    }
}

const rechazarDoctor = async (doctor) => {
    const result = await Swal.fire({
        title: '¿Rechazar solicitud?',
        text: `¿Estás seguro de rechazar a ${doctor.nombre}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Rechazar',
        cancelButtonText: 'Cancelar',
        buttonsStyling: false,
        customClass: {
            confirmButton: 'bg-[#146b60] hover:bg-[#0e574e] text-white px-4 py-2 rounded-md ml-2',
            cancelButton: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md',
            actions: 'flex justify-end gap-4 mt-4',
            popup: 'rounded-xl p-6',
        }
    })

    if (result.isConfirmed) {
        cargandoAccionDoctor.value = true
        try {
            await updateDoc(doc(db, 'Tipo_de_usuario', doctor.id), {
                tipo: 'rechazado',
            })
            doctoresPendientes.value = doctoresPendientes.value.filter(d => d.id !== doctor.id)
            Swal.fire({
                icon: 'success',
                title: 'Rechazado',
                text: `El doctor fue rechazado correctamente.`,
                timerProgressBar: true,
                timer: 2500,
                showConfirmButton: false
            });
            // Crear notificación de rechazo
            await addDoc(collection(db, 'notificaciones'), {
                usuarioId: doctor.uid,
                titulo: 'Solicitud rechazada',
                mensaje: 'Lamentablemente, tu solicitud para ser doctor fue rechazada. Si crees que es un error, contáctanos.',
                tipo: 'validación doctor',
                leida: false,
                fecha: serverTimestamp()
            })
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `No se pudo rechazar al doctor.`,
                timerProgressBar: true,
                timer: 3500,
                showConfirmButton: false
            });
            console.error(error)
        }
    }
}
</script>
