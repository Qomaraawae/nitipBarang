import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { app } from "./firebaseConfig";

export const auth = getAuth(app);

// Set persistence to LOCAL (tetap login meskipun browser ditutup)
setPersistence(auth, browserLocalPersistence);

// Login function
export async function login(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// Logout function
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

// Helper function to get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// Helper function to wait for auth state
export function waitForAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}