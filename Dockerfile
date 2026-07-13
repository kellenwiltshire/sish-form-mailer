# --- Stage 1: Build the React Frontend ---
FROM oven/bun:1.2-alpine AS frontend-builder
WORKDIR /client
COPY client/package.json client/bun.lockb* ./
RUN bun install
COPY client/ ./
RUN bun run build

# --- Stage 2: Build the Go Backend ---
FROM public.ecr.aws/docker/library/golang:1.26.3-alpine AS build
RUN go install github.com/pressly/goose/v3/cmd/goose@latest
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# --- Stage 3: Put the dist folder in place ---
COPY --from=frontend-builder /client/dist ./internal/util/dist

RUN go build -o main .

# --- Stage 4: Final Run Stage ---
FROM alpine:3.20
ENV DOCKERIZE_VERSION=v0.11.0

RUN apk update --no-cache \
    && apk add --no-cache wget openssl \
    && wget -O - https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz | tar xzf - -C /usr/local/bin \
    && apk del wget

WORKDIR /app
COPY --from=build /app/main .
COPY --from=build /go/bin/goose /usr/local/bin/goose
COPY migrations ./migrations

EXPOSE 8080
CMD ["./main"]