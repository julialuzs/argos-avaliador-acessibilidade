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

Opções:

- `--no-w3c` desativa validacao W3C
- `--json ./saida/meu-relatorio.json` altera caminho do JSON

Exemplo completo:

```bash
npm run audit -- https://www.gov.br --json ./reports/report-gov.json
```

ou


```bash
npm run audit -- --config argos.config.ci.json --out reports/report.json
```

## Estrutura

```text
src/
├── auditors/
│   ├── axe/
│   │   └── axe-auditor.ts
│   ├── w3c/
│   │   ├── config.ts
│   │   ├── types.ts
│   │   ├── w3c-auditor.ts
│   │   └── w3c.service.ts
│   ├── assistive-tech-detector.ts
│   ├── audit-config.ts
│   ├── audit-runner.ts
│   └── types.ts
├── config/
│   ├── enrichment.ts
│   ├── raw-report-writer.ts
│   └── translator.ts
├── handlers/
│   └── auth-handler.ts
├── mappers/
│   └── emag-mapper.ts
├── reporters/
│   ├── json-reporter.ts
│   ├── report-generator.ts
│   └── terminal-reporter.ts
├── index.ts
├── mapper.ts
└── navigation-engine.ts
```
