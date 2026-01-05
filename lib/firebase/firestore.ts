import { collection, CollectionReference } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Barang } from "../types";

// Export collection references
export const barangCollection = collection(db, "barang") as CollectionReference<Barang>;
export const historiCollection = collection(db, "histori");