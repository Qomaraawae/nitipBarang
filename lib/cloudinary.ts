import { logger } from "./logger";

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
    logger.error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set!");
    throw new Error("Konfigurasi Cloudinary belum diatur. Hubungi admin.");
  }

  // Siapkan form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "penitipan_barang");

  logger.log("Uploading to Cloudinary...", { 
    fileName: file.name, 
    fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    fileType: file.type 
  });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      logger.error("Cloudinary upload error:", {
        status: response.status,
        fileName: file.name,
        error: errorData
      });
      throw new Error(`Upload failed: ${errorData.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    logger.log("Upload successful", {
      fileName: file.name,
      url: data.secure_url
    });
    
    return data.secure_url;
  } catch (error) {
    logger.error("Error uploading to Cloudinary:", {
      fileName: file.name,
      error: error
    });
    throw error;
  }
}