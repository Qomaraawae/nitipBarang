/**
 * Script untuk membuat user admin
 * 
 * Setup:
 * 1. Copy .env.example ke .env
 * 2. Isi credentials Firebase di .env
 * 3. Jalankan: npx ts-node scripts/createAdmin.ts
 */

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import * as readline from "readline";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validasi environment variables
const requiredEnvVars = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID"
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Validasi email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validasi password strength
function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password harus minimal 8 karakter" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password harus mengandung huruf besar" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password harus mengandung huruf kecil" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password harus mengandung angka" };
  }
  return { valid: true, message: "Password kuat" };
}

async function createAdminUser(email: string, password: string) {
  try {
    // Validasi input
    if (!isValidEmail(email)) {
      throw new Error("Format email tidak valid");
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      throw new Error(passwordCheck.message);
    }

    console.log("\n🔄 Creating admin user...");
    
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save to Firestore with admin role
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "admin",
      displayName: "Administrator",
      createdAt: serverTimestamp(),
      createdBy: "system",
    });
    
    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:", email);
    console.log("🆔 UID:", user.uid);
    console.log("👑 Role: admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🔐 SIMPAN CREDENTIALS INI DI TEMPAT AMAN!");
    console.log("⚠️  Jangan share password ke siapapun.\n");
    
  } catch (error: any) {
    console.error("\n❌ Error creating admin:");
    
    // Specific error messages
    if (error.code === "auth/email-already-in-use") {
      console.error("Email sudah terdaftar. Gunakan email lain.");
    } else if (error.code === "auth/weak-password") {
      console.error("Password terlalu lemah. Gunakan minimal 6 karakter.");
    } else if (error.code === "auth/invalid-email") {
      console.error("Format email tidak valid.");
    } else {
      console.error(error.message);
    }
    
    throw error;
  }
}

// Interactive prompt
async function promptCredentials(): Promise<{ email: string; password: string }> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("📧 Enter admin email: ", (email) => {
      rl.question("🔐 Enter admin password (min 8 chars, uppercase, lowercase, number): ", (password) => {
        rl.close();
        resolve({ email: email.trim(), password });
      });
    });
  });
}

// Main execution
async function main() {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("   NITIP BARANG - ADMIN SETUP");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Get credentials from prompt
    const { email, password } = await promptCredentials();
    
    // Create admin
    await createAdminUser(email, password);
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

main();
