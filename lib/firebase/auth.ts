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
import { logger, maskUid, maskEmail } from "@/lib/logger";

// Set persistence
setPersistence(auth, browserLocalPersistence).catch(error => {
  logger.error("Error setting auth persistence", error);
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
      logger.error("User data not found in database", { 
        uid: maskUid(user.uid),
        email: maskEmail(email)
      });
      throw new Error("User data not found in database");
    }
    
    const userData = userDoc.data();
    const role = userData.role as UserRole;
    
    // Gunakan logger.auth yang aman
    logger.auth.login(email, role);
    
    // 3. Return user data with role
    return {
      uid: user.uid,
      email: user.email,
      role: role
    };
  } catch (error: any) {
    // Log error dengan data yang disensor
    logger.error("Login failed", {
      errorCode: error.code,
      errorMessage: error.message,
      email: maskEmail(email) // Email dimask
    });
    
    throw error;
  }
}

// Register function dengan logging aman
export async function register(
  email: string, 
  password: string, 
  role: UserRole = "user"
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

    // Gunakan logger.auth yang aman
    logger.auth.register(email, role);
    
    return {
      uid: user.uid,
      email: user.email,
      role: role
    };
  } catch (error: any) {
    logger.error("Registration failed", {
      errorCode: error.code,
      errorMessage: error.message,
      email: maskEmail(email)
    });
    
    throw error;
  }
}

// Get user role from Firestore
export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role as UserRole;
      logger.log("Retrieved user role", {
        uid: maskUid(uid),
        role: role
      });
      return role;
    }
    logger.warn("User document not found", { uid: maskUid(uid) });
    return null;
  } catch (error) {
    logger.error("Error getting user role", { 
      uid: maskUid(uid),
      error 
    });
    return null;
  }
}

// Get user data dengan logging aman
export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      const userData = {
        uid: uid,
        email: data.email,
        role: data.role as UserRole
      };
      
      // Gunakan logger.log biasa (data akan di-sanitize otomatis)
      logger.log("Retrieved user data", { 
        uid: maskUid(userData.uid),
        email: maskEmail(userData.email),
        role: userData.role
      });
      
      return userData;
    }
    logger.warn("User data not found", { uid: maskUid(uid) });
    return null;
  } catch (error) {
    logger.error("Error getting user data", { 
      uid: maskUid(uid),
      error 
    });
    return null;
  }
}

// Logout function
export async function logout() {
  try {
    const currentUser = auth.currentUser;
    await signOut(auth);
    
    // Gunakan logger.auth yang aman
    logger.auth.logout(currentUser?.email || null);
  } catch (error) {
    logger.error("Logout failed", error);
    throw error;
  }
}

// Get current user
export function getCurrentUser(): User | null {
  const user = auth.currentUser;
  
  // Debug logging hanya di development dengan data disensor
  if (process.env.NODE_ENV === 'development' && user) {
    logger.log("Current user data", {
      uid: maskUid(user.uid),
      email: maskEmail(user.email),
      emailVerified: user.emailVerified
    });
  }
  
  return user;
}

// Utility untuk mendapatkan auth state dengan logging
export function onAuthStateChange(callback: (user: User | null) => void) {
  return auth.onAuthStateChanged((user) => {
    if (user) {
      logger.auth.login(maskEmail(user.email), 'unknown'); // Email dimask
    } else {
      logger.auth.logout(null);
    }
    callback(user);
  });
}