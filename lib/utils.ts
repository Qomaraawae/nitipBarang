export const formatTanggal = (timestamp: any) => {
  if (!timestamp) return "-";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString("id-ID");
};

export const generateKodeAmbil = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};