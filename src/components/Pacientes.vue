<template>
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-6xl mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-teal-300">Mis Pacientes</h1>
            <router-link to="/crear-paciente"
                class="bg-teal-300 text-white px-4 py-2 rounded-xl hover:bg-teal-500 transition flex items-center gap-2">
                <span class="text-xl">+</span>
                <span class="hidden md:inline">Agregar paciente</span>
            </router-link>
        </div>

        <div v-if="cargando" class="text-gray-400 text-center">Cargando pacientes...</div>
        <div v-else-if="pacientes.length === 0" class="text-gray-500 text-center">
            No hay pacientes cargados.
        </div>

        <div v-else class="grid gap-6 md:grid-cols-2">
            <div v-for="paciente in pacientes" :key="paciente.id"
                class="bg-white border-l-4 border-teal-300 rounded-xl p-5 shadow transition hover:shadow-lg hover:scale-[1.01] duration-200">

                <h2 class="text-xl font-bold text-teal-400">
                    {{ paciente.nombre }} {{ paciente.apellido }}
                </h2>

                <div class="text-gray-700 mt-2 space-y-1">
                    <p><strong>DNI:</strong> {{ paciente.dni }}</p>
                    <p><strong>Edad:</strong> {{ paciente.edad }} años</p>
                    <p><strong>Sexo:</strong> {{ paciente.sexo }}</p>
                    <p><strong>Condición:</strong> {{ paciente.condicion }}</p>
                    <p><strong>Centro médico:</strong> {{ paciente.centro }}</p>
                    <p><strong>Contacto:</strong> {{ paciente.contacto }}</p>
                    <p><strong>Anotaciones:</strong><br><span class="whitespace-pre-wrap">{{ paciente.anotaciones
                            }}</span></p>
                </div>

                <div class="text-xs text-gray-400 mt-4 space-y-1">
                    <p><i class="fa-solid fa-calendar mr-1"></i> Creado: {{ formatearFecha(paciente.creado) }}</p>
                    <p><i class="fa-solid fa-pen mr-1"></i> Modificado: {{ formatearFecha(paciente.modificado) }}</p>
                </div>

                <div class="mt-4 flex justify-end space-x-2">
                    <router-link :to="`/editar-paciente/${paciente.id}`"
                        class="text-sm text-white bg-teal-500 hover:bg-teal-600 px-3 py-1 rounded-xl transition">
                        <i class="fa-solid fa-pen mr-1"></i>Editar
                    </router-link>
                    <button @click="eliminarPaciente(paciente.id)"
                        class="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-xl transition">
                        <i class="fa-solid fa-trash mr-1"></i>Eliminar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { doc, deleteDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '../firebase'
import Swal from 'sweetalert2'

const pacientes = ref([])
const cargando = ref(true)
const auth = getAuth()

let unsubscribe = null

onAuthStateChanged(auth, (user) => {
    cargando.value = true
    if (unsubscribe) unsubscribe()

    if (user) {
        const q = query(
            collection(db, 'pacientes'),
            where('uid', '==', user.uid),
            orderBy('creado', 'desc')
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
            pacientes.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            cargando.value = false
        }, (error) => {
            console.error('Error al obtener pacientes:', error)
            cargando.value = false
        })
    } else {
        pacientes.value = []
        cargando.value = false
    }
})

const eliminarPaciente = async (id) => {
    const confirmacion = await Swal.fire({
        title: '¿Eliminar paciente?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e3342f',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    })

    if (confirmacion.isConfirmed) {
        try {
            await deleteDoc(doc(db, 'pacientes', id))
            Swal.fire({
                title: 'Eliminado',
                text: 'El paciente fue eliminado correctamente.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            })
        } catch (error) {
            console.error('Error al eliminar paciente:', error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el paciente.',
                icon: 'error',
                confirmButtonColor: '#e3342f'
            })
        }
    }
}

const formatearFecha = (fecha) => {
    if (!fecha) return ''
    const date = fecha.toDate()
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}
</script>
