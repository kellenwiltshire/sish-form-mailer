-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS lockout (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  num_attempts INT NOT NULL,
  expiry TIMESTAMP(0) WITH TIME ZONE NOT NULL
)
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE tokens;
-- +goose StatementEnd