-- Backfill de display_name a partir de la parte local del email.
-- Merge sobre raw_user_meta_data: no borra el resto del metadata.
--
-- Vía de ejecución prevista: MCP de Supabase (execute_sql). Si ese MCP no está
-- disponible, el equivalente ejecutable es scripts/backfill-display-name.mjs,
-- que aplica la misma transformación a través de la Admin API.
update auth.users
set raw_user_meta_data =
      coalesce(raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object(
           'display_name',
           initcap(btrim(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9]+', ' ', 'g')))
         )
where email is not null;

-- Verificación:
-- select email, raw_user_meta_data->>'display_name' from auth.users order by email;
