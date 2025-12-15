export async function uploadToCloudinary(file: File): Promise<string> {
  // Validasi file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar!");
  }

  // Validasi ukuran file (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran file maksimal 5MB!");
  }

  // Ambil cloud name dari environment variable
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  // Validasi cloud name ada
  if (!cloudName) {
    console.error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set!");
    throw new Error("Konfigurasi Cloudinary belum diatur. Hubungi admin.");
  }

  // Siapkan form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "penitipan_barang"); // Sesuaikan dengan preset Anda

  console.log("Uploading to Cloudinary...", { cloudName });

  try {
    // Upload ke Cloudinary
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    
    // Cek response
    if (!res.ok) {
      console.error("Cloudinary error:", data);
      throw new Error(data.error?.message || "Upload gagal");
    }
    
    console.log("Upload success:", data.secure_url);
    return data.secure_url;
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new Error(error.message || "Upload gagal");
  }
}