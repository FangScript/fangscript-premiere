#!/bin/sh
# Usage inside a PostgreSQL client container: sh restore-drill.sh module /path/to/archive.dump
# Restores into a NEW isolated database; never replaces production data.
set -eu
module=${1:?Supply the module name}
archive=${2:?Supply the downloaded archive path}
case "$module" in auth|cms|lead|crm|project|file|proposal|billing|notification|automation|marketing|analytics|audit|rag|chatbot|agent) ;; *) exit 1 ;; esac
restore_db="restore_${module}_$(date -u +%Y%m%d%H%M%S)"
createdb -h postgres -U postgres "$restore_db"
pg_restore -h postgres -U postgres --no-owner --no-acl --exit-on-error --dbname "$restore_db" "$archive"
psql -h postgres -U postgres --dbname "$restore_db" -v ON_ERROR_STOP=1 -c 'SELECT count(*) FROM information_schema.tables WHERE table_schema = '\''public'\'';'
echo "Restored successfully into $restore_db. Review it before removing this drill database."
