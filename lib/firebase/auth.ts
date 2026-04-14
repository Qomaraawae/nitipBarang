import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { logger, maskUid, maskEmail } from "@/lib/logger";

// Set persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  logger.error("Error setting auth persistence", error);
});

export type UserRole = "admin" | "user";

export interface UserData {
  uid: string;
  email: string | null;
  role: UserRole;
}

// Fungsi untuk cek apakah user exists
export async function checkUserExists(email: string) {
  try {
    await signInWithEmailAndPassword(auth, email, "dummy-password-for-check");
    return true;
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      return false;
    }
    if (error.code === "auth/wrong-password") {
      return true;
    }
    return false;
  }
}

// Login function - FIXED VERSION
export async function login(
  email: string,
  password: string,
): Promise<UserData> {
  // Validasi input
  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  try {
    console.log("🔐 [LOGIN] Attempting login for:", cleanEmail);

    // 1. Login to Firebase Auth
    const result = await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      cleanPassword,
    );
    const user = result.user;

    console.log("✅ [LOGIN] Firebase Auth successful, UID:", user.uid);

    // 2. Get user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    let role: UserRole = "user";

    if (!userDoc.exists()) {
      console.log("⚠️ [LOGIN] User document not found, creating new one...");

      // Create user document if it doesn't exist
      const userData = {
        email: user.email,
        role: "user" as UserRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userData);
      console.log("✅ [LOGIN] New user document created");

      logger.warn("User document created during login", {
        uid: maskUid(user.uid),
        email: maskEmail(email),
      });
    } else {
      const userData = userDoc.data();
      role = userData.role as UserRole;
      console.log("✅ [LOGIN] User document found, role:", role);
    }

    logger.auth.login(email, role);

    console.log("🎉 [LOGIN] Login successful, returning user data");

    return {
      uid: user.uid,
      email: user.email,
      role: role,
    };
  } catch (error: any) {
    console.error("❌ [LOGIN] Login failed:", error.code, error.message);

    // Throw error yang lebih jelas
    if (error.code === "auth/invalid-credential") {
      throw new Error("Email atau password salah. Periksa kembali data Anda.");
    }
    if (error.code === "auth/user-not-found") {
      throw new Error("Email tidak terdaftar. Silakan daftar terlebih dahulu.");
    }
    if (error.code === "auth/wrong-password") {
      throw new Error("Password salah. Silakan coba lagi.");
    }

    throw error;
  }
}

// Register function
export async function register(
  email: string,
  password: string,
  role: UserRole = "user",
) {
  // Validasi input
  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  if (password.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  try {
    console.log("📝 [REGISTER] Attempting registration for:", cleanEmail);

    // Create auth user
    const result = await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      cleanPassword,
    );
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

    logger.auth.register(email, role);

    return {
      uid: user.uid,
      email: user.email,
      role: role,
    };
  } catch (error: any) {
    console.error("❌ [REGISTER] Registration failed:", error.message);
    logger.error("Registration failed", {
      errorCode: error.code,
      errorMessage: error.message,
      email: maskEmail(email),
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
        role: role,
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
      error,
    });
    return null;
  }
}

// Get user data
export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    console.log("👤 [GET USER DATA] Getting data for UID:", maskUid(uid));
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      const userData = {
        uid: uid,
        email: data.email,
        role: data.role as UserRole,
      };

      console.log("✅ [GET USER DATA] User data found:", {
        email: data.email,
        role: data.role,
      });

      logger.log("Retrieved user data", {
        uid: maskUid(userData.uid),
        email: maskEmail(userData.email),
        role: userData.role,
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
      error,
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
      email: user.email,
    });
  } else {
    console.log("👤 [CURRENT USER] No user logged in");
  }

  if (process.env.NODE_ENV === "development" && user) {
    logger.log("Current user data", {
      uid: maskUid(user.uid),
      email: maskEmail(user.email),
      emailVerified: user.emailVerified,
    });
  }

  return user;
}

// Utility untuk mendapatkan auth state
export function onAuthStateChange(callback: (user: User | null) => void) {
  return auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("🔄 [AUTH STATE] User logged in:", user.email);
      logger.auth.login(maskEmail(user.email), "unknown");
    } else {
      console.log("🔄 [AUTH STATE] User logged out");
      logger.auth.logout(null);
    }
    callback(user);
  });
}
