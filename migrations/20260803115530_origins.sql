-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS origins (
  id SERIAL PRIMARY KEY,
  origin VARCHAR(255) UNIQUE NOT NULL,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_origins_lookup ON origins(origin);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_origins_lookup;
DROP TABLE origins;
-- +goose StatementEnd