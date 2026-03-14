#!/bin/sh
set -eu

APP_USER="nodejs"
APP_GROUP="nodejs"

ensure_writable_dir() {
  dir_path="$1"
  mkdir -p "$dir_path"
  chown -R "$APP_USER":"$APP_GROUP" "$dir_path"
}

ensure_writable_dir "/app/logs"
ensure_writable_dir "/app/node_modules"
ensure_writable_dir "/app/dist"

exec su-exec "$APP_USER":"$APP_GROUP" "$@"
