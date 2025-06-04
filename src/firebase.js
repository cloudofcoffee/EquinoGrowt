// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore
import { getAuth } from "firebase/auth"; // Authentication
import { getStorage } from "firebase/storage"; // Firebase Storage

// Configuración de aplicación web de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAvqhSfkcaRHaZzIJIX-v2l82OB4kDiIwY",
  authDomain: "equinogrowt.firebaseapp.com",
  projectId: "equinogrowt",
  storageBucket: "equinogrowt.firebasestorage.app",
  messagingSenderId: "549785640053",
  appId: "1:549785640053:web:e0128b97826b5fa7bfac3c",
  measurementId: "G-ZZGWVPX5EZ"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);

// Inicializa Firebase Auth
const auth = getAuth(app);

// Inicializa Firebase Storage
const storage = getStorage(app);

// Exporta la aplicación y los servicios de Firestore, Auth y Storage para usarlos en otros archivos
export { db, auth, storage };
