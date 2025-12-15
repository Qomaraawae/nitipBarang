import { getFirestore, collection, CollectionReference, DocumentData } from "firebase/firestore";
import { app } from "./firebaseConfig";
import { Barang } from "../types";

export const db = getFirestore(app);

export const barangCollection = collection(db, "barang") as CollectionReference<Barang>;