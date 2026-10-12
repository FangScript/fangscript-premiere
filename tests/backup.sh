#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
test_dir=$(mktemp -d /tmp/fangscript-backup-test.XXXXXX)
cleanup() {
  if [ -f "$test_dir/paths" ]; then
    while IFS= read -r archive_dir; do
      case "$archive_dir" in /tmp/fangscript-backup.*) rm -rf -- "$archive_dir" ;; esac
    done < "$test_dir/paths"
  fi
  case "$test_dir" in /tmp/fangscript-backup-test.*) rm -rf -- "$test_dir" ;; esac
}
trap cleanup EXIT
mkdir "$test_dir/bin"
export TEST_DIR="$test_dir"
cat > "$test_dir/bin/pg_dump" <<'SH'
#!/bin/sh
echo dump >> "$TEST_DIR/calls"
[ "$FAIL_AT" != dump ] || exit 1
echo archive
SH
cat > "$test_dir/bin/pg_restore" <<'SH'
#!/bin/sh
echo verify >> "$TEST_DIR/calls"
[ "$FAIL_AT" != verify ]
SH
cat > "$test_dir/bin/aws" <<'SH'
#!/bin/sh
echo upload >> "$TEST_DIR/calls"
[ "$FAIL_AT" != upload ]
SH
# Track real temporary archives so failed runs are cleaned after the test.
cat > "$test_dir/bin/mktemp" <<'SH'
#!/bin/sh
archive_dir=$(/usr/bin/mktemp "$@") || exit 1
echo "$archive_dir" >> "$TEST_DIR/paths"
echo "$archive_dir"
SH
chmod +x "$test_dir/bin/"*
for failure in dump verify upload none; do
  : > "$test_dir/calls"
  if PATH="$test_dir/bin:$PATH" FAIL_AT="$failure" BACKUP_BUCKET=test BACKUP_ENDPOINT=https://example.invalid AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test BACKUP_ONCE=true sh "$root/infra/backup/run.sh" > "$test_dir/output" 2>&1; then
    result=0
  else
    result=$?
  fi
  if [ "$failure" = none ]; then
    [ "$result" = 0 ]
    grep -q 'backup completed' "$test_dir/output"
    [ "$(grep -c upload "$test_dir/calls")" = 16 ]
  else
    [ "$result" != 0 ]
    grep -q 'BACKUP FAILED' "$test_dir/output"
    ! grep -q 'backup completed' "$test_dir/output"
    [ "$(grep -c dump "$test_dir/calls")" = 1 ]
    if [ "$failure" = dump ]; then ! grep -q verify "$test_dir/calls"; fi
    if [ "$failure" != upload ]; then ! grep -q upload "$test_dir/calls"; fi
  fi
  echo "Backup $failure scenario passed"
done
