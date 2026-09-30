-- =====================================================
-- 004: Repara FKs de cliente_id ausentes
--
-- Bancos criados antes das migrations com "create table if not exists"
-- podem ter tabelas sem a FK para clientes — isso quebra os embeds do
-- PostgREST (PGRST200) e, por consequência, a listagem e criação de
-- clientes via API (que caem no fallback local).
--
-- Bloco idempotente: só adiciona a FK se ela não existir; ignora
-- tabelas com linhas órfãs (aviso no log).
-- =====================================================

do $$
declare
  r record;
  col_attnum smallint;
begin
  for r in
    select c.table_name
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.column_name = 'cliente_id'
  loop
    select a.attnum into col_attnum
    from pg_attribute a
    where a.attrelid = to_regclass('public.' || quote_ident(r.table_name))
      and a.attname = 'cliente_id'
      and not a.attisdropped;

    if col_attnum is null then
      continue;
    end if;

    if not exists (
      select 1
      from pg_constraint con
      where con.conrelid = to_regclass('public.' || quote_ident(r.table_name))
        and con.contype = 'f'
        and con.confrelid = 'clientes'::regclass
        and con.conkey = array[col_attnum]::smallint[]
    ) then
      begin
        execute format(
          'alter table %I add constraint %I foreign key (cliente_id) references clientes(id) on delete cascade',
          r.table_name,
          r.table_name || '_cliente_id_fkey'
        );
        raise notice 'FK adicionada em %.cliente_id', r.table_name;
      exception when others then
        raise notice 'Não foi possível adicionar FK em %.cliente_id: %', r.table_name, sqlerrm;
      end;
    end if;
  end loop;
end $$;

-- Recarrega o schema cache do PostgREST (Supabase faz isso via event trigger
-- em DDL, mas garante a atuação imediata em bancos locais):
notify pgrst, 'reload schema';
