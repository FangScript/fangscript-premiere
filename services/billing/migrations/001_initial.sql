CREATE TABLE IF NOT EXISTS records (
 id uuid PRIMARY KEY, tenant_id uuid, kind text NOT NULL, title text NOT NULL DEFAULT '', slug text,
 status text NOT NULL DEFAULT 'draft', data jsonb NOT NULL DEFAULT '{}', version integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 search tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(data->>'description',''))) STORED
);
CREATE INDEX IF NOT EXISTS records_kind_status ON records(kind,status,created_at DESC);
CREATE INDEX IF NOT EXISTS records_tenant ON records(tenant_id,kind,created_at DESC);
CREATE INDEX IF NOT EXISTS records_search ON records USING gin(search);
CREATE UNIQUE INDEX IF NOT EXISTS records_slug ON records(kind,slug) WHERE slug IS NOT NULL;
CREATE TABLE IF NOT EXISTS revisions(id bigserial PRIMARY KEY,record_id uuid NOT NULL,version integer NOT NULL,snapshot jsonb NOT NULL,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS outbox(id uuid PRIMARY KEY,topic text NOT NULL,payload jsonb NOT NULL,created_at timestamptz DEFAULT now(),sent_at timestamptz);
CREATE INDEX IF NOT EXISTS outbox_pending ON outbox(created_at) WHERE sent_at IS NULL;
CREATE TABLE IF NOT EXISTS processed_events(id text PRIMARY KEY,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS sessions(id uuid PRIMARY KEY,user_id uuid NOT NULL,token_hash text UNIQUE NOT NULL,expires_at timestamptz NOT NULL,revoked_at timestamptz);
CREATE TABLE IF NOT EXISTS one_time_tokens(token_hash text PRIMARY KEY,user_id uuid NOT NULL,purpose text NOT NULL,expires_at timestamptz NOT NULL,used_at timestamptz);
CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY,applied_at timestamptz DEFAULT now());

CREATE UNIQUE INDEX IF NOT EXISTS users_unique_email ON records(lower(data->>'email')) WHERE kind='users';
CREATE INDEX IF NOT EXISTS contacts_email ON records(lower(data->>'email')) WHERE kind='contacts';
