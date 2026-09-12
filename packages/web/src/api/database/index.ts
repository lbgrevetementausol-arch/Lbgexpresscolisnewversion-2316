// L'ordre des imports compte : ./ensure-path prépare le chemin du fichier
// SQLite avant que ./__client n'ouvre la connexion, puis ./bootstrap crée le
// schéma si la base est vide (déploiement neuf).
import "./ensure-path";
import "./bootstrap";

export { db } from "./__client";
