<template>
    <div v-if="cargando"
        class="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
        <Loader />
    </div>
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl mx-auto relative">
        <h2 class="text-2xl font-bold mb-4 text-center text-teal-300">Editar Paciente</h2>

        <form @submit.prevent="actualizarPaciente" v-if="pacienteCargado">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block font-medium mb-1">Nombre</label>
                    <input v-model="nombre" type="text" class="w-full border rounded-xl p-3" required />
                </div>
                <div>
                    <label class="block font-medium mb-1">DNI</label>
                    <input v-model="dni" type="text" class="w-full border rounded-xl p-3" required />
                </div>
                <div>
                    <label class="block font-medium mb-1">Edad</label>
                    <input v-model="edad" type="number" class="w-full border rounded-xl p-3" required />
                </div>
                <div>
                    <label class="block font-medium mb-1">Sexo</label>
                    <select v-model="sexo" class="w-full border rounded-xl p-3" required>
                        <option value="">Seleccionar</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
                <div>
                    <label class="block font-medium mb-1">Centro Médico</label>
                    <input v-model="centro" type="text" class="w-full border rounded-xl p-3" />
                </div>
                <div>
                    <label class="block font-medium mb-1">Condición</label>
                    <input v-model="condicion" type="text" class="w-full border rounded-xl p-3" />
                </div>
                <div class="md:col-span-2">
                    <label class="block font-medium mb-1">Contacto</label>
                    <input v-model="contacto" type="text" class="w-full border rounded-xl p-3" />
                </div>

                <div class="md:col-span-2">
                    <label class="block font-medium mb-1">Anotaciones</label>
                    <textarea v-model="anotaciones" class="w-full border rounded-xl p-3 h-32 resize-none"></textarea>
                </div>
            </div>

            <button type="submit"
                class="w-full bg-teal-300 hover:bg-teal-400 text-white font-semibold py-2 rounded-xl transition"
                :disabled="cargando">
                Actualizar paciente
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

const nombre = ref('')
const dni = ref('')
const edad = ref('')
const sexo = ref('')
const centro = ref('')
const contacto = ref('')
const condicion = ref('')
const anotaciones = ref('')

const cargando = ref(true)
const pacienteCargado = ref(false)

const obtenerPaciente = async () => {
    try {
        const docRef = doc(db, 'pacientes', route.params.id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const data = docSnap.data()
            nombre.value = data.nombre
            dni.value = data.dni
            edad.value = data.edad
            sexo.value = data.sexo
            centro.value = data.centro
            contacto.value = data.contacto
            condicion.value = data.condicion
            anotaciones.value = data.anotaciones
            pacienteCargado.value = true
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Paciente no encontrado',
                text: 'El paciente no existe.',
                confirmButtonColor: '#e3342f',
            })
            router.push('/')
        }
    } catch (error) {
        console.error('Error al obtener paciente:', error)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al obtener el paciente.',
            confirmButtonColor: '#e3342f',
        })
        router.push('/')
    } finally {
        cargando.value = false
    }
}

const actualizarPaciente = async () => {
    cargando.value = true
    try {
        const docRef = doc(db, 'pacientes', route.params.id)
        await updateDoc(docRef, {
            nombre: nombre.value,
            dni: dni.value,
            edad: edad.value,
            sexo: sexo.value,
            centro: centro.value,
            contacto: contacto.value,
            condicion: condicion.value,
            anotaciones: anotaciones.value,
            modificado: serverTimestamp()
        })

        Swal.fire({
            icon: 'success',
            title: 'Paciente actualizado',
            text: 'El paciente fue actualizado correctamente.',
            confirmButtonColor: '#10b981',
        }).then(() => {
            router.push('/')
        })
    } catch (error) {
        console.error('Error al actualizar paciente:', error)
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el paciente.',
            confirmButtonColor: '#e3342f',
        })
    } finally {
        cargando.value = false
    }
}

onMounted(() => {
    obtenerPaciente()
})
</script>
