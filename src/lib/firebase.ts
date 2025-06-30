// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For security, you should move this to environment variables in a real application
const firebaseConfig = {
  apiKey: "AIzaSyBSxs1uR8M9v3q9CgMnxkIQeKtRPUPmpYM",
  authDomain: "yasharts-50805.firebaseapp.com",
  projectId: "yasharts-50805",
  storageBucket: "yasharts-50805.firebasestorage.app",
  messagingSenderId: "1023981978150",
  appId: "1:1023981978150:web:8a8595c429d16c69e95ce7",
  measurementId: "G-J5FJBJ6ZFZ"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
