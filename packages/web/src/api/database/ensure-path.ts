/**
 * Prépare l'emplacement de la base SQLite AVANT que ./__client.ts n'ouvre la
 * connexion (les imports ESM sont évalués dans l'ordre de déclaration, ce
 * module est donc importé en premier dans ./index.ts).
 *
 * Pourquoi : DATABASE_URL peut désigner un chemin absolu qui n'existe pas sur
 * la machine cible (déploiement, autre serveur). libsql lève alors une erreur
 * au chargement du module et le serveur ne démarre jamais — l'échec se voit
 * seulement au health check du déploiement. On crée donc le dossier parent, et
 * à défaut on bascule sur un emplacement inscriptible.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

/** "file:./local.db" ou "file:/chemin/local.db" -> chemin sur le disque. */
function filePathFromUrl(url: string): string | null {
  if (!url.startsWith("file:")) return null;
  const raw = url.slice("file:".length).replace(/^\/\//, "");
  const withoutQuery = raw.split("?")[0] ?? raw;
  if (!withoutQuery) return null;
  // path.resolve() à un argument résout contre le dossier courant du process.
  return path.isAbsolute(withoutQuery) ? withoutQuery : path.resolve(withoutQuery);
}

/** Le dossier existe-t-il (ou peut-il être créé) et le fichier est-il inscriptible ? */
function usable(file: string): boolean {
  try {
    mkdirSync(path.dirname(file), { recursive: true });
    // Touche le fichier sans l'écraser s'il existe : révèle un disque en lecture seule.
    writeFileSync(file, "", { flag: "a" });
    return true;
  } catch {
    return false;
  }
}

const url = process.env.DATABASE_URL ?? "";
const target = filePathFromUrl(url);

if (target && !usable(target)) {
  const fallbacks = [
    path.resolve(path.basename(target)),
    path.join(tmpdir(), path.basename(target)),
  ];
  const next = fallbacks.find((candidate) => candidate !== target && usable(candidate));
  if (next) {
    console.warn(`[database] ${target} inutilisable, bascule sur ${next}`);
    process.env.DATABASE_URL = `file:${next}`;
  } else {
    console.error(`[database] aucun emplacement inscriptible pour ${target}`);
  }
}
