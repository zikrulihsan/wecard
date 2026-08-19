import type { Metadata, Viewport } from "next";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlipCard — Kartu Buat Ngobrol Bareng",
  description:
    "Kartu pertanyaan & tantangan untuk ngobrol sama teman, keluarga, pasangan, atau siapa pun. Balik kartunya, obrolannya jalan sendiri.",
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
