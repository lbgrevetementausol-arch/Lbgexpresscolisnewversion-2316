/**
 * Crée le schéma au démarrage lorsque la base est vide.
 *
 * Cas visé : un déploiement neuf, où le fichier SQLite vient d'être créé et ne
 * contient aucune table. Sans cela le serveur démarre mais chaque requête
 * échoue ("no such table"). Les instructions sont en CREATE ... IF NOT EXISTS
 * et ne touchent donc jamais une base déjà peuplée.
 */
import { sql } from "drizzle-orm";
import { db } from "./__client";
import { SCHEMA_DDL } from "./schema-ddl";

const existing = await db.get<{ count: number } | undefined>(sql`
  select count(*) as count from sqlite_master
  where type = 'table' and name not like 'sqlite_%'
`);

if (!existing?.count) {
  for (const statement of SCHEMA_DDL) {
    await db.run(sql.raw(statement));
  }
  console.log(`[database] base vide : ${SCHEMA_DDL.length} objets créés`);
}
