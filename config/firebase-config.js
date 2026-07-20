import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCv_NLOCXb3ApTMSjxsIDLbYrUr1Ymi-rA",
    authDomain: "smart-room-c163c.firebaseapp.com",
    databaseURL: "https://smart-room-c163c-default-rtdb.firebaseio.com",
    projectId: "smart-room-c163c",
    storageBucket: "smart-room-c163c.firebasestorage.app",
    messagingSenderId: "552350325154",
    appId: "1:552350325154:web:4cbe5619639f844d7dbafb",
    measurementId: "G-7DY5JE1SR4"
};

// Initialisation de Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);