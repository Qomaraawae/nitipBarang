"use client";
import { useAuth } from "@/context/AuthContext";
import { useBarangRealTime } from "@/hooks/useBarang";
import Link from "next/link";
import { logout } from "@/lib/firebase/auth";
import { Barang } from "@/types/barang";
import { ModeToggle } from "@/components/mode-toggle";

export default function Dashboard() {
  const { user, role, userData, loading: authLoading } = useAuth();
  const { barang, loading: dataLoading } = useBarangRealTime();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Get user name from email (before @)
  const getUserName = (): string => {
    if (!user?.email) return "User";
    return user.email.split("@")[0];
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = role === "admin";
  const userBarang = barang.filter((b: Barang) => b.user_id === user.uid);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 py-2 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Bagian Kiri: Logo & Judul */}
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                <svg
                  className="w-3 h-3 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm sm:text-xl md:text-2xl font-bold text-foreground truncate">
                  Penitipan Barang
                </h1>
                <div className="flex items-center space-x-1">
                  <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
                    Dashboard
                  </p>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full flex-shrink-0 ${
                      isAdmin
                        ? "bg-destructive/10 text-destructive dark:bg-destructive/20"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    }`}
                  >
                    {role?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bagian Kanan: Mode Toggle, Info User & Logout */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mode Toggle Button */}
              <ModeToggle />

              {/* Info User untuk Desktop */}
              <div className="hidden sm:flex items-center space-x-3 text-right min-w-0">
                <div className="text-right min-w-0">
                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    {user.email}
                  </p>
                  <div className="flex items-center justify-end space-x-1">
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? "Administrator" : "Pengguna"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tombol Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center p-1.5 sm:p-2 sm:px-4 sm:py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors duration-200 font-medium text-xs sm:text-base whitespace-nowrap"
                title="Logout"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline ml-1">Logout</span>
              </button>
            </div>
          </div>

          {/* Info User untuk Mobile - di bawah judul */}
          <div className="sm:hidden mt-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">
                  {user.email}
                </p>
                <div className="flex items-center space-x-1">
                  <p className="text-[10px] text-muted-foreground">
                    {isAdmin ? "Administrator" : "Pengguna"}
                  </p>
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isAdmin ? "bg-destructive" : "bg-green-500"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {isAdmin ? (
          // ADMIN VIEW - Stats Cards
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md border border-border hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    Total Barang
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {dataLoading ? "..." : barang.length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md border border-border hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    Slot Terisi
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {dataLoading ? "..." : `${barang.length}/50`}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md border border-border hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                    Slot Kosong
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {dataLoading ? "..." : 50 - barang.length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // USER VIEW - Welcome Greeting Card
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-xl sm:rounded-2xl shadow-lg border border-blue-100 dark:border-blue-800/50 overflow-hidden mb-6 sm:mb-8">
            <div className="p-6 sm:p-8 md:p-12">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 sm:mb-6">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                  Hai {getUserName()}, selamat datang di Nitip Barang! 👋
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Anda bisa menitipkan barang dengan menekan tombol{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    "Titip Barang"
                  </span>{" "}
                  di bawah ini.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Different for Admin vs User */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          {isAdmin ? (
            // Admin buttons
            <>
              <Link
                href="/titip"
                className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] w-full sm:w-auto flex-1 sm:flex-none min-w-[200px] max-w-[400px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative px-4 py-3 sm:px-6 sm:py-4 flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="block text-sm sm:text-lg font-bold truncate">
                      TITIP BARANG
                    </span>
                    <p className="text-blue-100 text-xs truncate">
                      Tambah barang baru
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/ambil"
                className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] w-full sm:w-auto flex-1 sm:flex-none min-w-[200px] max-w-[400px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative px-4 py-3 sm:px-6 sm:py-4 flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="block text-sm sm:text-lg font-bold truncate">
                      AMBIL BARANG
                    </span>
                    <p className="text-green-100 text-xs truncate">
                      Proses pengambilan
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/histori"
                className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] w-full sm:w-auto flex-1 sm:flex-none min-w-[200px] max-w-[400px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative px-4 py-3 sm:px-6 sm:py-4 flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="block text-sm sm:text-lg font-bold truncate">
                      HISTORI
                    </span>
                    <p className="text-purple-100 text-xs truncate">
                      Riwayat aktivitas
                    </p>
                  </div>
                </div>
              </Link>
            </>
          ) : (
            // User button - hanya bisa titip barang
            <Link
              href="/titip"
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] w-full sm:w-auto flex-1 sm:flex-none min-w-[200px] max-w-[400px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative px-4 py-3 sm:px-6 sm:py-4 flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className="block text-sm sm:text-lg font-bold truncate">
                    TITIP BARANG
                  </span>
                  <p className="text-blue-100 text-sm hidden sm:block">
                    Titipkan barang Anda sekarang
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Barang List */}
        <div className="bg-card rounded-xl sm:rounded-2xl shadow-md border border-border overflow-hidden">
          <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-border bg-gradient-to-r from-secondary/50 to-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
                {isAdmin ? "Semua Barang Dititipkan" : "Barang Saya"}
              </h2>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
                {dataLoading
                  ? "..."
                  : isAdmin
                  ? `${barang.length} Items`
                  : `${userBarang.length} Items`}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {dataLoading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mb-3 sm:mb-4"></div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Memuat data dari Firebase...
                </p>
              </div>
            ) : (
              (() => {
                const displayBarang = isAdmin ? barang : userBarang;
                return displayBarang.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <p className="text-muted-foreground text-base sm:text-lg font-medium text-center">
                      {isAdmin
                        ? "Belum ada barang dititipkan"
                        : "Anda belum menitipkan barang"}
                    </p>
                    <p className="text-muted-foreground/70 text-xs sm:text-sm mt-1 text-center">
                      Mulai tambahkan barang dengan klik tombol "Titip Barang"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayBarang.map((b: Barang) => (
                      <div
                        key={b.id}
                        className="group bg-gradient-to-r from-secondary/30 to-card hover:from-primary/5 hover:to-primary/10 border border-border hover:border-primary/50 rounded-lg sm:rounded-xl p-3 sm:p-5 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                              {b.slot}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base sm:text-lg font-bold text-foreground mb-1 truncate">
                                {b.nama_pemilik}
                              </p>
                              <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-muted-foreground">
                                <span className="flex items-center space-x-1">
                                  <svg
                                    className="w-3 h-3 sm:w-4 sm:h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                    />
                                  </svg>
                                  <span>
                                    Kode:{" "}
                                    <strong className="text-foreground">
                                      {b.kode_ambil}
                                    </strong>
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <Link
                            href={`/barang/${b.kode_ambil}`}
                            className="flex items-center justify-center sm:justify-start space-x-2 px-3 py-2 sm:px-4 sm:py-2 bg-primary/10 group-hover:bg-primary/20 text-primary rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base whitespace-nowrap"
                          >
                            <span>Detail</span>
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
