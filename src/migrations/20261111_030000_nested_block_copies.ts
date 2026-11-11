import { type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Requires paused editors and reopening ALL editor tabs before resume:
// parent updatedAt/revisions
// stay unchanged, so an already-open empty form can delete the restored children.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // One statement is atomic even without a caller transaction. NOWAIT refuses
  // active writers; locks last until the enclosing migration transaction ends.
  await db.execute(sql`
DO $repair$
DECLARE
  sources constant text[] := ARRAY[
    'services_blocks_text_2', 'services_blocks_callout_3',
    'technology_blocks_text_2', 'technology_blocks_image_3',
    '_services_v_blocks_text_2', '_services_v_blocks_callout_3',
    '_technology_v_blocks_text_2', '_technology_v_blocks_image_3'
  ];
  tables text;
  tenant integer;
  tenant_count integer;
  source text;
  target text;
  root text;
  root_path text;
  owner_column text;
  original_collection text;
  block_parent text;
  side text;
  position integer;
  is_version boolean;
  pass integer;
  candidate record;
  stored record;
  original jsonb;
  copied jsonb;
  expected jsonb;
  candidates text;
  columns text;
  populated boolean;
  matches integer;
BEGIN
  LOCK TABLE public.tenants IN SHARE ROW EXCLUSIVE MODE NOWAIT;
  SELECT count(*), min(id) INTO tenant_count, tenant FROM public.tenants WHERE slug = 'roomchang';
  SELECT string_agg(format('public.%I', tablename), ', ' ORDER BY tablename)
    INTO tables FROM pg_tables WHERE schemaname = 'public'
    AND tablename ~ '^(services|technology|_services_v|_technology_v)($|_)';
  EXECUTE 'LOCK TABLE ' || tables || ' IN SHARE ROW EXCLUSIVE MODE NOWAIT';
  IF tenant_count = 0 THEN
    -- Fresh installations have no legacy rows to recover and no tenant yet.
    FOR candidate IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      AND tablename ~ '^(services|technology|_services_v|_technology_v)_blocks_.*_[23]($|_)'
    LOOP
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I)', candidate.tablename) INTO populated;
      IF populated THEN
        RAISE EXCEPTION 'Nested block repair: expected exactly one Roomchang tenant';
      END IF;
    END LOOP;
    RETURN;
  ELSIF tenant_count <> 1 THEN
    RAISE EXCEPTION 'Nested block repair: expected exactly one Roomchang tenant';
  END IF;

  -- No array remapping is implemented. This also refuses newly populated old
  -- block types instead of silently repairing only a subset of editorial data.
  FOR candidate IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    AND tablename ~ '^(services|technology|_services_v|_technology_v)_blocks_.*_[23]($|_)'
    AND NOT (tablename = ANY(sources)) ORDER BY tablename
  LOOP
    root := split_part(candidate.tablename, '_blocks_', 1);
    owner_column := CASE WHEN left(root, 1) = '_' THEN 'version_tenant_id' ELSE 'tenant_id' END;
    IF EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = format('public.%I', candidate.tablename)::regclass
      AND attname = '_path' AND NOT attisdropped) THEN
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I b JOIN public.%I p ON p.id = b._parent_id WHERE p.%I = $1)',
        candidate.tablename, root, owner_column) INTO populated USING tenant;
    ELSE
      SELECT c.confrelid::regclass::text INTO block_parent FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND c.conkey = ARRAY[a.attnum]
        WHERE c.contype = 'f' AND c.conrelid = format('public.%I', candidate.tablename)::regclass AND a.attname = '_parent_id';
      IF block_parent IS NULL THEN
        RAISE EXCEPTION 'Nested block repair: cannot scope obsolete child table %', candidate.tablename;
      END IF;
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I b JOIN %s a ON a.id = b._parent_id
        JOIN public.%I p ON p.id = a._parent_id WHERE p.%I = $1)', candidate.tablename, block_parent, root, owner_column)
        INTO populated USING tenant;
    END IF;
    IF populated THEN
      RAISE EXCEPTION 'Nested block repair: unhandled populated obsolete table %', candidate.tablename;
    END IF;
  END LOOP;

  -- Validate EVERYTHING before using any destination sequence. The second pass
  -- inserts missing copies only; source tables, parent rows and JSON stay intact.
  FOR pass IN 1..2 LOOP
    FOREACH source IN ARRAY sources LOOP
      target := left(source, length(source) - 2);
      root := split_part(source, '_blocks_', 1);
      is_version := left(root, 1) = '_';
      owner_column := CASE WHEN is_version THEN 'version_tenant_id' ELSE 'tenant_id' END;
      original_collection := CASE WHEN root LIKE '%technology%' THEN 'technology' ELSE 'services' END;
      root_path := CASE WHEN is_version THEN 'version.sections' ELSE 'sections' END;
      position := CASE WHEN root LIKE '%technology%' THEN 2 ELSE 0 END;
      side := CASE WHEN right(source, 1) = '2' THEN 'left' ELSE 'right' END;
      IF is_version THEN
        EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I s JOIN public.%I v ON v.id = s._parent_id
          LEFT JOIN public.%I p ON p.id = v.parent_id WHERE (v.version_tenant_id = $1 OR p.tenant_id = $1)
          AND (p.id IS NULL OR v.version_tenant_id IS DISTINCT FROM p.tenant_id))', source, root, original_collection)
          INTO populated USING tenant;
        IF populated THEN
          RAISE EXCEPTION 'Nested block repair: inconsistent version/original tenant ownership in %', source;
        END IF;
      END IF;

      IF EXISTS (
        SELECT 1 FROM pg_attribute t WHERE t.attrelid = format('public.%I', target)::regclass
          AND t.attnum > 0 AND NOT t.attisdropped AND t.attnotnull
          AND NOT (is_version AND t.attname = 'id')
          AND NOT EXISTS (SELECT 1 FROM pg_attribute s
            WHERE s.attrelid = format('public.%I', source)::regclass
              AND s.attname = t.attname AND s.attnum > 0 AND NOT s.attisdropped)
      ) THEN
        RAISE EXCEPTION 'Nested block repair: unsupported required destination column in %', target;
      END IF;

      SELECT string_agg(format('%I', attname), ', ' ORDER BY attnum) INTO columns
        FROM pg_attribute WHERE attrelid = format('public.%I', target)::regclass
          AND attnum > 0 AND NOT attisdropped AND NOT (is_version AND attname = 'id');
      -- Include every block type, including sources, to catch cross-type address
      -- and identity collisions. Child arrays have no _path and are excluded.
      SELECT string_agg(format('SELECT %L AS table_name, to_jsonb(b) AS data FROM public.%I b',
        t.tablename, t.tablename), ' UNION ALL ' ORDER BY t.tablename) INTO candidates
        FROM pg_tables t WHERE t.schemaname = 'public'
          AND starts_with(t.tablename, root || '_blocks_')
          AND EXISTS (SELECT 1 FROM pg_attribute a
            WHERE a.attrelid = format('public.%I', t.tablename)::regclass AND a.attname = '_path' AND NOT a.attisdropped);

      FOR original IN EXECUTE format('SELECT to_jsonb(s) FROM public.%I s JOIN public.%I p ON p.id = s._parent_id
        WHERE p.%I = $1 ORDER BY s.id', source, root, owner_column) USING tenant LOOP
        IF original->>'_path' IS DISTINCT FROM root_path || '.' || position || '.' || side
          OR original->>'_order' IS DISTINCT FROM '1' THEN
          RAISE EXCEPTION 'Nested block repair: unexpected source address in %', source;
        END IF;
        EXECUTE format('SELECT count(*) = 1 FROM public.%I WHERE _parent_id = $1 AND _locale::text = $2 AND _path = $3 AND _order = $4',
          root || '_blocks_twocol') INTO populated
          USING (original->>'_parent_id')::integer, original->>'_locale', root_path, position + 1;
        IF NOT populated THEN
          RAISE EXCEPTION 'Nested block repair: missing or ambiguous two-column parent for %', source;
        END IF;

        copied := CASE WHEN is_version THEN original - 'id' ELSE original END;
        EXECUTE format('SELECT to_jsonb(r) FROM jsonb_populate_record(NULL::public.%I, $1) r', target)
          INTO expected USING copied;
        IF is_version THEN expected := expected - 'id'; END IF;
        -- Includes NULLs and unknown source columns; never drop a field by taking
        -- an intersection. Enum names can differ, but every value must round-trip.
        IF NOT (expected @> copied) THEN
          RAISE EXCEPTION 'Nested block repair: source values/columns do not round-trip into %', target;
        END IF;

        matches := 0;
        FOR stored IN EXECUTE 'SELECT * FROM (' || candidates || ') b
          WHERE NOT (table_name = $2 AND data->>''id'' = $1->>''id'') AND (
            (NOT $3 AND data->>''id'' = $1->>''id'') OR
            (data->>''_parent_id'' = $1->>''_parent_id'' AND data->>''_locale'' = $1->>''_locale'' AND (
              data->>''_path'' = $1->>''_path'' OR
              ($3 AND data->>''_uuid'' IS NOT NULL AND data->>''_uuid'' = $1->>''_uuid'')
            )))' USING original, source, is_version
        LOOP
          matches := matches + 1;
          IF matches > 1 OR stored.table_name <> target OR
            (CASE WHEN is_version THEN stored.data - 'id' ELSE stored.data END) IS DISTINCT FROM expected THEN
            RAISE EXCEPTION 'Nested block repair: conflicting target/source identity, address or value for %', source;
          END IF;
          IF right(source, 9) = 'callout_3' THEN
            EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I WHERE _parent_id::text = $1)', target || '_stats')
              INTO populated USING stored.data->>'id';
            IF populated THEN
              RAISE EXCEPTION 'Nested block repair: conflicting target child array for %', source;
            END IF;
          END IF;
        END LOOP;
        IF pass = 2 AND matches = 0 THEN
          -- Explicit nullable extras remain NULL (not new defaults). Only version
          -- surrogate IDs are omitted; _uuid and all published IDs are preserved.
          EXECUTE format('INSERT INTO public.%I (%s) SELECT %s FROM jsonb_populate_record(NULL::public.%I, $1)',
            target, columns, columns, target) USING copied;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END
$repair$;
`)
}

export async function down(): Promise<void> {
  throw new Error('Nested block copies and all editorial data are retained. Roll back application code; destructive removal is refused.')
}
