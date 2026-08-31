create extension if not exists "pgcrypto";

create type origem_pessoa as enum (
  'crm',
  'formulario',
  'whatsapp',
  'site',
  'supabase',
  'planilha',
  'manual',
  'outro'
);

create type status_relacionamento as enum (
  'novo_lead',
  'em_qualificacao',
  'em_negociacao',
  'convertido',
  'handoff_pendente',
  'onboarding',
  'pos_venda',
  'cliente_ativo',
  'cliente_inativo',
  'reativacao',
  'sem_resposta',
  'encerrado'
);

create type finalidade_cliente as enum (
  'primeiro_imovel',
  'moradia',
  'investimento',
  'possivel_investidor',
  'upgrade',
  'segunda_residencia',
  'compra_para_familiar',
  'locacao',
  'imovel_comercial',
  'cliente_recorrente',
  'potencial_indicacao',
  'nao_identificado'
);

create type nivel_classificacao as enum (
  'alta',
  'media',
  'baixa',
  'revisao_necessaria'
);

create type status_tarefa as enum (
  'pendente',
  'em_andamento',
  'concluida',
  'nao_realizada',
  'reagendada',
  'sem_resposta'
);

create type tipo_interacao as enum (
  'ligacao',
  'whatsapp',
  'email',
  'visita',
  'proposta',
  'chamado',
  'pesquisa',
  'observacao',
  'outro'
);

create table if not exists pessoas (
  id uuid primary key default gen_random_uuid(),

  nome text,
  telefone text,
  email text,
  documento text,

  origem origem_pessoa not null default 'manual',
  id_externo text,
  dados_originais jsonb not null default '{}'::jsonb,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create unique index if not exists pessoas_documento_unico
on pessoas(documento)
where documento is not null and documento <> '';

create unique index if not exists pessoas_email_unico
on pessoas(lower(email))
where email is not null and email <> '';

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references pessoas(id) on delete cascade,

  status status_relacionamento not null default 'novo_lead',

  finalidade_principal finalidade_cliente
    not null default 'nao_identificado',

  finalidades_secundarias finalidade_cliente[]
    not null default '{}',

  regiao_interesse text,
  cidade_interesse text,
  bairro_interesse text,

  tipo_imovel text,
  padrao_imovel text,

  valor_minimo numeric(14, 2),
  valor_maximo numeric(14, 2),

  prazo_compra text,
  forma_pagamento text,
  precisa_financiamento boolean,

  ja_possui_imovel boolean,
  e_investidor_confirmado boolean not null default false,

  indice_completude numeric(5, 2) not null default 0,
  nivel_confianca nivel_classificacao
    not null default 'baixa',

  campos_faltantes text[]
    not null default '{}',

  sinais_classificacao text[]
    not null default '{}',

  responsavel_id uuid,
  ultima_interacao_em timestamptz,
  proxima_acao text,
  proxima_acao_em timestamptz,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint valor_minimo_nao_negativo
    check (valor_minimo is null or valor_minimo >= 0),

  constraint valor_maximo_nao_negativo
    check (valor_maximo is null or valor_maximo >= 0),

  constraint faixa_valor_valida
    check (
      valor_minimo is null
      or valor_maximo is null
      or valor_minimo <= valor_maximo
    )
);

create index if not exists clientes_status_idx
on clientes(status);

create index if not exists clientes_finalidade_idx
on clientes(finalidade_principal);

create index if not exists clientes_regiao_idx
on clientes(regiao_interesse);

create index if not exists clientes_completude_idx
on clientes(indice_completude);

create table if not exists imoveis_interesse (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,

  empreendimento text,
  tipo_imovel text,
  regiao text,
  bairro text,
  padrao text,

  valor numeric(14, 2),
  quartos integer,
  area_m2 numeric(10, 2),

  status text,
  origem text,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists interacoes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,

  tipo tipo_interacao not null,
  canal text,
  descricao text,
  resultado text,

  criado_por uuid,
  ocorreu_em timestamptz not null default now(),

  dados_extra jsonb not null default '{}'::jsonb
);

create index if not exists interacoes_cliente_idx
on interacoes(cliente_id, ocorreu_em desc);

create table if not exists tarefas_pos_atendimento (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,

  titulo text not null,
  descricao text,
  status status_tarefa not null default 'pendente',
  prioridade integer not null default 3,

  responsavel_id uuid,
  prazo_em timestamptz,
  concluida_em timestamptz,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists tarefas_status_idx
on tarefas_pos_atendimento(status, prazo_em);

create table if not exists classificacoes_historico (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,

  finalidade_anterior finalidade_cliente,
  finalidade_nova finalidade_cliente not null,

  confianca nivel_classificacao not null,
  motivo text[],
  origem text not null default 'sistema',

  criado_por uuid,
  criado_em timestamptz not null default now()
);

create table if not exists handoffs (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,

  responsavel_origem uuid,
  responsavel_destino uuid,

  status text not null default 'aguardando_passagem',
  motivo text,
  resumo text,
  pendencias text[],
  expectativa_cliente text,

  enviado_em timestamptz,
  recebido_em timestamptz,
  concluido_em timestamptz,

  criado_em timestamptz not null default now()
);

create table if not exists pesquisas_satisfacao (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,

  tipo text not null,
  nota integer,
  comentario text,

  respondida_em timestamptz,
  criado_em timestamptz not null default now(),

  constraint nota_valida check (
    nota is null or nota between 0 and 10
  )
);

create or replace function atualizar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger pessoas_atualizado_em
before update on pessoas
for each row execute function atualizar_atualizado_em();

create trigger clientes_atualizado_em
before update on clientes
for each row execute function atualizar_atualizado_em();

create trigger imoveis_interesse_atualizado_em
before update on imoveis_interesse
for each row execute function atualizar_atualizado_em();

create trigger tarefas_atualizado_em
before update on tarefas_pos_atendimento
for each row execute function atualizar_atualizado_em();
