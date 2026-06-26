import type { Metadata, Viewport } from "next";
import { Geist_Mono, Lato } from "next/font/google";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OficioCerca Mendoza | Oficios con tracking en vivo",
  description:
    "Marketplace de oficios para Mendoza con clientes, trabajadores, administracion, Supabase y Google Maps.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "OficioCerca",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#121f3d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${lato.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
