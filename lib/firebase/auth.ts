import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  User,
  getIdTokenResult
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

// Login function - FIXED VERSION
export async function login(email: string, password: string): Promise<UserData> {
  try {
    console.log("🔐 [LOGIN] Attempting login for:", email);
    
    // 1. Login to Firebase Auth
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    console.log("✅ [LOGIN] Firebase Auth successful, UID:", user.uid);
    
    // 2. Get user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    let role: UserRole = 'user';
    
    if (!userDoc.exists()) {
      console.log("⚠️ [LOGIN] User document not found, creating new one...");
      
      // Create user document if it doesn't exist
      const userData = {
        email: user.email,
        role: 'user' as UserRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, "users", user.uid), userData);
      console.log("✅ [LOGIN] New user document created");
      
      // Log warning instead of throwing error
      logger.warn("User document created during login", { 
        uid: maskUid(user.uid),
        email: maskEmail(email)
      });
    } else {
      const userData = userDoc.data();
      role = userData.role as UserRole;
      console.log("✅ [LOGIN] User document found, role:", role);
    }
    
    // Gunakan logger.auth yang aman
    logger.auth.login(email, role);
    
    console.log("🎉 [LOGIN] Login successful, returning user data");
    
    // 3. Return user data with role
    return {
      uid: user.uid,
      email: user.email,
      role: role
    };
  } catch (error: any) {
    console.error("❌ [LOGIN] Login failed with error:");
    console.error("   Code:", error.code);
    console.error("   Message:", error.message);
    console.error("   Full error:", error);
    
    // Log error dengan data yang disensor
    logger.error("Login failed", {
      errorCode: error.code,
      errorMessage: error.message,
      email: maskEmail(email)
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
    console.log("📝 [REGISTER] Attempting registration for:", email);
    
    // Create auth user
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    console.log("✅ [REGISTER] Firebase Auth registration successful");

    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("✅ [REGISTER] User document created in Firestore");
    
    // Gunakan logger.auth yang aman
    logger.auth.register(email, role);
    
    return {
      uid: user.uid,
      email: user.email,
      role: role
    };
  } catch (error: any) {
    console.error("❌ [REGISTER] Registration failed:", error.message);
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
    console.log("👑 [GET ROLE] Getting role for UID:", maskUid(uid));
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role as UserRole;
      console.log("✅ [GET ROLE] Role found:", role);
      logger.log("Retrieved user role", {
        uid: maskUid(uid),
        role: role
      });
      return role;
    }
    console.log("⚠️ [GET ROLE] User document not found");
    logger.warn("User document not found", { uid: maskUid(uid) });
    return null;
  } catch (error) {
    console.error("❌ [GET ROLE] Error getting user role:", error);
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
    console.log("👤 [GET USER DATA] Getting data for UID:", maskUid(uid));
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      const userData = {
        uid: uid,
        email: data.email,
        role: data.role as UserRole
      };
      
      console.log("✅ [GET USER DATA] User data found:", {
        email: data.email,
        role: data.role
      });
      
      logger.log("Retrieved user data", { 
        uid: maskUid(userData.uid),
        email: maskEmail(userData.email),
        role: userData.role
      });
      
      return userData;
    }
    console.log("⚠️ [GET USER DATA] User data not found");
    logger.warn("User data not found", { uid: maskUid(uid) });
    return null;
  } catch (error) {
    console.error("❌ [GET USER DATA] Error getting user data:", error);
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
    console.log("👋 [LOGOUT] Logging out user:", currentUser?.email);
    await signOut(auth);
    
    console.log("✅ [LOGOUT] Logout successful");
    
    // Gunakan logger.auth yang aman
    logger.auth.logout(currentUser?.email || null);
  } catch (error) {
    console.error("❌ [LOGOUT] Logout failed:", error);
    logger.error("Logout failed", error);
    throw error;
  }
}

// Get current user
export function getCurrentUser(): User | null {
  const user = auth.currentUser;
  
  if (user) {
    console.log("👤 [CURRENT USER] User found:", {
      uid: maskUid(user.uid),
      email: user.email
    });
  } else {
    console.log("👤 [CURRENT USER] No user logged in");
  }
  
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
      console.log("🔄 [AUTH STATE] User logged in:", user.email);
      logger.auth.login(maskEmail(user.email), 'unknown');
    } else {
      console.log("🔄 [AUTH STATE] User logged out");
      logger.auth.logout(null);
    }
    callback(user);
  });
}