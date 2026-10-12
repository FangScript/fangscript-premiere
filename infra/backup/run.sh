#!/bin/sh
set -eu
if [ -z "${BACKUP_BUCKET:-}" ] || [ -z "${AWS_ACCESS_KEY_ID:-}" ] || [ -z "${AWS_SECRET_ACCESS_KEY:-}" ]; then
  echo 'Off-server backups are not configured.' >&2
  exit 1
fi
umask 077
run_backup() {
  stamp=$(date -u +%Y-%m-%dT%H-%M-%SZ)
  backup_dir=$(mktemp -d /tmp/fangscript-backup.XXXXXX) || return 1
  for module in auth cms lead crm project file proposal billing notification automation marketing analytics audit rag chatbot agent; do
    pg_dump -h postgres -U postgres -Fc "fs_$module" > "$backup_dir/$module.dump" || return 1
    pg_restore --list "$backup_dir/$module.dump" >/dev/null || return 1
    aws --endpoint-url "$BACKUP_ENDPOINT" s3 cp "$backup_dir/$module.dump" "s3://$BACKUP_BUCKET/$stamp/$module.dump" --only-show-errors || return 1
  done
  echo "$stamp backup completed and archive manifests verified"
  # Only this process's checked, fixed-prefix temporary directory is cleaned.
  case "$backup_dir" in /tmp/fangscript-backup.*) rm -rf -- "$backup_dir" ;; *) exit 1 ;; esac
}
while true; do
  if ! run_backup; then echo 'BACKUP FAILED: inspect storage and database connectivity' >&2; exit 1; fi
  [ "${BACKUP_ONCE:-false}" = true ] && exit 0
  sleep 86400
done
