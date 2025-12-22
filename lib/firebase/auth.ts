import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// Set persistence
setPersistence(auth, browserLocalPersistence).catch(error => {
  console.error("Error setting auth persistence:", error);
});

export type UserRole = "admin" | "user";

export interface UserData {
  uid: string;
  email: string | null;
  role: UserRole;
}

// Login function with role fetching
export async function login(email: string, password: string): Promise<UserData> {
  try {
    // 1. Login to Firebase Auth
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // 2. Get user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      throw new Error("User data not found in database");
    }
    
    const userData = userDoc.data();
    const role = userData.role as UserRole;
    
    console.log("Login successful:", user.email, "with role:", role);
    
    // 3. Return user data with role
    return {
      uid: user.uid,
      email: user.email,
      role: role
    };
  } catch (error: any) {
    console.error("Login error:", error.code, error.message);
    throw error;
  }
}

// Register function with role
export async function register(
  email: string, 
  password: string, 
  role: UserRole = "user" // Default role adalah "user"
) {
  try {
    // Create auth user
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: role,
      createdAt: serverTimestamp(),
    });

    console.log("Registration successful:", user.email, "with role:", role);
    
    return {
      uid: user.uid,
      email: user.email,
      role: role
    };
  } catch (error: any) {
    console.error("Registration error:", error.code, error.message);
    throw error;
  }
}

// Get user role from Firestore
export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data().role as UserRole;
    }
    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

// Get user data with role
export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid: uid,
        email: data.email,
        role: data.role as UserRole
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

// Logout function
export async function logout() {
  try {
    await signOut(auth);
    console.log("Logout successful");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser;
}