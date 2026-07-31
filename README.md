# ARGOS - Auditoria Continua de Acessibilidade Web

Ferramenta criada em Node.js + TypeScript com o objetivo de auxiliar a validação da acessbilidade em sites, de maneira automatizada e integrada em processos de integração/deploy contínuo.

## O que faz

- Recebe uma URL via CLI.
- Executa auditoria com:
  - axe-core via Playwright
  - W3C Nu Validator (opcional, quando a API estiver acessivel)
  - W3C CSS Validator (opcional, quando a API estiver acessivel)
- Detecta tecnologias assistivas brasileiras:
  - VLibras
  - Hand Talk
- Consolida achados em um unico objeto estruturado com:
  - severidade normalizada
  - mapeamento simplificado eMAG
  - recomendacoes resumidas
- Gera saida:
  - JSON (`report.json`)
  - resumo legível no terminal

## Requisitos

- Node.js 20+

## Instalacao

```bash
npm install
npx playwright install chromium
```

## Uso

```bash
npm run audit -- https://www.gov.br
```

Opcoes:

- `--no-w3c` desativa validacao W3C
- `--json ./saida/meu-relatorio.json` altera caminho do JSON

Exemplo completo:

```bash
npm run audit -- https://www.gov.br --json ./reports/report-gov.json
```

## Estrutura

```text
src/
  auditors/
    axe-auditor.ts
    w3c-auditor.ts
  config/
    raw-report-writer.ts
    enrichment.ts
    translator.ts
  handlers/
    auth-handler.ts
  mappers/
    emag-mapper.ts
  reporters/
    html-reporter.ts
    json-reporter.ts
    report-generator.ts
    terminal-reporter.ts
  mapper.ts
  index.ts
  types.ts
```

## Observacoes

- O mapeamento eMAG desta POC e simplificado por palavras-chave.
- Para uso produtivo, recomenda-se evoluir para mapeamento formal por regra WCAG/eMAG e incorporar historico para auditoria continua.
