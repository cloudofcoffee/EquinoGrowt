<template>
    <div class="relative bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl mx-auto">
        <!-- Loader superpuesto -->
        <div v-if="cargando"
            class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
            <Loader />
        </div>

        <h2 class="text-2xl font-bold mb-4 text-center text-teal-300">Crear nueva nota</h2>

        <form @submit.prevent="guardarNota" :class="{ 'opacity-50 pointer-events-none': cargando }">
            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-1">Paciente</label>
                <input type="text" v-model="titulo"
                    class="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" required />
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-1">Anotaciones</label>
                <textarea v-model="contenido"
                    class="w-full border rounded-xl p-3 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300"
                    required></textarea>
            </div>

            <button type="submit"
                class="w-full bg-teal-300 hover:bg-teal-400 text-white font-semibold py-2 rounded-xl transition"
                :disabled="cargando">
                Guardar nota
            </button>
        </form>
    </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '../firebase'
import Swal from 'sweetalert2'
import Loader from '../components/Loader.vue'

const titulo = ref('')
const contenido = ref('')
const cargando = ref(false)
const router = useRouter()

const guardarNota = async () => {
    cargando.value = true

    const auth = getAuth()

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            cargando.value = false
            Swal.fire({
                icon: 'error',
                title: 'Usuario no autenticado',
                text: 'Por favor, inicia sesión para guardar una nota.',
                confirmButtonColor: '#ed1c70',
            })
            return
        }

        try {
            await addDoc(collection(db, 'notas'), {
                titulo: titulo.value,
                contenido: contenido.value,
                creado: serverTimestamp(),
                modificado: serverTimestamp(),
                uid: user.uid
            })

            Swal.fire({
                icon: 'success',
                title: 'Nota guardada',
                text: 'Tu nota se ha guardado correctamente.',
                confirmButtonColor: '#ed1c70',
            }).then(() => {
                router.push('/notas') // Redireccionar a la vista de notas
            })
        } catch (error) {
            console.error('Error al guardar la nota:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al guardar la nota.',
                confirmButtonColor: '#ed1c70',
            })
        } finally {
            cargando.value = false
        }
    })
}
</script>
