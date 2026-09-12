/**
 * Régénère ./schema-ddl.ts depuis la base courante.
 * Exécution : cd packages/web && bun --env-file=../../.env src/api/database/generate-ddl.ts
 *
 * Le fichier généré est embarqué dans le bundle serveur : il permet de créer
 * le schéma au démarrage d'un déploiement dont la base est encore vide.
 */
import { sql } from "drizzle-orm";
import { db } from "./__client";

const HEADER = `/**
 * Schéma SQL complet, généré depuis la base de développement.
 * Sert au démarrage (voir ./bootstrap.ts) à créer les tables dans une base
 * vide — cas d'un nouveau déploiement où le fichier SQLite n'existe pas encore.
 * À régénérer après toute modification de ./schema.ts :
 *   bun --env-file=../../.env src/api/database/generate-ddl.ts
 */
export const SCHEMA_DDL: readonly string[] = [
`;

const rows = await db.all<{ type: string; name: string; sql: string | null }>(sql`
  select type, name, sql from sqlite_master
  where sql is not null and name not like 'sqlite_%'
  order by case type when 'table' then 0 else 1 end, name
`);

const statements = rows
  .filter((r) => r.sql)
  .map((r) => {
    const one = r.sql!.split(/\s+/).join(" ");
    return r.type === "table"
      ? one.replace("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ")
      : one
          .replace("CREATE UNIQUE INDEX ", "CREATE UNIQUE INDEX IF NOT EXISTS ")
          .replace("CREATE INDEX ", "CREATE INDEX IF NOT EXISTS ");
  });

const body = statements.map((s) => `  ${JSON.stringify(s)},\n`).join("");
await Bun.write(`${import.meta.dirname}/schema-ddl.ts`, `${HEADER}${body}];\n`);
console.log(`schema-ddl.ts régénéré : ${statements.length} instructions`);
