#!/bin/sh
set -e

# Default to UID/GID 1000 if not passed
PUID=${PUID:-1000}
PGID=${PGID:-1000}
TZ=${TZ:-UTC}

# Configure Timezone
if [ -f "/usr/share/zoneinfo/$TZ" ]; then
    ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime
    echo "$TZ" > /etc/timezone
fi

# Create or modify the group matching PGID
if ! getent group appgroup >/dev/null 2>&1; then
    addgroup -g "$PGID" appgroup
fi

# Create or modify the user matching PUID
if ! getent passwd appuser >/dev/null 2>&1; then
    adduser -u "$PUID" -G appgroup -D -s /bin/sh appuser
fi

# Ensure ownership of the application directory
chown -R "$PUID:$PGID" /app

# Run goose migrations as appuser (if database is ready)
if [ -f "/usr/local/bin/goose" ] && [ -d "/app/migrations" ]; then
    DB_STRING="postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE_NAME}?sslmode=disable"
    su-exec appuser goose -dir /app/migrations postgres "$DB_STRING" up || echo "Goose migration skipped or failed on startup"
fi

# Drop privileges and execute the main application process
exec su-exec appuser "$@"