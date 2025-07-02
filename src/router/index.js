import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Componentes
const Inicio = () => import('../components/Inicio.vue');
const Login = () => import('../components/Auth/Login.vue');
const Registro = () => import('../components/Auth/Registro.vue');
const Perfil = () => import('../components/Perfil.vue');
const Bienvenidos = () => import('../components/Bienvenidos.vue');
const Paciente = () => import('../components/Paciente.vue');
const Chat = () => import('../components/Chat.vue');
const Calendario = () => import('../components/Calendario.vue');
const NotFound = () => import('../components/NotFound.vue');

const routes = [
  { path: '/', component: Inicio, name: 'Inicio', meta: { requiresAuth: true } },
  { path: '/bienvenidos', component: Bienvenidos, name: 'Bienvenidos' },
  { path: '/login', component: Login, name: 'Login' },
  { path: '/registro', component: Registro, name: 'Registro' },
  { path: '/perfil', component: Perfil, name: 'Perfil', meta: { requiresAuth: true } },
  { path: '/chat', component: Chat, name: 'Chat', meta: { requiresAuth: true } },
  { path: '/calendario', component: Calendario, name: 'Calendario', meta: { requiresAuth: true } },
  {
    path: '/paciente/:id', name: 'Paciente', component: Paciente, props: true
  },
  { path: '/:pathMatch(.*)*', component: NotFound, name: 'NotFound' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔐 Middleware de navegación
let firstRun = true;

router.beforeEach((to, from, next) => {
  const auth = getAuth();

  const check = () => {
    const user = auth.currentUser;
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresDoctor = to.matched.some(record => record.meta.requiresDoctor);

    if (requiresAuth && !user) {
      return next({ name: 'Login' });
    }

    if (requiresDoctor && user) {
      const db = getFirestore();
      const docRef = doc(db, "Tipo_de_usuario", user.uid);
      getDoc(docRef).then(docSnap => {
        if (docSnap.exists() && docSnap.data().tipo === "doctor") {
          return next();
        } else {
          return next({ name: 'Inicio' }); // Redirige si no es doctor
        }
      }).catch(() => next({ name: 'Inicio' }));
    } else {
      return next();
    }
  };

  if (firstRun) {
    firstRun = false;
    onAuthStateChanged(auth, () => check());
  } else {
    check();
  }
});

export default router;
