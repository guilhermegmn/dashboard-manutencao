# Dashboard de Manutenção - KPIs

Dashboard interativo para monitoramento de performance de equipamentos industriais, com visualização de KPIs, análise de tendências e importação de dados via CSV.

## 📊 Características

- **KPIs em Tempo Real**: Visualização de MTBF, MTTR, Disponibilidade e Custo de Manutenção
- **Análise de Tendências**: Gráficos interativos mostrando evolução dos indicadores
- **Filtros Avançados**: Filtragem por período, categoria de equipamento e equipamento específico
- **Importação CSV**: Carregamento de dados customizados via arquivo CSV
- **Ranking de Equipamentos**: Tabela ordenada por disponibilidade com indicadores de tendência
- **Responsivo**: Interface adaptável para desktop, tablet e mobile

## 🚀 Tecnologias

### Core
- **[Next.js 15.5.3](https://nextjs.org/)** - Framework React com App Router
- **[React 19.1.0](https://react.dev/)** - Biblioteca UI
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Utility-first CSS

### UI & Visualização
- **[Recharts 3.2](https://recharts.org/)** - Gráficos interativos
- **[Radix UI](https://www.radix-ui.com/)** - Componentes headless acessíveis
- **[Lucide React](https://lucide.dev/)** - Ícones
- **[CVA](https://cva.style/)** - Variantes de componentes

### Utilitários
- **[PapaParse 5.5](https://www.papaparse.com/)** - Parser CSV
- **[clsx](https://github.com/lukeed/clsx)** + **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Gerenciamento de classes

### Testes
- **[Vitest 4](https://vitest.dev/)** - Framework de testes
- **[Testing Library](https://testing-library.com/)** - Testes de componentes React
- **[jsdom](https://github.com/jsdom/jsdom)** - Ambiente DOM para testes

### Qualidade de Código
- **[ESLint 9](https://eslint.org/)** - Linting
- **TypeScript Strict Mode** - Verificação rigorosa de tipos

## 📦 Instalação

### Pré-requisitos
- Node.js 20+
- npm, yarn, pnpm ou bun

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/dashboard-manutencao.git
cd dashboard-manutencao
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

4. **Abra no navegador**
```
http://localhost:3000
```

## 🎯 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| Desenvolvimento | `npm run dev` | Inicia servidor com Turbopack |
| Build | `npm run build` | Cria build de produção |
| Produção | `npm run start` | Inicia servidor de produção |
| Lint | `npm run lint` | Executa ESLint |
| Testes | `npm test` | Executa testes em modo watch |
| Testes (UI) | `npm run test:ui` | Abre interface de testes |
| Testes (CI) | `npm run test:run` | Executa testes uma vez |
| Cobertura | `npm run test:coverage` | Gera relatório de cobertura |

## 📁 Estrutura do Projeto

```
dashboard-manutencao/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Layout principal
│   │   ├── page.tsx                 # Página inicial
│   │   └── globals.css              # Estilos globais
│   ├── components/
│   │   ├── MaintenanceDashboard.tsx # Componente principal
│   │   ├── dashboard/               # Componentes do dashboard
│   │   │   ├── FilterPanel.tsx     # Painel de filtros
│   │   │   ├── KPICards.tsx        # Cards de KPI
│   │   │   ├── MaintenanceChart.tsx # Gráfico de tendências
│   │   │   ├── EquipmentTable.tsx  # Tabela de equipamentos
│   │   │   ├── CSVImportButton.tsx # Botões de importação
│   │   │   └── __tests__/          # Testes de componentes
│   │   └── ui/                      # Componentes UI reutilizáveis
│   │       ├── button.tsx
│   │       └── card.tsx
│   ├── hooks/
│   │   ├── useCSVImport.ts         # Hook de importação CSV
│   │   └── __tests__/
│   ├── lib/
│   │   ├── utils.ts                # Utilitários gerais
│   │   ├── equipmentData.ts        # Dados e constantes
│   │   └── __tests__/
│   └── types/
│       └── dashboard.ts             # Tipos TypeScript
├── public/                           # Arquivos estáticos
├── vitest.config.ts                 # Configuração Vitest
├── vitest.setup.ts                  # Setup de testes
├── next.config.ts                   # Configuração Next.js
├── tailwind.config.ts               # Configuração Tailwind
├── tsconfig.json                    # Configuração TypeScript
└── package.json

```

## 📊 Formato do CSV

### Estrutura do Arquivo

O arquivo CSV deve conter as seguintes colunas:

| Coluna | Tipo | Descrição | Exemplo |
|--------|------|-----------|---------|
| `id` | string | Identificador único do equipamento | `comp-a1` |
| `name` | string | Nome do equipamento | `Compressor A1` |
| `category` | string | Categoria do equipamento | `Compressão` |
| `month` | string | Mês abreviado (português) | `Jan`, `Fev`, `Mar` |
| `MTBF` | number | Mean Time Between Failures (horas) | `280` |
| `MTTR` | number | Mean Time To Repair (horas) | `3.4` |
| `Disponibilidade` | number | Porcentagem de disponibilidade | `90` |
| `Custo` | number | Custo de manutenção (milhões R$) | `0.5` |
| `Status` | string | Status atual do equipamento | `Operacional` |

### Exemplo de CSV

```csv
id,name,category,month,MTBF,MTTR,Disponibilidade,Custo,Status
comp-a1,Compressor A1,Compressão,Mai,280,3.4,90,0.5,Operacional
comp-a1,Compressor A1,Compressão,Jun,310,3.1,92,0.45,Operacional
comp-a1,Compressor A1,Compressão,Jul,360,2.8,95,0.4,Operacional
este-b2,Esteira B2,Movimentação,Mai,330,2.7,93,0.38,Manutenção Programada
este-b2,Esteira B2,Movimentação,Jun,360,2.6,95,0.36,Manutenção Programada
motor-c3,Motor C3,Motorização,Mai,270,3.2,91,0.62,Parado
motor-c3,Motor C3,Motorização,Jun,295,3.0,92,0.58,Parado
```

### Notas Importantes

- **Múltiplas linhas por equipamento**: Cada linha representa um mês de dados para um equipamento
- **Meses em português**: Use abreviações de 3 letras (Jan, Fev, Mar, Abr, Mai, Jun, Jul, Ago, Set, Out, Nov, Dez)
- **Status válidos**: `Operacional`, `Manutenção Programada`, `Parado`
- **Encoding**: UTF-8 recomendado
- **Download de template**: Use o botão "Baixar modelo CSV" no dashboard

## 🧪 Testes

### Executar Testes

```bash
# Modo watch (desenvolvimento)
npm test

# Executar uma vez
npm run test:run

# Com interface visual
npm run test:ui

# Com cobertura
npm run test:coverage
```

### Cobertura Atual

```
Test Files: 4 passed (4)
Tests: 30 passed (30)
```

**Componentes testados:**
- ✅ FilterPanel (7 testes)
- ✅ KPICards (5 testes)
- ✅ EquipmentTable (7 testes)
- ✅ equipmentData (11 testes)

## 🏗️ Arquitetura

### Princípios

- **Separação de responsabilidades**: Componentes focados em uma única tarefa
- **Composição**: Componentes pequenos e reutilizáveis
- **Type Safety**: TypeScript strict mode
- **Testabilidade**: Componentes isolados e testáveis
- **Acessibilidade**: Labels associados, navegação por teclado

### Padrões Utilizados

- **Custom Hooks**: Lógica reutilizável (ex: `useCSVImport`)
- **Component Composition**: Cards, Tabelas compostas
- **Controlled Components**: Filtros controlados por estado
- **Memoization**: `useMemo` para otimização de performance

## 🎨 Personalização

### Cores e Tema

As cores podem ser ajustadas em `src/app/globals.css` nas variáveis CSS customizadas.

### Períodos de Filtro

Edite `PERIODS` em `src/lib/equipmentData.ts`:

```typescript
export const PERIODS: Period[] = [
  { id: "1m", label: "Último mês", months: ["Ago"] },
  { id: "3m", label: "Últimos 3 meses", months: ["Jun", "Jul", "Ago"] },
  // Adicione mais períodos conforme necessário
];
```

### Threshold de Tendência

Ajuste `TREND_THRESHOLD` em `src/lib/equipmentData.ts` para modificar a sensibilidade dos indicadores de tendência:

```typescript
export const TREND_THRESHOLD = 0.5; // Padrão: 0.5%
```

## 📈 KPIs Calculados

### MTBF (Mean Time Between Failures)
**Fórmula**: Média do tempo entre falhas de todos os equipamentos filtrados
- ✅ Tendência positiva: Aumento no valor
- ❌ Tendência negativa: Diminuição no valor

### MTTR (Mean Time To Repair)
**Fórmula**: Média do tempo para reparo de todos os equipamentos filtrados
- ✅ Tendência positiva: Diminuição no valor (inverted)
- ❌ Tendência negativa: Aumento no valor (inverted)

### Disponibilidade
**Fórmula**: Média da porcentagem de disponibilidade
- ✅ Tendência positiva: Aumento no valor
- ❌ Tendência negativa: Diminuição no valor

### Custo de Manutenção
**Fórmula**: Soma dos custos de todos os equipamentos filtrados
- ✅ Tendência positiva: Diminuição no valor (inverted)
- ❌ Tendência negativa: Aumento no valor (inverted)

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub
2. Importe o projeto no [Vercel](https://vercel.com)
3. Deploy automático em cada push

### Docker

```bash
# Build da imagem
docker build -t dashboard-manutencao .

# Executar container
docker run -p 3000:3000 dashboard-manutencao
```

### Build manual

```bash
# Criar build de produção
npm run build

# Executar servidor de produção
npm run start
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Minha nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Convenções de Commit

- `Add:` Nova funcionalidade
- `Fix:` Correção de bug
- `Refactor:` Refatoração de código
- `Test:` Adição ou modificação de testes
- `Docs:` Atualização de documentação
- `Style:` Formatação, sem mudança de lógica

## 📝 Licença

Este projeto está sob a licença MIT.

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento. Se encontrar algum bug, por favor [abra uma issue](https://github.com/seu-usuario/dashboard-manutencao/issues).

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através das issues do GitHub.

---

**Desenvolvido com ❤️ usando Next.js e TypeScript**
