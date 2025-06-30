import { initializeApp, getApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSxs1uR8M9v3q9CgMnxkIQeKtRPUPmpYM",
  authDomain: "yasharts-50805.firebaseapp.com",
  projectId: "yasharts-50805",
  storageBucket: "yasharts-50805.appspot.com",
  messagingSenderId: "1023981978150",
  appId: "1:1023981978150:web:8a8595c429d16c69e95ce7",
  measurementId: "G-J5FJBJ6ZFZ"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

export { app, storage };
