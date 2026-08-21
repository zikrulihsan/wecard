/**
 * Jatah generate deck AI per akun — sekali seumur akun, bukan per jam.
 *
 * Ditaruh di berkas sendiri, terpisah dari `access.ts`, supaya halaman yang
 * cuma perlu menyebut angkanya (landing page, salinan pemasaran) tidak ikut
 * menarik modul server: `access.ts` membaca cookie lewat `next/headers`, dan
 * itu tidak punya tempat di halaman statis.
 *
 * Kembarannya di sisi database ada di fungsi `public.ai_generation_limit()`
 * (migration 00005); kalau angkanya diubah, ubah keduanya.
 */
export const AI_GENERATION_LIMIT = 2;
