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

# ---------------------------------------------------------------
# Group Setup: Check if group name OR PGID already exists
# ---------------------------------------------------------------
# Check if a group with this PGID already exists (e.g., 'users' GID 100)
EXISTING_GROUP_BY_GID=$(getent group "$PGID" | cut -d: -f1)

if [ -n "$EXISTING_GROUP_BY_GID" ]; then
    # Group with this GID already exists, use its name
    GROUP_NAME="$EXISTING_GROUP_BY_GID"
elif getent group appgroup >/dev/null 2>&1; then
    # Group 'appgroup' already exists under a different GID
    GROUP_NAME="appgroup"
else
    # Neither name nor GID exists, safe to create
    addgroup -g "$PGID" appgroup
    GROUP_NAME="appgroup"
fi

# ---------------------------------------------------------------
# User Setup: Check if user name OR PUID already exists
# ---------------------------------------------------------------
EXISTING_USER_BY_UID=$(getent passwd "$PUID" | cut -d: -f1)

if [ -n "$EXISTING_USER_BY_UID" ]; then
    USER_NAME="$EXISTING_USER_BY_UID"
elif getent passwd appuser >/dev/null 2>&1; then
    USER_NAME="appuser"
else
    adduser -u "$PUID" -G "$GROUP_NAME" -D -s /bin/sh appuser
    USER_NAME="appuser"
fi

# Ensure ownership of the application directory
chown -R "$PUID:$PGID" /app

# Run goose migrations as the determined user
if [ -f "/usr/local/bin/goose" ] && [ -d "/app/migrations" ]; then
    DB_STRING="postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE_NAME}?sslmode=disable"
    su-exec "$USER_NAME" goose -dir /app/migrations postgres "$DB_STRING" up || echo "Goose migration skipped or failed on startup"
fi

# Drop privileges and execute the main application process
exec su-exec "$USER_NAME" "$@"