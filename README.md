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

Na raiz do projeto, crie um `argos.config.json`:

```json
{
  "baseUrl": "https://seu-site.exemplo",
  "routes": ["/", "/sobre"],
  "includeW3c": true
}
```

O Chromium do Playwright é instalado automaticamente na primeira execução.

## Uso

Na raiz do projeto (onde está o `argos.config.json`):

```bash
npx argos-avaliador-acessibilidade
```

O CLI lê `argos.config.json` e grava `reports/report.json` por padrão. Opções:

- `--config <arquivo.json>` — outro arquivo de configuração
- `--out <arquivo.json>` — outro caminho para o relatório

Para pular a instalação automática do Chromium (se você já cuida disso), defina `ARGOS_SKIP_BROWSER_INSTALL=1`.

## Pipeline (qualquer CD)

O mesmo comando vale no GitHub Actions, GitLab, Azure DevOps, Jenkins ou localmente:

```bash
npx argos-avaliador-acessibilidade
```

Exemplo no GitHub Actions:

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 22
- run: npx --yes argos-avaliador-acessibilidade
- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: accessibility-report
    path: reports/
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
