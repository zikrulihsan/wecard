"use client";

import { BackLink } from "./back-link";
import { CardLoader } from "@/components/ui/card-loader";
import { HomeHeader } from "@/app/(app)/home/header";
import { ProfileHeader } from "@/app/(app)/profile/header";
import { CreateHeader } from "@/app/(app)/create/header";

/**
 * Tampilan sementara selagi berpindah tab, digambar sepenuhnya di klien.
 *
 * Ini yang menjamin layar tidak pernah diam: ia tidak menunggu prefetch, tidak
 * menunggu function, tidak menunggu apa pun — begitu tab diketuk, ia bisa
 * langsung tampil.
 *
 * Bentuknya menyalin loading.tsx rute tujuan dengan memakai komponen header
 * yang sama persis, bukan salinan teksnya. Jadi saat kerangka asli dari server
 * menggantikan tampilan ini, tidak ada yang bergeser — pemain cuma melihat
 * satu tampilan, bukan dua yang berganti.
 */
export function NavigatingView({ href }: { href: string }) {
  if (href === "/home") {
    return (
      <div className="max-w-screen-sm mx-auto px-4 py-8">
        <HomeHeader />
        <CardLoader label="Mengambil daftar deck" />
      </div>
    );
  }

  if (href === "/profile") {
    // Tombol keluar sengaja tidak ikut: menampilkan tombol beraksi di atas
    // halaman yang sedang ditinggalkan cuma mengundang ketukan yang salah.
    return (
      <div className="max-w-screen-sm mx-auto px-4 py-8">
        <ProfileHeader />
        <CardLoader label="Mengambil profil" />
      </div>
    );
  }

  if (href === "/create") {
    return (
      <div className="max-w-screen-sm mx-auto px-4 py-6">
        <BackLink href="/home" />
        <CreateHeader />
        <CardLoader label="Menyiapkan formulir" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8">
      <CardLoader />
    </div>
  );
}
