import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner"; // TAMBAHKAN INI
import "./globals.css";

// Optimasi font loading
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Untuk performance
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono", 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "NitipBarang",
  description: "Sistem manajemen penitipan barang yang aman dan terpercaya",
  keywords: ["penitipan", "barang", "titip", "ambil", "storage"],
  authors: [{ name: "NitipBarang Team" }],
  robots: "index, follow",
  openGraph: {
    title: "NitipBarang - Sistem Penitipan Barang",
    description: "Sistem manajemen penitipan barang yang aman dan terpercaya",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NitipBarang - Sistem Penitipan Barang",
    description: "Sistem manajemen penitipan barang yang aman dan terpercaya",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Metadata untuk PWA */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        {/* Preconnect untuk Cloudinary */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Skip link untuk accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-3 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to main content
        </a>
        
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
        
        {/* TAMBAHKAN Toaster di sini */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            className: "font-sans",
          }}
          expand={true}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}