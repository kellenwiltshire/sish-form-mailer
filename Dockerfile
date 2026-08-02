# --- Stage 1: Build the React Frontend ---
FROM oven/bun:1.2-alpine AS frontend-builder
WORKDIR /client
COPY client/package.json client/bun.lock* ./
RUN bun install --frozen-lockfile
COPY client/ ./
RUN bun run build

# --- Stage 2: Build the Go Backend ---
FROM public.ecr.aws/docker/library/golang:1.26.3-alpine AS build

RUN go install github.com/pressly/goose/v3/cmd/goose@v3.24.1

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
COPY --from=frontend-builder /client/dist ./internal/util/dist

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main .

# --- Stage 3: Final Run Stage ---
FROM alpine:3.20

# Install runtime utilities for timezone support and privilege dropping
RUN apk add --no-cache ca-certificates tzdata su-exec

WORKDIR /app

# Copy artifacts from build stage
COPY --from=build /app/main .
COPY --from=build /go/bin/goose /usr/local/bin/goose
COPY migrations ./migrations

# Copy and configure entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8080

# Keep image running as root initially so entrypoint can adjust PUID/PGID
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["./main"]