import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Pièces justificatives des livreurs (permis, identité, carte grise).
 * Stockage sur disque hors du dossier public : ces fichiers ne sont jamais
 * servis en direct, seule une route admin authentifiée peut les lire.
 * En production : UPLOADS_DIR=/var/lib/lbg-express/uploads
 */
export function uploadsDir(): string {
  return process.env.UPLOADS_DIR ?? path.join(tmpdir(), "lbg-uploads");
}

const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/heic", "heic"],
  ["application/pdf", "pdf"],
]);

/** 8 Mo : une photo de permis prise au téléphone tient largement dedans. */
export const MAX_DOC_BYTES = 8 * 1024 * 1024;

export function extensionFor(contentType: string): string | null {
  return ALLOWED.get(contentType.toLowerCase().split(";")[0]?.trim() ?? "") ?? null;
}

/** Écrit un document et renvoie sa clé (nom de fichier opaque). */
export async function saveDoc(bytes: ArrayBuffer | Uint8Array, contentType: string): Promise<string> {
  const ext = extensionFor(contentType);
  if (!ext) throw new Error("Format non accepté : JPG, PNG, WEBP, HEIC ou PDF uniquement");
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  const key = `${Date.now().toString(36)}-${randomBytes(12).toString("hex")}.${ext}`;
  await writeFile(path.join(dir, key), Buffer.from(bytes as ArrayBuffer));
  return key;
}

/** Chemin absolu d'une clé, en refusant toute tentative de traversée de dossier. */
export function docPath(key: string): string | null {
  if (!/^[a-z0-9]+-[a-f0-9]{24}\.(jpg|png|webp|heic|pdf)$/i.test(key)) return null;
  return path.join(uploadsDir(), key);
}

export function contentTypeFor(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic") return "image/heic";
  if (ext === "pdf") return "application/pdf";
  return "image/jpeg";
}
