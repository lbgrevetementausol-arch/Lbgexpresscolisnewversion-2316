import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";
import ga4Plugin from "./vite/plugins/ga4-plugin";
import runableAnalyticsPlugin from "./vite/__plugins/runable-analytics-plugin";
import honoDevPlugin from "./vite/__plugins/hono-dev-plugin";
import assetOptimizerPlugin from "./vite/__plugins/asset-optimizer-plugin";
import ports from "../../__ports.cjs";

const root = path.resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");
  Object.assign(process.env, env);

  return {
    // All env files live at the repo root — keep Vite's own env loading there too,
    // so packages/web/.env* files can never shadow the root .env.
    envDir: root,
    plugins: [
      honoDevPlugin(),
      react(),
      // Analytics : en production, uniquement Google Analytics 4 (compte de
      // l'entreprise). L'analytics de l'atelier Runable ne sert qu'à l'aperçu
      // en développement et n'est jamais inclus dans le site publié.
      ...(mode === "production" ? [ga4Plugin()] : [runableAnalyticsPlugin()]),
      tailwind(),
      assetOptimizerPlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src/web"),
        // Le widget d'annotation de l'atelier Runable n'est utile qu'en
        // développement : en production il est remplacé par un composant vide,
        // afin que le site publié n'embarque aucun code de la plateforme.
        ...(mode === "production"
          ? {
              "@runablehq/website-runtime": path.resolve(
                __dirname,
                "./vite/stubs/website-runtime.tsx",
              ),
            }
          : {}),
      },
    },
    server: {
      port: ports.website,
      strictPort: true,
      allowedHosts: true,
      hmr: { overlay: false },
      cors: false,
    },
  };
});
