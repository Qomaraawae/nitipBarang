import { collection, CollectionReference, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Barang } from "../types";

// Export collection references
export const barangCollection = collection(db, "barang") as CollectionReference<Barang>;
export const historiCollection = collection(db, "histori");

// Fungsi untuk menambah histori
export const tambahHistori = async (data: {
  userId: string;
  jenis: "titip" | "ambil";
  barangId?: string;
  namaBarang: string;
  namaPemilik: string;
  slot: number;
  kodeAmbil: string;
  status?: "berhasil" | "gagal";
  catatan?: string;
}) => {
  try {
    const docRef = await addDoc(historiCollection, {
      ...data,
      tanggal: serverTimestamp(),
      status: data.status || "berhasil"
    });
    console.log("Histori ditambahkan dengan ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error menambahkan histori: ", error);
    throw error;
  }
};