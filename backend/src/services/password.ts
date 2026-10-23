import bcrypt from "bcryptjs";
import { config } from "../config.js";

/**
 * Hachage des mots de passe avec bcrypt (RF-01).
 * On utilise « bcryptjs » (implémentation 100 % JavaScript du même algorithme)
 * plutôt que « bcrypt » (module natif C++) : aucune compilation n'est nécessaire
 * dans l'image Alpine, et le format de hachage ($2b$…) est identique.
 * Le sel est généré automatiquement et stocké dans le hachage lui-même.
 */
export function hashPassword(plain: string, rounds: number = config.bcryptRounds): Promise<string> {
  return bcrypt.hash(plain, rounds);
}

/** Comparaison à temps constant entre le mot de passe saisi et le hachage stocké. */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
