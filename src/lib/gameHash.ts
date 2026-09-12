import { customAlphabet } from "nanoid";

// Unambiguous alphabet — no 0/O, 1/l/I — so a hash is easy to read/type back.
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const nanoid = customAlphabet(ALPHABET, 5);

/** A random 5-character game hash. Collision-checked by the caller. */
export function generateGameHash(): string {
  return nanoid();
}
