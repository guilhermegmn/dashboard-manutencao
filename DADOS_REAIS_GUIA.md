# Guia de Extração de Dados para Dashboard de Manutenção

## Como Extrair Dados de Sistemas Comuns

### 1. SAP (ERP)

**Módulo PM (Plant Maintenance):**

```sql
-- Exemplo de query para extrair dados
SELECT
    equipment_id as id,
    equipment_name as name,
    equipment_category as category,
    EXTRACT(MONTH FROM date) as month,
    mtbf,
    mttr,
    availability as Disponibilidade,
    maintenance_cost as Custo,
    equipment_status as Status
FROM PM_EQUIPMENT_HISTORY
WHERE date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
ORDER BY equipment_id, date;
```

**Como fazer:**
1. Acesse transação `IW39` (Notificações)
2. Execute relatório de disponibilidade
3. Exporte para Excel
4. Ajuste colunas conforme template CSV
5. Salve como CSV

---

### 2. Totvs Protheus

**Módulo SIGAMNT:**

1. Menu: Relatórios → Manutenção → Indicadores
2. Selecione período (últimos 6 meses)
3. Escolha equipamentos
4. Gere relatório em Excel
5. Reorganize colunas conforme template
6. Exporte como CSV

---

### 3. Sistema Próprio (SQL)

**Template de Query Genérica:**

```sql
SELECT
    e.codigo AS id,
    e.nome AS name,
    e.categoria AS category,
    DATE_FORMAT(m.data_registro, '%b') AS month,

    -- MTBF: Tempo médio entre falhas
    AVG(TIMESTAMPDIFF(HOUR, m.ultima_falha, m.falha_atual)) AS MTBF,

    -- MTTR: Tempo médio de reparo
    AVG(TIMESTAMPDIFF(HOUR, m.inicio_reparo, m.fim_reparo)) AS MTTR,

    -- Disponibilidade
    (SUM(m.tempo_operacional) / SUM(m.tempo_total)) * 100 AS Disponibilidade,

    -- Custo em milhões
    SUM(m.custo_manutencao) / 1000000 AS Custo,

    e.status AS Status

FROM equipamentos e
INNER JOIN manutencoes m ON e.id = m.equipamento_id
WHERE m.data_registro >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
GROUP BY e.codigo, e.nome, e.categoria, e.status, MONTH(m.data_registro)
ORDER BY e.codigo, m.data_registro;
```

---

### 4. Planilhas Manuais (Excel Atual)

Se você já tem planilhas de controle:

**Estrutura Recomendada:**

```
Aba 1: Cadastro de Equipamentos
- ID
- Nome
- Categoria
- Status

Aba 2: Histórico Mensal
- ID Equipamento
- Mês
- MTBF (horas)
- MTTR (horas)
- Disponibilidade (%)
- Custo (R$ milhões)
```

**Fórmulas úteis:**

```excel
# MTBF (Tempo Médio Entre Falhas)
=MÉDIA(H_Operacao_Entre_Falhas)

# MTTR (Tempo Médio de Reparo)
=MÉDIA(H_Parada_Para_Reparo)

# Disponibilidade
=(H_Operacional / H_Total) * 100

# Custo em Milhões
=SOMA(Custos_Mes) / 1000000
```

---

### 5. PowerBI / Tableau

Se você usa BI:

1. Crie dataset com as colunas necessárias
2. Exporte visualização como CSV
3. Use Power Query para transformar dados:

**Power Query M:**
```m
let
    Fonte = Excel.CurrentWorkbook(){[Name="Equipamentos"]}[Content],
    Agrupado = Table.Group(
        Fonte,
        {"ID", "Nome", "Categoria", "Mês"},
        {
            {"MTBF", each List.Average([Tempo_Entre_Falhas]), type number},
            {"MTTR", each List.Average([Tempo_Reparo]), type number},
            {"Disponibilidade", each List.Average([Disp_Percent]), type number},
            {"Custo", each List.Sum([Custo_Mensal]) / 1000000, type number}
        }
    )
in
    Agrupado
```

---

## Cálculo dos Indicadores

### MTBF (Mean Time Between Failures)

**Fórmula:**
```
MTBF = Tempo Total Operacional / Número de Falhas
```

**Exemplo:**
- Equipamento operou 720 horas no mês
- Teve 3 falhas
- MTBF = 720 / 3 = 240 horas

### MTTR (Mean Time To Repair)

**Fórmula:**
```
MTTR = Tempo Total de Reparo / Número de Reparos
```

**Exemplo:**
- Total de tempo em reparo: 15 horas
- Número de reparos: 5
- MTTR = 15 / 5 = 3 horas

### Disponibilidade

**Fórmula:**
```
Disponibilidade = (Tempo Operacional / Tempo Total) × 100
```

**Exemplo:**
- Tempo operacional: 710 horas
- Tempo total do mês: 744 horas
- Disponibilidade = (710 / 744) × 100 = 95.4%

### Custo de Manutenção

**Componentes:**
- Peças de reposição
- Mão de obra
- Serviços terceirizados
- Paradas não programadas (custo de oportunidade)

**Unidade:** Milhões de Reais (R$)
```
Custo = (Peças + Mão_Obra + Serviços + Custo_Parada) / 1.000.000
```

---

## Template Excel Pronto

Criei um template Excel que você pode usar:

### Aba "Equipamentos"
| ID | Nome | Categoria | Status |
|----|------|-----------|--------|
| EQ-001 | [Seu Equipamento] | [Categoria] | Operacional |

### Aba "Historico_Mensal"
| ID_Equip | Mês | Horas_Operação | Num_Falhas | Tempo_Reparo | Custo_Total |
|----------|-----|----------------|------------|--------------|-------------|
| EQ-001 | Jan | 720 | 3 | 12 | 45000 |

### Aba "Dashboard_Export" (calculado)
```excel
=TEXTJOIN(",",TRUE,
    ID_Equip,
    VLOOKUP(ID_Equip, Equipamentos, 2, FALSE),
    VLOOKUP(ID_Equip, Equipamentos, 3, FALSE),
    Mês,
    Horas_Operação / Num_Falhas,           # MTBF
    Tempo_Reparo / Num_Falhas,             # MTTR
    (Horas_Operação / 744) * 100,          # Disponibilidade
    Custo_Total / 1000000,                 # Custo (milhões)
    VLOOKUP(ID_Equip, Equipamentos, 4, FALSE)  # Status
)
```

Copie essa aba e salve como CSV!

---

## Automação (Opcional)

### Script Python para Converter

```python
import pandas as pd

# Ler dados do seu sistema
df = pd.read_excel('dados_manutencao.xlsx')

# Calcular indicadores
df['MTBF'] = df['horas_operacao'] / df['num_falhas']
df['MTTR'] = df['tempo_reparo'] / df['num_reparos']
df['Disponibilidade'] = (df['horas_operacao'] / df['horas_totais']) * 100
df['Custo'] = df['custo_total'] / 1_000_000

# Selecionar colunas necessárias
export_df = df[['id', 'name', 'category', 'month',
                'MTBF', 'MTTR', 'Disponibilidade', 'Custo', 'Status']]

# Exportar CSV
export_df.to_csv('dashboard_import.csv', index=False, encoding='utf-8')
print("CSV gerado com sucesso!")
```

---

## Dicas Importantes

1. **Mantenha histórico consistente**: Sempre use o mesmo ID para o mesmo equipamento
2. **Dados mensais**: Uma linha por equipamento por mês
3. **Encoding UTF-8**: Garante que acentos apareçam corretamente
4. **Validação**: Verifique se todos os valores numéricos são números (não texto)
5. **Backup**: Sempre mantenha uma cópia dos dados originais

---

## Precisa de Ajuda?

Se você tiver um formato específico de dados, posso ajudar a criar:
- Query SQL customizada
- Script de transformação
- Macro Excel para automação
- Template específico para seu sistema

Basta me mostrar como seus dados estão organizados hoje!
