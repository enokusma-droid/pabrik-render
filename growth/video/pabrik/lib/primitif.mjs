// Registry semua primitif adegan pabrik reels (umum + khas konsep). Dokumentasi otomatis: node bangun.mjs --daftar > PRIMITIF.md
import { UMUM } from "./primitif-umum.mjs";
import { KONSEP } from "./primitif-konsep.mjs";
export const REG = { ...UMUM, ...KONSEP };
