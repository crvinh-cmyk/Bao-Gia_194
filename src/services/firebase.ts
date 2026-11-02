import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBLUZJ6Xm_d8ToqcwZZXSopgmEpcI5konY",
  authDomain: "lab-f7f0a.firebaseapp.com",
  projectId: "lab-f7f0a",
  storageBucket: "lab-f7f0a.firebasestorage.app",
  messagingSenderId: "1092337487585",
  appId: "1:1092337487585:web:12ac272bf97a43396d71a0",
  measurementId: "G-9LW60DVYFC"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInAdminWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutAdmin() {
  return signOut(auth);
}
