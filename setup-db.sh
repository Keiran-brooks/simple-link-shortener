#!/usr/bin/env bash

set -euo pipefail

read -r -p "Database host [127.0.0.1]: " DB_HOST
DB_HOST=${DB_HOST:-127.0.0.1}

read -r -p "Database port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -r -p "Database name [mydb]: " DB_NAME
DB_NAME=${DB_NAME:-mydb}

read -r -p "Database user [myuser]: " DB_USER
DB_USER=${DB_USER:-myuser}

read -r -s -p "Database password [mypasssword]: " DB_PASSWORD
printf '\n'
DB_PASSWORD=${DB_PASSWORD:-mypasssword}

read -r -p "Domain [https://127.0.0.1:8080]: " DOMAIN
DOMAIN=${DOMAIN:-https://127.0.0.1:8080}

read -r -p "Table name [links]: " TABLE_NAME
TABLE_NAME=${TABLE_NAME:-links}

export PGPASSWORD="$DB_PASSWORD"

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<SQL
CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
  id SERIAL PRIMARY KEY,
  shorturl TEXT,
  longurl TEXT
);
SQL

cat > .env <<EOF
DATABASEUSER=$DB_USER
DATABASEPASSWORD=$DB_PASSWORD
DATABASEHOST=$DB_HOST
DATABASEPORT=$DB_PORT
DATABASENAME=$DB_NAME
DOMAIN=$DOMAIN
EOF

echo "Database table is ready."
echo ".env has been written with the values you entered."