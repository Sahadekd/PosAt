-- 002: Oportunidades (Pós-Venda / Recompra) + auditoria de alterações
-- Idempotente (create/alter only) — não apaga dados existentes.

-- Enum de tipos de oportunidade
do $$
begin
  if not exists (select 1 from pg_type where typname = 'tipo_oportunidade') then
    create type tipo_oportunidade as enum (
      'recompra',
      'upgrade',
      'investimento_novo',
      'indicacao',
      'servicos',
      'outro'
    );
  end if;
end $$;

-- Enum de status de oportunidade
do $$
begin
  if not exists (select 1 from pg_type where typname = 'status_oportunidade') then
    create type status_oportunidade as enum (
      'identificada',
      'em_avaliacao',
      'proposta_enviada',
      'negociacao',
      'ganha',
      'perdida',
      'arquivada'
    );
  end if;
end $$;

create table if not exists oportunidades (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,

  tipo tipo_oportunidade not null default 'outro',
  descricao text not null,
  valor_estimado numeric(14, 2),

  status status_oportunidade not null default 'identificada',
  prioridade integer not null default 3,

  evidencia text,
  criado_por uuid,
  responsavel_id uuid,

  prazo_em timestamptz,
  proximo_passo text,

  ganha_em timestamptz,
  perdida_em timestamptz,
  motivo_perda text,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint prioridade_valida check (prioridade between 1 and 3),
  constraint valor_estimado_nao_negativo check (valor_estimado is null or valor_estimado >= 0)
);

create index if not exists oportunidades_cliente_idx
on oportunidades(cliente_id);

create index if not exists oportunidades_status_idx
on oportunidades(status);

create index if not exists oportunidades_prazo_idx
on oportunidades(prazo_em);

-- Trigger de atualizado_em reutilizado do schema 001
create trigger oportunidades_atualizado_em
before update on oportunidades
for each row
when (pg_trigger_depth() < 1)
execute function atualizar_atualizado_em();

-- Auditoria de alterações em clientes (separação confirmado vs inferido, histórico)
create table if not exists auditoria_clientes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,

  campo text not null,
  valor_anterior text,
  valor_novo text,

  origem text not null default 'manual',      -- 'sistema' | 'manual' | 'importacao'
  por_usuario uuid,
  criado_em timestamptz not null default now()
);

create index if not exists auditoria_clientes_cliente_idx
on auditoria_clientes(cliente_id, criado_em desc);