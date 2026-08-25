/**
 * Endpoint da API Argos para envio de relatórios.
 * Pode ser sobrescrito pela variável ARGOS_API_RELATORIOS_ENDPOINT.
 */
export const API_RELATORIOS_ENDPOINT =
  process.env.ARGOS_API_RELATORIOS_ENDPOINT?.trim() ||
  "https://localhost:7202/relatorios";
