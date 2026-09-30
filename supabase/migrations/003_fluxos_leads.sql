-- 003: Fluxo de Leads (Pós-Atendimento)
-- Construtor visual de acompanhamento/relacionamento com leads.
-- Idempotente (create/alter only) — não apaga dados existentes.

-- ============================================================
-- ENUMS
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'status_fluxo') then
    create type status_fluxo as enum (
      'rascunho',
      'ativo',
      'pausado',
      'concluido',
      'cancelado'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tipo_no_fluxo') then
    create type tipo_no_fluxo as enum (
      'gatilho',
      'mensagem_whatsapp',
      'atraso',
      'condicao',
      'acao_interna',
      'notificacao'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'estado_no_execucao') then
    create type estado_no_execucao as enum (
      'pendente',
      'agendado',
      'em_execucao',
      'concluido',
      'falhou',
      'pulado'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'status_execucao_fluxo') then
    create type status_execucao_fluxo as enum (
      'ativa',
      'pausada_por_resposta',
      'pausada_manual',
      'concluida',
      'falhou',
      'cancelada'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tipo_gatilho_fluxo') then
    create type tipo_gatilho_fluxo as enum (
      'manual',
      'novo_lead',
      'mudanca_estagio',
      'inatividade_dias',
      'evento_sistema'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'origem_execucao_no') then
    create type origem_execucao_no as enum (
      'automatica',
      'manual'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tipo_acao_interna') then
    create type tipo_acao_interna as enum (
      'criar_tarefa',
      'atribuir_responsavel',
      'mudar_estagio',
      'registrar_anotacao'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'tipo_notificacao_fluxo') then
    create type tipo_notificacao_fluxo as enum (
      'in_app',
      'whatsapp_interno'
    );
  end if;
end $$;

-- ============================================================
-- FLUXOS (definição / template)
-- ============================================================

create table if not exists fluxos (
  id uuid primary key default gen_random_uuid(),

  nome text not null,
  descricao text,
  status status_fluxo not null default 'rascunho',

  -- Reuso: se vier de um template, guarda a origem
  template_origem_id uuid references fluxos(id) on delete set null,
  e_template boolean not null default false,
  template_categoria text,          -- ex.: 'pos_visita', 'reativacao', 'pos_proposta'

  -- Escopo: fluxo da equipe inteira ou de um responsável
  responsavel_id uuid,
  equipe_escopo boolean not null default true,

  -- Configuração de execução
  pausar_quando_responder boolean not null default true,
  janela_envio_inicio time not null default '08:00',
  janela_envio_fim time not null default '20:00',
  limite_mensagens_por_dia integer not null default 8,

  -- Grafo serializado (nos + conexões) — fonte de verdade para renderização
  grafo jsonb not null default '{"nodes": [], "edges": []}'::jsonb,

  criado_por uuid,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists fluxos_status_idx on fluxos(status);
create index if not exists fluxos_template_idx on fluxos(e_template) where e_template = true;
create index if not exists fluxos_responsavel_idx on fluxos(responsavel_id);

create trigger fluxos_atualizado_em
before update on fluxos
for each row
when (pg_trigger_depth() < 1)
execute function atualizar_atualizado_em();

-- ============================================================
-- EXECUÇÕES DE FLUXO (instância por lead)
-- ============================================================

create table if not exists fluxo_execucoes (
  id uuid primary key default gen_random_uuid(),

  fluxo_id uuid not null references fluxos(id) on delete cascade,
  cliente_id uuid not null references clientes(id) on delete cascade,

  status status_execucao_fluxo not null default 'ativa',

  -- Qual nó deve ser executado agora (referência ao id do nó no grafo)
  no_atual_id text,
  no_atual_estado estado_no_execucao not null default 'pendente',

  -- Agendamento do próximo passo
  proxima_execucao_em timestamptz,
  tentativas integer not null default 0,

  -- Contexto de pausa
  pausada_em timestamptz,
  pausada_motivo text,
  retomada_em timestamptz,

  -- Variáveis resolvidas para templates ({{nome}}, {{imovel}}, {{corretor}})
  contexto jsonb not null default '{}'::jsonb,

  iniciada_por uuid,               -- usuário que disparou (se manual)
  origem origem_execucao_no not null default 'automatica',

  iniciado_em timestamptz not null default now(),
  concluido_em timestamptz,
  cancelada_em timestamptz,
  atualizado_em timestamptz not null default now()
);

create unique index if not exists fluxo_execucoes_unica_ativa
on fluxo_execucoes(fluxo_id, cliente_id)
where status in ('ativa', 'pausada_por_resposta', 'pausada_manual');

create index if not exists fluxo_execucoes_cliente_idx
on fluxo_execucoes(cliente_id, status);

create index if not exists fluxo_execucoes_fluxo_status_idx
on fluxo_execucoes(fluxo_id, status);

create index if not exists fluxo_execucoes_agendamento_idx
on fluxo_execucoes(proxima_execucao_em)
where proxima_execucao_em is not null
  and status = 'ativa';

create trigger fluxo_execucoes_atualizado_em
before update on fluxo_execucoes
for each row
when (pg_trigger_depth() < 1)
execute function atualizar_atualizado_em();

-- ============================================================
-- EXECUÇÕES DE NÓ (linha do tempo / auditoria)
-- ============================================================

create table if not exists fluxo_no_execucoes (
  id uuid primary key default gen_random_uuid(),

  execucao_id uuid not null references fluxo_execucoes(id) on delete cascade,
  no_id text not null,                    -- id do nó dentro do grafo
  tipo tipo_no_fluxo not null,

  estado estado_no_execucao not null default 'pendente',

  -- Auditoria: quem/e o quê
  origem origem_execucao_no not null default 'automatica',
  responsavel_id uuid,                    -- quando manual

  -- Resultado do disparo
  conteudo_enviado text,                  -- texto já com variáveis resolvidas
  mensagem_whatsapp_id uuid,              -- FK opcional para mensagens espelhadas
  status_entrega text,                    -- enviada | entregue | lida | falhou
  erro_detalhe text,
  tentativas integer not null default 0,

  -- Ramificação escolhida (nós de condição)
  ramificacao text,                       -- 'sim' | 'nao' | valor do campo

  agendado_para timestamptz,
  iniciado_em timestamptz,
  concluido_em timestamptz,

  dados_extra jsonb not null default '{}'::jsonb,

  criado_em timestamptz not null default now()
);

create index if not exists fluxo_no_execucoes_execucao_idx
on fluxo_no_execucoes(execucao_id, criado_em desc);

create index if not exists fluxo_no_execucoes_estado_idx
on fluxo_no_execucoes(estado)
where estado in ('falhou', 'em_execucao');

create index if not exists fluxo_no_execucoes_agendado_idx
on fluxo_no_execucoes(agendado_para)
where agendado_para is not null
  and estado in ('pendente', 'agendado');

-- ============================================================
-- LOG DE EXECUÇÃO (quem / quê / quando / resultado)
-- ============================================================

create table if not exists fluxo_log (
  id uuid primary key default gen_random_uuid(),

  execucao_id uuid references fluxo_execucoes(id) on delete cascade,
  fluxo_id uuid references fluxos(id) on delete cascade,
  cliente_id uuid references clientes(id) on delete cascade,

  no_id text,
  evento text not null,       -- 'no_iniciado' | 'no_concluido' | 'no_falhou' | 'pausado' | 'retomado' | ...
  detalhe text,
  origem origem_execucao_no not null default 'automatica',
  responsavel_id uuid,

  dados jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists fluxo_log_execucao_idx
on fluxo_log(execucao_id, criado_em desc);

create index if not exists fluxo_log_cliente_idx
on fluxo_log(cliente_id, criado_em desc);

create index if not exists fluxo_log_fluxo_idx
on fluxo_log(fluxo_id, criado_em desc);

-- ============================================================
-- CONFIGURAÇÕES GLOBAIS (gestor/admin)
-- ============================================================

create table if not exists fluxo_config (
  id uuid primary key default gen_random_uuid(),

  chave text not null unique,          -- 'janela_envio', 'limite_dia', ...
  valor jsonb not null,
  descricao text,

  atualizado_por uuid,
  atualizado_em timestamptz not null default now()
);

-- Defaults de configuração
insert into fluxo_config (chave, valor, descricao)
values
  ('janela_envio', '"08:00-20:00"'::jsonb, 'Horário permitido de disparo de mensagens pelo fluxo'),
  ('limite_mensagens_dia', '8'::jsonb, 'Limite de mensagens automáticas por lead por dia'),
  ('pausar_na_resposta', 'true'::jsonb, 'Pausar automaticamente o fluxo quando o lead responder'),
  ('max_tentativas', '3'::jsonb, 'Tentativas de reenvio antes de marcar falha')
on conflict (chave) do nothing;
