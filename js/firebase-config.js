// /js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Paste your own Firebase config here 👇
const firebaseConfig = {
  apiKey: "AIzaSyAg1wuFfyB-Veh3AE5NSOlCS4x46iKa6Lo",
  authDomain: "studentperformancetracke-93df4.firebaseapp.com",
  projectId: "studentperformancetracke-93df4",
  storageBucket: "studentperformancetracke-93df4.firebasestorage.app",
  messagingSenderId: "362511096934",
  appId: "1:362511096934:web:22342fc29f74ced8e3a1a7",
  measurementId: "G-MXF20XMR3M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
