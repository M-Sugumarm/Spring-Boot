// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwAOX26dnaxQECPS1431YyeN65RzobLCA",
    authDomain: "spring-boot-4e95d.firebaseapp.com",
    projectId: "spring-boot-4e95d",
    storageBucket: "spring-boot-4e95d.firebasestorage.app",
    messagingSenderId: "148094363104",
    appId: "1:148094363104:web:3b32b81617639b125df785",
    measurementId: "G-J6NYFKYV18"
};

// Initialize Firebase
let app, analytics, db;
try {
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    db = getFirestore(app);
    console.log("✅ Firebase initialized successfully!");
} catch (e) {
    console.error("❌ Firebase initialization failed:", e);
    alert("Firebase failed to connect. Check console for details.");
}

// Export for use in other modules
export { db, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy };
