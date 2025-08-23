// src/firebaseClient.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// fill these from Firebase Console → Project settings → Web app config
const firebaseConfig = {
  apiKey: "AIzaSyDaWbilcHC8PqS7Y8uBhSa7PHmNJaDjjEw",
  authDomain: "bom-layers.firebaseapp.com",
  projectId: "bom-layers",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
