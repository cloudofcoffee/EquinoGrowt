<template>
  <div class="w-full h-full p-6 bg-white rounded-xl shadow-lg relative">
    <Loader v-if="loading" mini />
    <!-- Vista Doctor -->
    <div v-else-if="tipo === 'doctor'">
      <Loader v-if="accionando"
        class="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-2xl" />
      <!-- Encabezado -->
      <div class="mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-[#146b60]">Hola Dr. {{ nombre }}</h2>
            <p class="text-gray-500">{{ fechaActual }}</p>
          </div>
          <img :src="foto" alt="Foto perfil" class="w-12 h-12 rounded-full object-cover border-2 border-[#146b60]" />
        </div>
      </div>

      <!-- Calendario -->
      <div
        class="flex md:justify-between items-center overflow-x-auto md:overflow-visible w-full mb-6 gap-3 px-1 scrollbar-hide">
        <div v-for="(dia, index) in diasCalendario" :key="index" @click="diaSeleccionado = dia.fecha"
          class="flex flex-col items-center px-4 py-3 rounded-xl cursor-pointer min-w-[72px] shrink-0 md:flex-1 md:min-w-0 transition-all duration-200"
          :class="dia.fecha === diaSeleccionado ? 'bg-[#146b60] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
          <span class="text-sm font-medium mb-1">{{ dia.diaSemana }}</span>
          <span class="text-xl font-bold">{{ dia.diaNumero }}</span>
        </div>
      </div>

      <!-- Subtítulo -->
      <div class="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h3 class="text-lg font-semibold text-[#146b60]">Pacientes</h3>
          <p class="text-sm text-gray-500">
            Tienes {{ turnosDelDia.length }} {{ turnosDelDia.length === 1 ? 'sesión' : 'sesiones' }} hoy
          </p>
        </div>
        <button @click="abrirModal"
          class="bg-[#146b60] text-white px-4 py-2 rounded-lg hover:bg-[#0f5246] w-full sm:w-auto">
          + Agregar paciente
        </button>
      </div>

      <!-- Lista de Pacientes -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="paciente in pacientesDelDia" :key="paciente.id"
          class="relative bg-white border-2 border-gray-200 rounded-xl p-4 flex items-start gap-4 shadow hover:border-teal-200 hover:shadow-lg transition cursor-pointer"
          @click="$router.push({ name: 'Paciente', params: { id: paciente.id } })">
          <!-- Imagen -->
          <img :src="paciente.foto || '/img/default-user.jpg'"
            class="w-12 h-12 rounded-full object-cover border-2 border-[#146b60]" alt="Foto paciente" />

          <!-- Info -->
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <h4 class="font-bold text-lg text-[#146b60]">{{ paciente.nombre }}</h4>

              <!-- Checkbox (arriba a la derecha, independiente del click general) -->
              <div @click.stop>
                <input type="checkbox" :checked="!!turnos[diaSeleccionado]?.[paciente.id]"
                  @change="marcarTurno(paciente.id)" class="form-checkbox w-5 h-5 accent-[#146b60]" />
              </div>
            </div>

            <p class="text-sm text-gray-600">Edad: {{ paciente.edad }} años</p>
            <p class="text-sm text-gray-600">Diagnóstico: {{ paciente.condicionMedica || 'No especificado' }}</p>
            <p class="text-sm text-gray-600">Cuenta: {{ paciente.acompanante || 'No especificado' }}</p>
            <p class="mt-2 text-sm font-medium text-black">
              {{ turnos[diaSeleccionado]?.[paciente.id]?.horario ? 'Con turno' : 'Sin turno' }}
            </p>
          </div>

          <!-- Botón eliminar (abajo a la derecha, estilizado) -->
          <button @click.stop="eliminarPaciente(paciente.id)"
            class="absolute bottom-2 right-2 text-[#146b60] hover:text-red-600 transition" title="Eliminar paciente">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>

      <!-- Trivia del Día -->
      <div class="border-2 border-teal-200 bg-white rounded-2xl p-6 shadow-md w-full mx-auto mt-6">
        <div class="flex items-center gap-2 text-teal-700 mb-4">
          <i class="fas fa-horse-head text-lg"></i>
          <h3 class="text-lg font-semibold">Trivia Ecuestre del Día</h3>
        </div>

        <div class="bg-teal-50 border border-teal-100 p-4 rounded-xl text-gray-800 mb-4">
          {{ triviaActual }}
        </div>

        <div class="flex justify-between">
          <button @click="verSiguienteTrivia"
            class="flex items-center gap-2 text-sm bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl transition-all">
            <i class="fas fa-forward"></i>
            <span class="hidden md:inline">Ver siguiente</span>
          </button>

          <button @click="guardarTrivia"
            class="flex items-center gap-2 text-sm bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl transition-all">
            <i class="fas fa-heart"></i>
            <span class="hidden md:inline">Guardar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Vista Admin -->
    <div v-else-if="tipo === 'admin'" class="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <Admin />
    </div>

    <!-- Vista Paciente -->
    <div v-else>
      <Loader v-if="accionando"
        class="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-2xl" />

      <div class="mx-auto w-full">
        <div v-if="loading">
          <Loader class="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-2xl" />
        </div>

        <div>
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-2xl font-bold text-[#146b60]">Hola {{ nombre }}</h1>
              <p class="text-gray-500">{{ fechaActual }}</p>
            </div>
            <img :src="foto" class="w-12 h-12 rounded-full border-2 border-[#146b60] object-cover" alt="Foto perfil" />
          </div>

          <!-- Calendario -->
          <div
            class="flex md:justify-between items-center overflow-x-auto md:overflow-visible w-full mb-6 gap-3 px-1 scrollbar-hide">
            <div v-for="(dia, index) in diasCalendario" :key="index" @click="diaSeleccionado = dia.fecha"
              class="flex flex-col items-center px-4 py-3 rounded-xl cursor-pointer min-w-[72px] shrink-0 md:flex-1 md:min-w-0 transition-all duration-200"
              :class="dia.fecha === diaSeleccionado ? 'bg-[#146b60] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
              <span class="text-sm font-medium mb-1">{{ dia.diaSemana }}</span>
              <span class="text-xl font-bold">{{ dia.diaNumero }}</span>
            </div>
          </div>

          <!-- Gráfico estado anímico -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-[#146b60] mb-4">Estado de ánimo semanal</h3>
            <div class="grid grid-cols-7 gap-3 h-52 transition-all duration-300 ease-in-out">
              <div v-for="dia in diasSemana" :key="dia.fecha"
                class="flex flex-col items-center justify-end text-center h-full">
                <!-- Barra múltiple con curvatura -->
                <div class="w-10 h-32 rounded-full overflow-hidden flex flex-col transition-all duration-300"
                  :class="dia.fecha === diaSeleccionado ? 'ring-2 ring-[#146b60] scale-105' : ''">
                  <div v-for="(estado, index) in dia.estados" :key="estado + index"
                    class="w-full flex items-center justify-center text-xs" :class="[
                      estadoColorClase(estado),
                      index === 0 ? 'rounded-t-full' : '',
                      index === dia.estados.length - 1 ? 'rounded-b-full' : ''
                    ]" :style="`height: ${100 / dia.estados.length}%`">
                    <i :class="estadosAnimicos.find(e => e.valor === estado)?.icono" class="text-sm"></i>
                  </div>
                </div>

                <!-- Día -->
                <div class="mt-2 text-sm flex flex-col items-center transition-all duration-200"
                  :class="dia.fecha === diaSeleccionado ? 'text-white bg-[#146b60] p-1 rounded font-semibold' : 'text-[#146b60]'">
                  <span>{{ dia.diaSemana }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ¿Cómo te sientes hoy? -->
          <div class="border-2 border-teal-200 rounded-xl mb-6 p-4 shadow-md">
            <Loader v-if="guardandoEstado" mini
              class="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-2xl" />
            <h3 class="text-lg font-semibold text-[#146b60] mb-2">¿Cómo te sentís hoy?</h3>
            <div class="flex flex-wrap gap-2">
              <button v-for="estado in estadosAnimicos" :key="estado.valor"
                :disabled="guardandoEstado || esIncompatible(estado.valor)" @click="guardarEstadoAnimo(estado.valor)"
                :class="[
                  'flex items-center gap-2 px-2 py-2 rounded-full text-sm font-semibold shadow-sm transition-all',
                  estadoColorClase(estado.valor),
                  diaSeleccionadoEstados.includes(estado.valor) ? 'ring-2 ring-[#146b60]' : '',
                  esIncompatible(estado.valor) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                ]">
                <i :class="estado.icono"></i> {{ estado.nombre }}
              </button>
            </div>
          </div>

          <!-- Sección de anotaciones -->
          <div
            class="relative border-2 border-teal-200 bg-white rounded-2xl p-6 shadow-md mt-6 transition-all duration-300">
            <!-- Encabezado con ícono -->
            <div class="flex items-center gap-3 mb-4 text-teal-600">
              <i class="fas fa-pen-to-square text-xl text-[#146b60] md:block hiden"></i>
              <h4 class="text-lg font-semibold text-[#146b60]">¿Querés profundizar en cómo te sentís?</h4>
            </div>

            <div v-if="tipo === 'paciente'">
              <!-- Nota ya guardada -->
              <div v-if="notaGuardada">
                <div class="bg-teal-50 border border-teal-100 p-4 rounded-xl text-gray-800 whitespace-pre-line">
                  {{ notaDelDia }}
                </div>

                <!-- Botones de acción -->
                <div class="mt-4 flex flex-wrap gap-2">
                  <button @click="editarNota"
                    class="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow">
                    <i class="fas fa-edit text-sm"></i>
                    Editar
                  </button>

                  <button @click="eliminarNota"
                    class="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow">
                    <i class="fas fa-trash-alt text-sm"></i>
                    Eliminar
                  </button>
                </div>

              </div>

              <!-- Modo edición -->
              <div v-else>
                <textarea v-model="notaDelDia"
                  class="w-full resize-none p-3 text-gray-700 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200"
                  rows="4" placeholder="Escribí tu anotación personal para hoy..."></textarea>

                <button @click="guardarNota"
                  class="mt-4 w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium py-2.5 rounded-xl shadow hover:from-teal-600 hover:to-teal-700 transition-all duration-200"
                  :disabled="guardandoNota">
                  <i class="fas fa-save mr-2"></i>
                  Guardar nota
                </button>

                <Loader v-if="guardandoNota"
                  class="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trivia del Día -->
      <div class="border-2 border-teal-200 bg-white rounded-2xl p-6 shadow-md w-full mx-auto mt-6">
        <div class="flex items-center gap-2 text-teal-700 mb-4">
          <i class="fas fa-horse-head text-lg"></i>
          <h3 class="text-lg font-semibold">Trivia Ecuestre del Día</h3>
        </div>

        <div class="bg-teal-50 border border-teal-100 p-4 rounded-xl text-gray-800 mb-4">
          {{ triviaActual }}
        </div>

        <div class="flex justify-between">
          <button @click="verSiguienteTrivia"
            class="flex items-center gap-2 text-sm bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl transition-all">
            <i class="fas fa-forward"></i>
            <span class="hidden md:inline">Ver siguiente</span>
          </button>

          <button @click="guardarTrivia"
            class="flex items-center gap-2 text-sm bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl transition-all">
            <i class="fas fa-heart"></i>
            <span class="hidden md:inline">Guardar</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Agregar Paciente -->
  <transition name="modal-fade">
    <div v-if="modalAbierto" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <Loader v-if="accionando"
        class="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-2xl" />

      <!-- Contenedor del modal -->
      <div
        class="bg-white relative rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-4 transform transition-all duration-300 ease-out">

        <!-- Botón cerrar -->
        <button @click="modalAbierto = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-[#146b60] transition text-xl z-10">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- Encabezado -->
        <div class="text-center">
          <h3 class="text-xl font-bold text-[#146b60]">Pacientes sin doctor asignado</h3>
          <p class="text-sm text-gray-500">Seleccioná uno para asignarlo a tu agenda</p>
        </div>

        <!-- Filtros -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input v-model="filtroNombre" type="text" placeholder="Buscar por nombre"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60]" />
          <input v-model="filtroObra" type="text" placeholder="Buscar por obra social"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#146b60]" />
        </div>

        <!-- Lista de pacientes -->
        <div v-if="pacientesSinDoctor.length" class="space-y-3 max-h-80 overflow-y-auto">
          <div v-for="p in pacientesFiltrados" :key="p.id"
            class="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:shadow transition">

            <!-- Foto + Info -->
            <div class="flex items-center gap-4">
              <img :src="p.foto || '/img/default-user.jpg'" alt="Foto paciente"
                class="w-12 h-12 rounded-full object-cover border-2 border-[#146b60]" />
              <div>
                <p class="font-medium text-gray-800">{{ p.nombre }}</p>
                <p class="text-sm text-gray-500">Edad: {{ p.edad }}</p>
              </div>
            </div>

            <!-- Botón Asignar -->
            <button @click="asignarPaciente(p.id)"
              class="bg-[#146b60] hover:bg-[#0f5246] text-white text-sm px-4 py-2 rounded-lg transition">
              Asignar
            </button>
          </div>
        </div>

        <!-- Sin pacientes -->
        <div v-else class="px-6 py-8 max-w-6xl mx-auto">
          No hay pacientes disponibles
        </div>
      </div>
    </div>
  </transition>

</template>

<script>
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, deleteField, updateDoc } from 'firebase/firestore';
import Loader from "../components/Loader.vue"
import Admin from "../components/DashboardAdmin.vue"
import Swal from 'sweetalert2';

export default {
  components: {
    Loader,
    Admin
  },
  data() {
    return {
      tipo: null,
      pacientes: [],
      turnos: {},
      loading: true,
      nombre: '',
      centro: '',
      obraSocial: '',
      foto: '/img/default-user.jpg',
      diaSeleccionado: this.obtenerFechaActual(),
      modalAbierto: false,
      todosLosPacientes: [],
      pacientesSinDoctor: [],
      filtroNombre: '',
      filtroObra: '',
      accionando: false,
      estadosAnimicos: [
        { nombre: "Feliz", valor: "feliz", color: "bg-emerald-200 text-emerald-800", icono: "fas fa-smile" },
        { nombre: "Neutral", valor: "neutral", color: "bg-yellow-200 text-yellow-800", icono: "fas fa-meh" },
        { nombre: "Enojado", valor: "enojado", color: "bg-red-300 text-red-800", icono: "fas fa-angry" },
        { nombre: "Triste", valor: "triste", color: "bg-purple-300 text-purple-900", icono: "fas fa-sad-tear" },
        { nombre: "Frustrado", valor: "frustrado", color: "bg-orange-300 text-orange-900", icono: "fas fa-tired" },
        { nombre: "Entusiasmado", valor: "entusiasmado", color: "bg-teal-300 text-teal-900", icono: "fas fa-grin-stars" },
        { nombre: "Calmado", valor: "calmado", color: "bg-yellow-300 text-yellow-900", icono: "fas fa-smile-beam" },
        { nombre: "Deprimido", valor: "deprimido", color: "bg-indigo-400 text-indigo-900", icono: "fas fa-frown-open" },
      ],
      incompatibilidades: {
        feliz: ['triste', 'deprimido', 'enojado'],
        triste: ['feliz', 'entusiasmado', 'calmado'],
        enojado: ['feliz', 'calmado', 'entusiasmado'],
        deprimido: ['feliz', 'entusiasmado', 'neutral'],
        entusiasmado: ['deprimido', 'triste'],
        frustrado: ['calmado'],
        calmado: ['enojado', 'frustrado'],
        neutral: []
      },
      diasSemana: [],
      guardandoEstado: false,
      diaSeleccionadoEstados: [],
      semanaBase: new Date(),
      notaDelDia: '',
      guardandoNota: false,
      notaGuardada: false,
      triviasPaciente: [
        "Acariciar a un caballo durante al menos 5 minutos puede reducir los niveles de cortisol.",
        "Los caballos pueden sentir tu estado emocional a través de tu postura corporal y tono de voz.",
        "Cuando un caballo apoya su cabeza sobre vos, muestra afecto y confianza.",
        "Los caballos tienen una memoria emocional: recuerdan cómo los hiciste sentir.",
        "Un caballo puede reconocer a una persona incluso después de varios años sin verla.",
        "Cepillar al caballo genera vínculos de confianza y puede actuar como una forma de meditación activa.",
        "Los caballos bostezan, suspiran y relajan la mandíbula cuando se sienten cómodos y en paz.",
        "Las orejas de un caballo se mueven como pequeñas antenas: si están hacia vos, está prestando atención.",
        "El simple acto de caminar al lado del caballo puede regular la respiración y mejorar la conciencia corporal.",
        "Los caballos no juzgan: su comportamiento refleja el presente y la energía que les transmitís.",
        "Abrazar el cuello de un caballo puede generar una sensación de contención emocional profunda.",
        "El calor corporal de un caballo puede ser reconfortante para personas con ansiedad.",
        "Montar al paso ayuda a estimular ambos hemisferios del cerebro de manera alterna.",
        "Los caballos usan más de 17 expresiones faciales diferentes, ¡algunas parecidas a las humanas!",
        "Estar en un entorno natural con caballos favorece la producción de serotonina (la “hormona del bienestar”).",
        "Los caballos detectan microexpresiones y son muy sensibles a los cambios sutiles de humor.",
        "Las caminatas con caballo pueden ayudar a regular el tono muscular y mejorar el equilibrio emocional.",
        "Cuando un caballo te “responde” a una caricia moviendo el labio superior, está disfrutando el momento.",
        "Muchos caballos disfrutan que les hablen: reconocen el tono suave y tranquilo.",
        "En culturas antiguas, los caballos eran considerados animales de sanación y guía emocional.",
        "La presencia constante de un mismo caballo puede generar un vínculo terapéutico muy poderoso.",
        " Los caballos aprenden con el refuerzo positivo, igual que las personas.",
        "Un caballo curioso que se acerca, es una invitación a construir un vínculo.",
        "Observar el movimiento rítmico de un caballo puede calmar estados de agitación o distracción.",
        "Los caballos pueden sincronizar su ritmo cardíaco con el de las personas cuando están en calma cerca de ellas.",
      ],
      triviasProfesional: [
        "La interacción con caballos aumenta la producción de oxitocina.",
        "Niños con TEA mejoran la comunicación no verbal al trabajar con caballos.",
        "El caballo actúa como un espejo emocional del paciente.",
        "En contextos terapéuticos, el caballo actúa como un espejo emocional del paciente",
        "Las sesiones con equinos pueden generar mejoras en la autorregulación emocional en pacientes con TDAH.",
        "La observación de un caballo en calma puede activar el sistema nervioso parasimpático.",
        "La terapia asistida con caballos se ha usado en veteranos con TEPT con resultados positivos.",
        "El uso de caballos en contextos de discapacidad promueve la autonomía y la autoeficacia.",
        "El contacto físico con el caballo estimula el sistema propioceptivo y táctil",
        "En neurodivergencias, el trabajo con caballos favorece la atención plena (mindfulness).",
        "Los caballos no entienden el lenguaje verbal, pero reaccionan con precisión al lenguaje corporal.",
        "El caballo no discrimina por aspecto, condición o edad: esto fortalece la autoestima del paciente.",
        "El movimiento tridimensional del lomo del caballo estimula el tronco encefálico.",
        "Estudios muestran mejoras en habilidades sociales en pacientes con autismo tras 10 sesiones asistidas con caballos",
        "Las intervenciones asistidas con animales pueden mejorar la motivación intrínseca del paciente.",
        "El ritmo del paso del caballo regula ritmos biológicos: respiración, latido y tono muscular.",
        "La equinoterapia estimula áreas del cerebro relacionadas con la planificación y la atención sostenida.",
        "El silencio en presencia del caballo muchas veces genera un espacio terapéutico potente.",
        "La seguridad que transmite el caballo puede ayudar a romper barreras relacionales con pacientes retraídos.",
        "El contacto con animales activa la amígdala de forma positiva, reduciendo respuestas de miedo.",
        "El juego estructurado con caballos mejora funciones ejecutivas en niños con dificultades cognitivas.",
        "Cada caballo tiene una “personalidad terapéutica” única que puede ajustarse a diferentes perfiles de pacientes.",
        "La participación activa del paciente en la preparación del caballo refuerza su rol como sujeto activo del proceso.",
        "La conexión emocional con un caballo puede generar recuerdos positivos duraderos que refuercen la continuidad del tratamiento.",
        "En equinoterapia, el paso del caballo imita el patrón de la marcha humana, estimulando el equilibrio y la coordinación.",
      ],
      indiceTrivia: 0,
    };
  },
  computed: {
    fechaActual() {
      return new Date().toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long'
      });
    },
    turnosDelDia() {
      const dia = this.diaSeleccionado;
      if (!this.turnos[dia]) return [];
      return Object.keys(this.turnos[dia]);
    },
    turnosAsignados() {
      const pacientesAsignados = new Set();
      Object.values(this.turnos).forEach(dia => {
        Object.keys(dia).forEach(id => pacientesAsignados.add(id));
      });
      return Array.from(pacientesAsignados);
    },
    diasCalendario() {
      const base = new Date(this.semanaBase);
      const primerDiaSemana = new Date(base);
      const diaActual = base.getDay();
      const offset = diaActual === 0 ? -6 : 1 - diaActual;
      primerDiaSemana.setDate(base.getDate() + offset);

      const dias = [];
      for (let i = 0; i < 7; i++) {
        const fecha = new Date(primerDiaSemana);
        fecha.setDate(primerDiaSemana.getDate() + i);
        dias.push({
          fecha: fecha.toISOString().split('T')[0],
          diaSemana: fecha.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase(),
          diaNumero: fecha.getDate()
        });
      }
      return dias;
    },
    pacientesDelDia() {
      return this.pacientes.filter(p => p.tipo === 'paciente');
    },
    triviaActual() {
      const trivias = this.tipo === 'paciente' ? this.triviasPaciente : this.triviasProfesional;
      return trivias[this.indiceTrivia];
    },
    pacientesFiltrados() {
      return this.pacientesSinDoctor.filter(p => {
        const nombreCoincide = p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
        const obraCoincide = this.filtroObra === '' || (p.obraSocial || '').toLowerCase().includes(this.filtroObra.toLowerCase());
        return nombreCoincide && obraCoincide;
      });
    }
  },
  watch: {
    diaSeleccionado() {
      // Forzamos reactividad
      this.turnos = { ...this.turnos };
      this.cargarEstadosSemanales();
      if (this.tipo === 'paciente') {
        this.cargarNotaDelDia();
      }
    },
  },
  methods: {
    updateTurno(dia, pacienteId, horario) {
      if (!this.turnos[dia]) {
        this.turnos[dia] = {};
      }

      this.turnos[dia][pacienteId] = {
        horario,
        fecha: dia,
      };
    },

    async seleccionarHorario() {
      const hoy = new Date();
      const dia = hoy.toISOString().split("T")[0]; // Formato: "YYYY-MM-DD"
      return dia;
    },

    abrirModal() {
      const idsAsignados = new Set(this.pacientes.map(p => p.id));
      this.pacientesSinDoctor = this.todosLosPacientes
        .filter(p => p.tipo === 'paciente' && !idsAsignados.has(p.id));
      this.modalAbierto = true;
    },

    async asignarPaciente(pacienteId) {
      this.accionando = true; // Mostrar loader

      try {
        const db = getFirestore();
        const auth = getAuth();
        const uid = auth.currentUser.uid;

        const doctorRef = doc(db, "doctores", uid);
        const doctorSnap = await getDoc(doctorRef);

        let pacientes = {};

        if (doctorSnap.exists()) {
          const data = doctorSnap.data();
          pacientes = data.pacientes || {};
        }

        // Asignar paciente
        pacientes[pacienteId] = true;

        // Guardar en Firestore
        await setDoc(doctorRef, { pacientes }, { merge: true });

        // Agregar paciente al estado local
        const paciente = this.pacientesSinDoctor.find(p => p.id === pacienteId);
        this.pacientes.push(paciente);
        this.modalAbierto = false;
      } catch (error) {
        console.error("Error al asignar paciente:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo asignar el paciente.",
          timerProgressBar: true,
          timer: 2500,
          showConfirmButton: false
        });
      } finally {
        this.accionando = false; // Ocultar loader
      }
    },

    async eliminarPaciente(pacienteId) {
      const confirm = await Swal.fire({
        title: '¿Eliminar paciente?',
        text: 'Este paciente dejará de estar asignado a vos, pero no se eliminará su cuenta.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#146b60',
        cancelButtonColor: '#e53e3e',
      });

      if (!confirm.isConfirmed) return;

      this.accionando = true;

      try {
        const db = getFirestore();
        const auth = getAuth();
        const uid = auth.currentUser.uid;

        const doctorRef = doc(db, "doctores", uid);
        const doctorSnap = await getDoc(doctorRef);

        if (!doctorSnap.exists()) return;

        const data = doctorSnap.data();
        const pacientes = data.pacientes || {};
        const turnos = data.turnos || {};

        // Quitar paciente
        delete pacientes[pacienteId];

        // Quitar turnos
        for (const dia in turnos) {
          if (turnos[dia][pacienteId]) {
            delete turnos[dia][pacienteId];
            if (Object.keys(turnos[dia]).length === 0) {
              delete turnos[dia];
            }
          }
        }

        // 🔥 Quitar doctorId del paciente
        const pacienteRef = doc(db, "Tipo_de_usuario", pacienteId);
        await setDoc(pacienteRef, {
          doctorId: deleteField()
        }, { merge: true });

        // Guardar cambios del doctor
        await updateDoc(doctorRef, {
          [`pacientes.${pacienteId}`]: deleteField(),
          turnos: turnos,
        });

        // Estado local
        this.pacientes = this.pacientes.filter(p => p.id !== pacienteId);
        this.turnos = turnos;
      } catch (error) {
        console.error("Error al eliminar paciente:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el paciente.",
          timerProgressBar: true,
          timer: 2500,
          showConfirmButton: false
        });
      } finally {
        this.accionando = false;
      }
    },

    async marcarTurno(pacienteId) {
      const db = getFirestore();
      const auth = getAuth();
      const uid = auth.currentUser.uid;
      const doctorRef = doc(db, "doctores", uid);

      if (this.turnos[this.diaSeleccionado]?.[pacienteId]) {
        // Eliminar turno del día seleccionado
        delete this.turnos[this.diaSeleccionado][pacienteId];

        // Si no quedan turnos ese día, lo eliminamos
        if (Object.keys(this.turnos[this.diaSeleccionado]).length === 0) {
          delete this.turnos[this.diaSeleccionado];
        }

        // Guardar en Firestore
        await setDoc(doctorRef, {
          turnos: this.turnos
        }, { merge: true });

        return;
      }

      const horario = await this.seleccionarHorario();
      if (!horario) return;

      this.updateTurno(this.diaSeleccionado, pacienteId, horario);

      await setDoc(doctorRef, {
        turnos: this.turnos
      }, { merge: true });
    },

    obtenerFechaActual() {
      return new Date().toISOString().split('T')[0];
    },

    // Estado animico del paciente
    estadoColorClase(valor) {
      const estado = this.estadosAnimicos.find(e => e.valor === valor);
      return estado ? estado.color : '';
    },

    async guardarEstadoAnimo(estado) {
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getFirestore();
      const fecha = this.diaSeleccionado;

      const docId = `${user.uid}_${fecha}`;
      const docRef = doc(db, 'estado_animico', docId);

      this.guardandoEstado = true;

      try {
        const docSnap = await getDoc(docRef);
        let estados = [];

        if (docSnap.exists()) {
          estados = docSnap.data().estados || [];
        }

        if (estados.includes(estado)) {
          estados = estados.filter(e => e !== estado);
        } else {
          estados.push(estado);
        }

        await setDoc(docRef, {
          uid: user.uid,
          fecha,
          nota: this.notaDelDia,
          estados
        });

        await this.cargarEstadosSemanales();
      } catch (error) {
        console.error("Error al guardar estado anímico:", error);
      } finally {
        this.guardandoEstado = false;
      }
    },

    async cargarEstadosSemanales() {
      const auth = getAuth();
      const user = auth.currentUser;
      const db = getFirestore();

      const hoy = new Date();
      const diaSemana = hoy.getDay(); // 0 (domingo) - 6 (sábado)
      const lunes = new Date(hoy);
      const diff = (diaSemana + 6) % 7; // convierte domingo en 6, lunes en 0
      lunes.setDate(hoy.getDate() - diff);

      const dias = [];

      for (let i = 0; i < 7; i++) {
        const fecha = new Date(lunes);
        fecha.setDate(lunes.getDate() + i);
        const fechaStr = fecha.toISOString().split('T')[0];

        const docId = `${user.uid}_${fechaStr}`;
        const docRef = doc(db, 'estado_animico', docId);
        const docSnap = await getDoc(docRef);

        const estados = docSnap.exists() ? (docSnap.data().estados || []) : [];

        dias.push({
          fecha: fechaStr,
          diaSemana: fecha.toLocaleDateString('es-AR', { weekday: 'short' }).toUpperCase(),
          diaNumero: fecha.getDate(),
          estados,
          estadoFusionado: this.fusionarEstados(estados)
        });
      }

      // Asignamos directamente, sin rotar
      this.diasSemana = dias;

      // Estados del día seleccionado
      const diaActual = dias.find(d => d.fecha === this.diaSeleccionado);
      this.diaSeleccionadoEstados = diaActual?.estados || [];
    },

    fusionarEstados(estados) {
      if (!estados || estados.length === 0) return null;
      if (estados.length === 1) return estados[0];

      const combinaciones = {
        calmado_deprimido: "triste",
        calmado_enojado: "neutral",
        calmado_entusiasmado: "feliz",
        calmado_feliz: "calmado",
        calmado_frustrado: "neutral",
        calmado_neutral: "calmado",
        calmado_triste: "triste",

        deprimido_enojado: "frustrado",
        deprimido_entusiasmado: "triste",
        deprimido_feliz: "neutral",
        deprimido_frustrado: "deprimido",
        deprimido_neutral: "deprimido",
        deprimido_triste: "deprimido",

        enojado_entusiasmado: "frustrado",
        enojado_feliz: "neutral",
        enojado_frustrado: "frustrado",
        enojado_neutral: "neutral",
        enojado_triste: "frustrado",

        entusiasmado_feliz: "entusiasmado",
        entusiasmado_frustrado: "neutral",
        entusiasmado_neutral: "feliz",
        entusiasmado_triste: "frustrado",

        feliz_frustrado: "neutral",
        feliz_neutral: "feliz",
        feliz_triste: "neutral",

        frustrado_neutral: "frustrado",
        frustrado_triste: "triste",

        neutral_triste: "triste"
      };

      // Orden alfabético para emparejar la combinación
      const combinacion = estados.sort().join("_");
      return combinaciones[combinacion] || "neutral"; // fallback
    },

    esIncompatible(estado) {
      return this.diaSeleccionadoEstados.some(seleccionado =>
        this.incompatibilidades[seleccionado]?.includes(estado)
      );
    },

    // Anotaciones
    async guardarNota() {
      this.guardandoNota = true;
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("Usuario no autenticado");

        const db = getFirestore();
        const fecha = this.diaSeleccionado;
        const idDocumento = `${user.uid}_${fecha}`;

        const docRef = doc(db, 'estado_animico', idDocumento);
        const docSnap = await getDoc(docRef);

        const dataExistente = docSnap.exists() ? docSnap.data() : {};
        const nuevosDatos = {
          ...dataExistente,
          fecha,
          uid: user.uid,
          nota: this.notaDelDia
        };

        await setDoc(docRef, nuevosDatos);
        this.notaGuardada = true;

        // ✅ Mensaje amigable
        Swal.fire({
          icon: 'success',
          title: '¡Gracias por compartir!',
          text: 'Tu nota fue guardada correctamente. 💚',
          timer: 2500, // ⏱️ se cierra en 2.5 segundos
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: true, // 👈 se puede cerrar clickeando fuera
          backdrop: true
        });
      } catch (error) {
        console.error("Error al guardar la nota:", error);
      } finally {
        this.guardandoNota = false;
      }
    },

    // Permite editar la nota (modo edición)
    editarNota() {
      this.notaGuardada = false;
    },

    // Elimina la nota de Firestore
    async eliminarNota() {
      const confirmacion = await Swal.fire({
        title: '¿Eliminar la nota?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e53e3e',
        cancelButtonColor: '#146b60',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (confirmacion.isConfirmed) {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) throw new Error("Usuario no autenticado");

          const fecha = this.diaSeleccionado;
          const idDocumento = `${user.uid}_${fecha}`;
          const db = getFirestore();
          const docRef = doc(db, 'estado_animico', idDocumento);

          // Solo eliminamos el campo 'nota', no el documento completo
          await updateDoc(docRef, {
            nota: deleteField()
          });

          this.notaDelDia = '';
          this.notaGuardada = false;

          Swal.fire({
            icon: 'success',
            title: 'Nota eliminada',
            text: 'Tu nota fue eliminada correctamente.',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        } catch (error) {
          console.error("Error al eliminar la nota:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al eliminar la nota.'
          });
        }
      }
    },

    async cargarNotaDelDia() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const fecha = this.diaSeleccionado;
        const idDocumento = `${user.uid}_${fecha}`;
        const db = getFirestore();

        const docRef = doc(db, 'estado_animico', idDocumento);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          this.notaDelDia = data.nota || '';
          this.notaGuardada = !!data.nota;
        } else {
          this.notaDelDia = '';
          this.notaGuardada = false;
        }
      } catch (error) {
        console.error("Error al cargar la nota del día:", error);
      }
    },

    // Datos
    calcularIndicePorFecha() {
      const fecha = new Date();
      const seed = fecha.getFullYear() * 10000 + (fecha.getMonth() + 1) * 100 + fecha.getDate();
      const total = this.tipo === 'paciente' ? this.triviasPaciente.length : this.triviasProfesional.length;
      return seed % total;
    },
    verSiguienteTrivia() {
      const trivias = this.tipo === 'paciente' ? this.triviasPaciente : this.triviasProfesional;
      this.indiceTrivia = (this.indiceTrivia + 1) % trivias.length;
    },
    async guardarTrivia() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("Usuario no autenticado");

        const db = getFirestore();
        const userRef = doc(db, 'Tipo_de_usuario', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const triviaActual = this.triviaActual;

          // Obtener el array existente o iniciarlo
          const datosGuardados = Array.isArray(data.datos) ? data.datos : [];

          // Si ya está guardada, no duplicar
          if (datosGuardados.includes(triviaActual)) {
            return Swal.fire({
              icon: 'info',
              title: 'Ya guardada',
              text: 'Esta trivia ya está en tus datos guardados.',
              timer: 2000,
              showConfirmButton: false,
              timerProgressBar: true
            });
          }

          // Agregar nueva trivia
          const nuevosDatos = [...datosGuardados, triviaActual];

          // Guardar en Firestore
          await updateDoc(userRef, {
            datos: nuevosDatos
          });

          Swal.fire({
            icon: 'success',
            title: 'Trivia guardada',
            text: 'Se guardó correctamente en tus datos. 💾',
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true
          });
        }
      } catch (error) {
        console.error("Error al guardar la trivia:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al guardar la trivia.'
        });
      }
    }
  },

  async mounted() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const tipoRef = doc(db, 'Tipo_de_usuario', user.uid);
    const tipoSnap = await getDoc(tipoRef);

    if (tipoSnap.exists()) {
      const data = tipoSnap.data();
      this.tipo = data.tipo;
      this.nombre = data.nombre || 'Doctor';
      this.foto = data.photoURL || this.foto;

      if (this.tipo === 'doctor') {
        const usuariosRef = collection(db, 'Tipo_de_usuario');
        const usuariosSnap = await getDocs(usuariosRef);

        this.todosLosPacientes = usuariosSnap.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              nombre: data.nombre,
              edad: data.edad,
              obraSocial: data.obraSocial,
              condicionMedica: data.condicionMedica,
              centro: data.centro,
              acompanante: data.acompanante,
              tipo: data.tipo,
              foto: data.photoURL || null,
            };
          });

        this.pacientes = [...this.todosLosPacientes].filter((u) => {
          return u.tipo === 'paciente' && u.doctorId === user.uid;
        });
        const doctorRef = doc(db, "doctores", user.uid);
        const doctorSnap = await getDoc(doctorRef);
        if (doctorSnap.exists()) {
          const data = doctorSnap.data();
          this.turnos = data.turnos || {};

          const pacientesAsignados = data.pacientes || {};
          const idsAsignados = Object.keys(pacientesAsignados);

          // Filtrar pacientes que están asignados al doctor
          this.pacientes = this.todosLosPacientes.filter(p => idsAsignados.includes(p.id));
        }
      }
      if (this.tipo === 'paciente') {
        await this.cargarEstadosSemanales();
        await this.cargarNotaDelDia();
      }
    }
    this.indiceTrivia = this.calcularIndicePorFecha();

    this.loading = false;
  }
};
</script>


<style scoped>
input {
  max-width: 100%;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}
</style>
