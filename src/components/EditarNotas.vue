<template>
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold mb-4 text-center text-teal-300">Editar Nota</h2>

        <!-- Loader superpuesto -->
        <div v-if="cargando"
            class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
            <Loader />
        </div>

        <form @submit.prevent="actualizarNota" v-if="notaCargada">
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-1">Título</label>
                <input type="text" v-model="titulo"
                    class="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" required />
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-1">Contenido</label>
                <textarea v-model="contenido"
                    class="w-full border rounded-xl p-3 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300"
                    required></textarea>
            </div>

            <button type="submit"
                class="w-full bg-teal-300 hover:bg-teal-400 text-white font-semibold py-2 rounded-xl transition"
                :disabled="cargando">
                Actualizar nota
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import Swal from 'sweetalert2'
import Loader from '../components/Loader.vue'

const route = useRoute()
const router = useRouter()

const titulo = ref('')
const contenido = ref('')
const cargando = ref(true)
const notaCargada = ref(false)

const obtenerNota = async () => {
    try {
        const docRef = doc(db, 'notas', route.params.id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const data = docSnap.data()
            titulo.value = data.titulo
            contenido.value = data.contenido
            notaCargada.value = true
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Nota no encontrada',
                text: 'La nota no existe.',
                confirmButtonColor: '#ed1c70',
            })
            router.push('/notas')
        }
    } catch (error) {
        console.error('Error al obtener la nota:', error)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al obtener la nota.',
            confirmButtonColor: '#ed1c70',
        })
        router.push('/notas')
    } finally {
        cargando.value = false
    }
}

const actualizarNota = async () => {
    cargando.value = true
    try {
        const docRef = doc(db, 'notas', route.params.id)
        await updateDoc(docRef, {
            titulo: titulo.value,
            contenido: contenido.value,
            modificado: serverTimestamp()
        })

        Swal.fire({
            icon: 'success',
            title: 'Nota actualizada',
            text: 'La nota se actualizó correctamente.',
            confirmButtonColor: '#10b981',
        }).then(() => {
            router.push('/notas')
        })
    } catch (error) {
        console.error('Error al actualizar nota:', error)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la nota.',
            confirmButtonColor: '#ed1c70',
        })
    } finally {
        cargando.value = false
    }
}

onMounted(() => {
    obtenerNota()
})
</script>
