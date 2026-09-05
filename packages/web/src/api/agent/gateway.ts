import { createGateway } from "ai";

/** Passerelle IA managée — clés dans le .env racine. */
export const gateway = createGateway({
  baseURL: process.env.AI_GATEWAY_BASE_URL,
  apiKey: process.env.AI_GATEWAY_API_KEY,
});
