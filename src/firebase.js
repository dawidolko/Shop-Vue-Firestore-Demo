// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Konfiguracja Twojej aplikacji Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDpoR9FLkSQMaYpfrij-gXkmtwXfL4epjw",
  authDomain: "sklep-vue-firestore.firebaseapp.com",
  projectId: "sklep-vue-firestore",
  storageBucket: "sklep-vue-firestore.appspot.com",
  messagingSenderId: "260406460193",
  appId: "1:260406460193:web:cb9931fe9fdb9d96698860",
  measurementId: "G-NJ6SPBZFVB",
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
