// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAvRxKzBOid70W5p1HjGhUEbK6-Fyw2pm4",
  authDomain: "certhub-46402.firebaseapp.com",
  projectId: "certhub-46402",
  storageBucket: "certhub-46402.firebasestorage.app",
  messagingSenderId: "538426429746",
  appId: "1:538426429746:web:a3cf21e04eb09e0268872b",
  measurementId: "G-N05DF8LXNP"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
