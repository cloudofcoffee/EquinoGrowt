<template>
    <div class="relative bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl mx-auto">
        <!-- Loader -->
        <div v-if="cargando"
            class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
            <Loader />
        </div>

        <h2 class="text-2xl font-bold mb-4 text-center text-teal-300">Agregar nuevo paciente</h2>

        <form @submit.prevent="guardarPaciente" :class="{ 'opacity-50 pointer-events-none': cargando }">
            <div class="grid gap-4 md:grid-cols-2">
                <div>
                    <label class="block text-gray-700 font-medium mb-1">Nombre y Apellido</label>
                    <input v-model="nombre" type="text" required
                        class="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                </div>

                <div>
                    <label class="block text-gray-700 font-medium mb-1">DNI</label>
                    <input v-model="dni" type="text" required
                        class="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                </div>

                <div>
                    <label class="block text-gray-700 font-medium mb-1">Edad</label>
                    <input v-model="edad" type="number" min="0" required
                        class="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                </div>

                <div>
                    <label class="block text-gray-700 font-medium mb-1">Sexo</label>
                    <select v-model="sexo"
                        class="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
                        required>
                        <option disabled value="">Seleccione una opción</option>
                        <option>Masculino</option>
                        <option>Femenino</option>
                        <option>Otro</option>
                    </select>
                </div>

                <div>
                    <label class="block text-gray-700 font-medium mb-1">Centro Médico</label>
                    <input v-model="centro" type="text" required
                        class="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                </div>

                <div>
                    <label class="block text-gray-700 font-medium mb-1">Condición</label>
                    <input v-model="condicion" type="text" required
                        class="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                </div>

                <div class="md:col-span-2">
                    <label class="block text-gray-700 font-medium mb-1">Contacto</label>
                    <input v-model="contacto" type="text" required
                        class="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                </div>

                <div class="md:col-span-2">
                    <label class="block text-gray-700 font-medium mb-1">Anotaciones</label>
                    <textarea v-model="anotaciones" rows="4"
                        class="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-300"
                        placeholder="Observaciones importantes..."></textarea>
                </div>
            </div>

            <button type="submit"
                class="mt-6 w-full bg-teal-300 hover:bg-teal-400 text-white font-semibold py-2 rounded-xl transition"
                :disabled="cargando">
                Guardar paciente
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '../firebase'
import Swal from 'sweetalert2'
import Loader from '../components/Loader.vue'

// Campos del formulario
const nombre = ref('')
const dni = ref('')
const edad = ref('')
const sexo = ref('')
const centro = ref('')
const condicion = ref('')
const contacto = ref('')
const anotaciones = ref('')

const cargando = ref(false)
const router = useRouter()

const guardarPaciente = async () => {
    cargando.value = true
    const auth = getAuth()

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            cargando.value = false
            Swal.fire({
                icon: 'error',
                title: 'Usuario no autenticado',
                text: 'Inicia sesión para guardar un paciente.',
                confirmButtonColor: '#ed1c70',
            })
            return
        }

        try {
            const docRef = await addDoc(collection(db, 'pacientes'), {
                nombre: nombre.value,
                dni: dni.value,
                edad: edad.value,
                sexo: sexo.value,
                centro: centro.value,
                condicion: condicion.value,
                contacto: contacto.value,
                anotaciones: anotaciones.value,
                creado: serverTimestamp(),
                uid: user.uid
            })

            await updateDoc(docRef, {
                pacienteId: docRef.id
            })

            Swal.fire({
                icon: 'success',
                title: 'Paciente guardado',
                text: 'El paciente fue agregado correctamente.',
                confirmButtonColor: '#ed1c70',
            }).then(() => {
                router.push('/pacientes')
            })
        } catch (error) {
            console.error('Error al guardar paciente:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al guardar el paciente.',
                confirmButtonColor: '#ed1c70',
            })
        }
    })
}
</script>
