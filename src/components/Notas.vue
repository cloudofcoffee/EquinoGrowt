<template>
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-teal-300">Mis Notas</h1>
            <router-link to="/crear-nota"
                class="bg-teal-300 text-white px-4 py-2 rounded-xl hover:bg-teal-500 transition">
                + Crear nota
            </router-link>
        </div>

        <div v-if="cargando" class="text-gray-400 text-center">Cargando notas...</div>
        <div v-else-if="notas.length === 0" class="text-gray-500 text-center">
            No hay notas por el momento.
        </div>

        <div v-else class="grid gap-6 md:grid-cols-2">
            <div v-for="nota in notas" :key="nota.id"
                class="bg-white border-l-4 border-teal-300 rounded-xl p-5 shadow transition hover:shadow-lg hover:scale-[1.01] duration-200">
                <h2 class="text-xl font-bold text-teal-400">{{ nota.titulo }}</h2>
                <p class="text-gray-600 mt-2 whitespace-pre-wrap">{{ nota.contenido }}</p>

                <div class="text-xs text-gray-400 mt-4 space-y-1">
                    <p><i class="fa-solid fa-calendar mr-1"></i> Creado: {{ formatearFecha(nota.creado) }}</p>
                    <p><i class="fa-solid fa-pen mr-1"></i> Modificado: {{ formatearFecha(nota.modificado) }}</p>
                </div>

                <!-- Botones de acciones -->
                <div class="mt-4 flex justify-end space-x-2">
                    <router-link :to="`/editar-nota/${nota.id}`"
                        class="text-sm text-white bg-teal-500 hover:bg-teal-600 px-3 py-1 rounded-xl transition">
                        <i class="fa-solid fa-pen mr-1"></i>Editar
                    </router-link>
                    <button @click="eliminarNota(nota.id)"
                        class="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-xl transition">
                        <i class="fa-solid fa-trash mr-1"></i>Eliminar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { doc, deleteDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '../firebase'
import Swal from 'sweetalert2'

const notas = ref([])
const cargando = ref(true)

const auth = getAuth()

let unsubscribe = null // para detener el listener si cambia el usuario

onAuthStateChanged(auth, (user) => {
    cargando.value = true
    if (unsubscribe) unsubscribe() // Detener escucha anterior si había

    if (user) {
        const q = query(
            collection(db, 'notas'),
            where('uid', '==', user.uid),
            orderBy('creado', 'desc')
        )

        unsubscribe = onSnapshot(q, (snapshot) => {
            notas.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            cargando.value = false
        }, (error) => {
            console.error('Error al obtener las notas:', error)
            cargando.value = false
        })
    } else {
        notas.value = []
        cargando.value = false
    }
})

const eliminarNota = async (id) => {
    const confirmacion = await Swal.fire({
        title: '¿Eliminar nota?',
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
            await deleteDoc(doc(db, 'notas', id))
            Swal.fire({
                title: 'Eliminada',
                text: 'La nota fue eliminada correctamente.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            })
        } catch (error) {
            console.error('Error al eliminar nota:', error)
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la nota.',
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
