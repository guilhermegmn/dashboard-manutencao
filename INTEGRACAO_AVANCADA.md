# Opções Avançadas de Integração

## Opção 2: API Backend (Dados em Tempo Real)

### Quando usar?
- ✅ Dados precisam atualizar automaticamente
- ✅ Múltiplos usuários acessando simultaneamente
- ✅ Dados vêm de múltiplas fontes
- ✅ Precisa de autenticação e controle de acesso

### Arquitetura Recomendada

```
Sistema ERP/MES → API Backend → Dashboard Next.js
```

### Exemplo de Implementação

#### 1. Backend Node.js + Express

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Endpoint para buscar equipamentos
app.get('/api/equipments', async (req, res) => {
  const { period, category } = req.query;

  // Conectar ao banco de dados
  const equipments = await db.query(`
    SELECT
      e.id,
      e.name,
      e.category,
      e.status,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'month', DATE_FORMAT(h.date, '%b'),
          'MTBF', h.mtbf,
          'MTTR', h.mttr,
          'Disponibilidade', h.availability,
          'Custo', h.cost
        )
      ) as history
    FROM equipments e
    LEFT JOIN equipment_history h ON e.id = h.equipment_id
    WHERE h.date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
    ${category ? 'AND e.category = ?' : ''}
    GROUP BY e.id
  `, [period, category]);

  res.json(equipments);
});

app.listen(3001, () => {
  console.log('API running on port 3001');
});
```

#### 2. Modificar Dashboard (Next.js)

```typescript
// src/hooks/useEquipmentData.ts
import { useState, useEffect } from 'react';
import { Equipment } from '@/types/dashboard';

export function useEquipmentData() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/equipments')
      .then(res => res.json())
      .then(data => {
        setEquipments(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { equipments, loading, error };
}
```

```typescript
// src/components/MaintenanceDashboard.tsx
import { useEquipmentData } from '@/hooks/useEquipmentData';

export default function MaintenanceDashboard() {
  const { equipments, loading, error } = useEquipmentData();
  const { csvEquipments, handleCSVUpload, generateCSVTemplate } = useCSVImport();

  // Usa API se disponível, senão fallback para CSV
  const sourceData = equipments.length > 0 ? equipments : (csvEquipments ?? EQUIPMENT_DATA);

  if (loading) return <div>Carregando dados...</div>;
  if (error) return <div>Erro: {error}</div>;

  // ... resto do código
}
```

---

## Opção 3: Next.js API Routes (Serverless)

### Vantagens
- ✅ Tudo no mesmo projeto
- ✅ Deploy simplificado na Vercel
- ✅ Serverless (escala automaticamente)

### Implementação

#### 1. Criar API Route

```typescript
// src/app/api/equipments/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres'; // ou seu DB

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '3m';
  const category = searchParams.get('category');

  try {
    const result = await sql`
      SELECT
        e.id,
        e.name,
        e.category,
        e.status,
        array_agg(
          json_build_object(
            'month', to_char(h.date, 'Mon'),
            'MTBF', h.mtbf,
            'MTTR', h.mttr,
            'Disponibilidade', h.availability,
            'Custo', h.cost
          )
        ) as history
      FROM equipments e
      LEFT JOIN equipment_history h ON e.id = h.equipment_id
      WHERE h.date >= NOW() - INTERVAL '${period}'
      ${category ? sql`AND e.category = ${category}` : sql``}
      GROUP BY e.id, e.name, e.category, e.status
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

#### 2. Usar no Frontend

```typescript
// src/hooks/useEquipmentData.ts
'use client';

import useSWR from 'swr';
import { Equipment } from '@/types/dashboard';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useEquipmentData(period: string, category?: string) {
  const params = new URLSearchParams({ period });
  if (category) params.append('category', category);

  const { data, error, isLoading } = useSWR<Equipment[]>(
    `/api/equipments?${params}`,
    fetcher,
    { refreshInterval: 30000 } // Atualiza a cada 30 segundos
  );

  return {
    equipments: data || [],
    loading: isLoading,
    error: error?.message
  };
}
```

---

## Opção 4: Banco de Dados Diretamente (Supabase)

### Por que Supabase?
- ✅ PostgreSQL gratuito
- ✅ APIs REST automáticas
- ✅ Real-time subscriptions
- ✅ Fácil configuração

### Implementação

#### 1. Setup Supabase

```sql
-- Criar tabelas
CREATE TABLE equipments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE equipment_history (
  id SERIAL PRIMARY KEY,
  equipment_id TEXT REFERENCES equipments(id),
  month TEXT NOT NULL,
  mtbf DECIMAL(10,2),
  mttr DECIMAL(10,2),
  availability DECIMAL(5,2),
  cost DECIMAL(10,2),
  date DATE NOT NULL,
  UNIQUE(equipment_id, date)
);

-- Criar view para dashboard
CREATE VIEW dashboard_data AS
SELECT
  e.id,
  e.name,
  e.category,
  e.status,
  json_agg(
    json_build_object(
      'month', h.month,
      'MTBF', h.mtbf,
      'MTTR', h.mttr,
      'Disponibilidade', h.availability,
      'Custo', h.cost
    ) ORDER BY h.date
  ) as history
FROM equipments e
LEFT JOIN equipment_history h ON e.id = h.equipment_id
WHERE h.date >= NOW() - INTERVAL '6 months'
GROUP BY e.id, e.name, e.category, e.status;
```

#### 2. Instalar Cliente Supabase

```bash
npm install @supabase/supabase-js
```

#### 3. Configurar Cliente

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

#### 4. Hook para Dados

```typescript
// src/hooks/useSupabaseEquipments.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Equipment } from '@/types/dashboard';

export function useSupabaseEquipments() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipments();

    // Real-time subscription
    const subscription = supabase
      .channel('equipment_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'equipment_history' },
        () => fetchEquipments()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchEquipments() {
    const { data, error } = await supabase
      .from('dashboard_data')
      .select('*');

    if (data) setEquipments(data);
    setLoading(false);
  }

  return { equipments, loading };
}
```

---

## Opção 5: Firebase Realtime Database

### Vantagens
- ✅ Configuração rápida
- ✅ Real-time por padrão
- ✅ Escalável
- ✅ Plano gratuito generoso

### Implementação

```bash
npm install firebase
```

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
```

```typescript
// src/hooks/useFirebaseEquipments.ts
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Equipment } from '@/types/dashboard';

export function useFirebaseEquipments() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);

  useEffect(() => {
    const equipmentsRef = ref(database, 'equipments');

    const unsubscribe = onValue(equipmentsRef, (snapshot) => {
      const data = snapshot.val();
      setEquipments(data ? Object.values(data) : []);
    });

    return () => unsubscribe();
  }, []);

  return { equipments };
}
```

---

## Comparação de Opções

| Opção | Complexidade | Custo | Tempo Real | Escalabilidade |
|-------|--------------|-------|------------|----------------|
| **CSV** | ⭐ Baixa | Grátis | ❌ Manual | ⭐⭐ Baixa |
| **API Backend** | ⭐⭐⭐ Alta | Servidor | ✅ Sim | ⭐⭐⭐ Alta |
| **Next.js API** | ⭐⭐ Média | Vercel Free | ✅ Sim | ⭐⭐⭐ Alta |
| **Supabase** | ⭐⭐ Média | Free/Paid | ✅ Sim | ⭐⭐⭐⭐ Muito Alta |
| **Firebase** | ⭐⭐ Média | Free/Paid | ✅ Sim | ⭐⭐⭐⭐ Muito Alta |

---

## Minha Recomendação por Cenário

### **Cenário 1: Poucos Equipamentos (< 50), Atualização Manual**
👉 **Use CSV** - Simples, eficaz, já está pronto

### **Cenário 2: Equipamentos Médios (50-200), Atualização Semanal**
👉 **Use Next.js API Routes + PostgreSQL** - Balance entre simplicidade e automação

### **Cenário 3: Muitos Equipamentos (200+), Tempo Real**
👉 **Use Supabase** - Escalável, real-time, fácil de configurar

### **Cenário 4: Integração com ERP Existente**
👉 **Use API Backend** - Controle total, integração customizada

### **Cenário 5: Startup/Protótipo Rápido**
👉 **Use Firebase** - Setup rápido, escala bem

---

## Próximos Passos

Baseado na sua situação, posso ajudar a:

1. **Configurar uma API específica** para seu sistema
2. **Criar scripts de migração** dos seus dados atuais
3. **Implementar integração** com Supabase/Firebase
4. **Desenvolver endpoints REST** customizados
5. **Automatizar importação** via scripts agendados

Qual opção faz mais sentido para sua operação?
