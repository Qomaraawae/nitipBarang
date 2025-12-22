"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/firebaseConfig";
import { useRouter, usePathname } from "next/navigation";
import { logger } from "@/lib/logger";

export type UserRole = "admin" | "user";

interface UserData {
  email: string;
  role: UserRole;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  role: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  role: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const ensureUserDocument = async (currentUser: User) => {
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        logger.log("Creating new user document");
        
        const defaultRole: UserRole = "user";
        
        const newUserData: UserData = {
          email: currentUser.email || "",
          role: defaultRole,
          createdAt: new Date(),
        };
        
        await setDoc(userDocRef, {
          ...newUserData,
          createdAt: serverTimestamp(),
        });
        
        logger.log("User document created");
        return newUserData;
      } else {
        return userDoc.data() as UserData;
      }
    } catch (error) {
      logger.error("Error ensuring user document:", error);
      return null;
    }
  };

  const fetchUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
        return data;
      } else {
        setUserData(null);
        return null;
      }
    } catch (error) {
      logger.error("Error fetching user data:", error);
      setUserData(null);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        await ensureUserDocument(currentUser);
        await fetchUserData(currentUser.uid);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
      setInitialCheckDone(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!initialCheckDone) return;

    const publicPages = ["/login", "/register"];
    const isPublicPage = publicPages.includes(pathname);
    
    if (!user && !isPublicPage) {
      router.replace("/login");
      return;
    }

    if (user && isPublicPage) {
      router.replace("/");
      return;
    }
  }, [user, userData, initialCheckDone, pathname, router]);

  if (loading || !initialCheckDone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userData, 
        role: userData?.role || null, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}