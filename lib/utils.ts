import { barangCollection } from './firebase/firestore';
import { query, where, getDocs } from 'firebase/firestore';
import { logger } from './logger';

export const generateKodeAmbil = async (): Promise<string> => {
  const generateCode = () => {
    const timestamp = Date.now().toString(36).slice(-3);
    const random = Math.random().toString(36).substring(2, 5);
    const code = (timestamp + random).toUpperCase();
    
    logger.log("Generated code:", code, "Length:", code.length);
    
    return code;
  };
  
  let code = generateCode();
  let attempts = 0;
  
  while (attempts < 10) {
    const q = query(barangCollection, where("kode_ambil", "==", code));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      logger.log("Unique code found:", code);
      return code;
    }
    
    logger.warn("Code collision, regenerating...");
    code = generateCode();
    attempts++;
  }
  
  throw new Error("Failed to generate unique code after 10 attempts");
};