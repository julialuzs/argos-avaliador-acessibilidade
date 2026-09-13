/**
 * Endpoint público da API Argos para envio de relatórios (pipeline/CLI).
 * A variável ARGOS_API_RELATORIOS_ENDPOINT só é usada quando a própria API
 * dispara o avaliador e precisa apontar para si mesma (localhost).
 */
export const API_RELATORIOS_ENDPOINT =
  process.env.ARGOS_API_RELATORIOS_ENDPOINT?.trim() ||
  "https://argos-acessibilidade.com.br/api/relatorios";
