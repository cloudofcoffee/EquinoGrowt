import { createRouter, createWebHistory } from 'vue-router';
import { getAuth } from "firebase/auth";

// Componentes
const Inicio = () => import('../components/Inicio.vue');
const Login = () => import('../components/Auth/Login.vue');
const Registro = () => import('../components/Auth/Registro.vue');
const Perfil = () => import('../components/Perfil.vue');
const Bienvenidos = () => import('../components/Bienvenidos.vue');
const Notas = () => import('../components/Notas.vue');
const CrearNotas = () => import('../components/CrearNota.vue')
const EditarNotas = () => import('../components/EditarNotas.vue')
const NotFound = () => import('../components/NotFound.vue');

const routes = [
  { path: '/', component: Inicio, name: 'Incio'},
  { path: '/bienvenidos', component: Bienvenidos, name: 'Bienvenidos' },
  { path: '/login', component: Login, name: 'Login' },
  { path: '/registro', component: Registro, name: 'Registro' },
  { path: '/perfil', component: Perfil, name: 'Perfil' },
  { path: '/notas', component: Notas, name: 'Notas' },
  { path: '/crear-nota', component: CrearNotas, name: 'CrearNotas' },
  { path: '/editar-nota/:id', component: EditarNotas, name: 'EditarNotas' },
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
