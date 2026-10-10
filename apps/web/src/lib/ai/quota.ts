import { SIGNUP_CREDITS } from "@/lib/credits";

/**
 * Kredit gratis akun baru, dengan nama lamanya. Sejak migration 00010 jatah
 * "2 deck AI per akun" menjadi saldo kredit (1 kredit = 1 deck jadi); teks
 * marketing yang menyebut angka ini tetap benar karena nilainya sama.
 */
export const AI_GENERATION_LIMIT = SIGNUP_CREDITS;
