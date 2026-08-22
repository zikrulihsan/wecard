import type { Metadata, Viewport } from "next";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlipCard — Kartu Ngobrol Biar Ngumpul Nggak Krik-Krik",
  description:
    "Kartu pertanyaan & tantangan buat ngobrol sama pasangan, sahabat, keluarga, atau anak — atau bikin deck sendiri pakai AI sesuai situasimu. Dua deck AI pertama gratis.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#e91e63",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
