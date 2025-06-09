import { createRouter, createWebHistory } from 'vue-router';
import { getAuth } from "firebase/auth";

// Componentes
const Inicio = () => import('../components/Inicio.vue');
const Login = () => import('../components/Auth/Login.vue');
const Registro = () => import('../components/Auth/Registro.vue');
const Perfil = () => import('../components/Perfil.vue');
const Bienvenidos = () => import('../components/Bienvenidos.vue');
const Pacientes = () => import('../components/Pacientes.vue');
const CrearPaciente = () => import('../components/CrearPaciente.vue')
const EditarPaciente = () => import('../components/EditarPaciente.vue')
const NotFound = () => import('../components/NotFound.vue');

const routes = [
  { path: '/', component: Inicio, name: 'Incio'},
  { path: '/bienvenidos', component: Bienvenidos, name: 'Bienvenidos' },
  { path: '/login', component: Login, name: 'Login' },
  { path: '/registro', component: Registro, name: 'Registro' },
  { path: '/perfil', component: Perfil, name: 'Perfil' },
  { path: '/pacientes', component: Pacientes, name: 'Pacientes' },
  { path: '/crear-paciente', component: CrearPaciente, name: 'CrearPaciente' },
  { path: '/editar-paciente/:id', component: EditarPaciente, name: 'EditarPaciente' },
  { path: '/:pathMatch(.*)*', component: NotFound, name: 'NotFound' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 💡 Manejo de rutas protegidas únicamente
router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !user) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
