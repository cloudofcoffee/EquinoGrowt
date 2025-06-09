// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 🔵 Firebase principal
const mainConfig = {
  apiKey: "AIzaSyAvqhSfkcaRHaZzIJIX-v2l82OB4kDiIwY",
  authDomain: "equinogrowt.firebaseapp.com",
  projectId: "equinogrowt",
  storageBucket: "equinogrowt.firebasestorage.app",
  messagingSenderId: "549785640053",
  appId: "1:549785640053:web:e0128b97826b5fa7bfac3c",
  measurementId: "G-ZZGWVPX5EZ"
};

// 🔴 Firebase secundario (solo para Storage)
const secondaryConfig = {
  apiKey: "AIzaSyBT-MhKS7hhMQ9iQn-xf8BTC5wmAT5_g0c",
  authDomain: "fabo-social.firebaseapp.com",
  projectId: "fabo-social",
  storageBucket: "fabo-social.appspot.com",
  messagingSenderId: "18759853445",
  appId: "1:18759853445:web:b1170a89f3f082401e90ec"
};

// Inicializar apps si no están ya inicializadas (previene errores en hot reload)
const mainApp = getApps().find(app => app.name === "[DEFAULT]") || initializeApp(mainConfig);
const secondaryApp = getApps().find(app => app.name === "secondary") || initializeApp(secondaryConfig, "secondary");

// Servicios del proyecto principal
const db = getFirestore(mainApp);
const auth = getAuth(mainApp);
const storage = getStorage(mainApp); // Este es el storage del principal

// Servicio de almacenamiento del proyecto secundario
const storageSecondary = getStorage(secondaryApp);

// Exportar todo
export { db, auth, storage, storageSecondary };
