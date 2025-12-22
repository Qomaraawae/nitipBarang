import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDp_blm7CODGShAmsSaa9rCJiWhSPqXA3Y",
  authDomain: "nitipbarang-ec2d9.firebaseapp.com",
  projectId: "nitipbarang-ec2d9",
  storageBucket: "nitipbarang-ec2d9.firebasestorage.app",
  messagingSenderId: "610201607628",
  appId: "1:610201607628:web:f569d88b261b18a2571169",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;