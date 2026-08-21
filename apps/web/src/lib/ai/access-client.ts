"use client";

/**
 * Boleh-tidaknya akun ini generate deck AI lagi (akses aktif dan jatah belum
 * habis), dibaca dari /api/ai-access.
 *
 * Disimpan di tingkat modul, bukan di dalam komponen: BottomNav ter-mount ulang
 * tiap pindah rute, dan tanpa cache di sini tiap pindah tab menembak API-nya
 * lagi padahal jawabannya sama.
 */
let cached: boolean | undefined;
let inFlight: Promise<boolean> | null = null;

export function cachedAiAccess(): boolean | undefined {
  return cached;
}

export function fetchAiAccess(): Promise<boolean> {
  inFlight ??= fetch("/api/ai-access")
    .then((res) => (res.ok ? res.json() : null))
    .then((body) => {
      cached = body?.canUseAi === true;
      return cached;
    })
    .catch(() => {
      // Jaringan putus bukan jawaban "tidak boleh". Dilepas supaya navigasi
      // berikutnya mencoba lagi, bukan terkunci pada kegagalan sesaat.
      inFlight = null;
      return false;
    });

  return inFlight;
}

/**
 * Dipanggil setelah satu generate berhasil: jatahnya berkurang, jadi nilai
 * yang tersimpan sudah basi — kalau itu jatah terakhir, gembok di nav harus
 * muncul. Nilainya diambil ulang saat nav ter-mount di halaman berikutnya.
 */
export function invalidateAiAccess() {
  cached = undefined;
  inFlight = null;
}
