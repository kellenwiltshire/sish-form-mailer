-- +goose Up
ALTER TABLE form_submissions ALTER COLUMN error_reason TYPE VARCHAR(1000);
-- +goose Down
ALTER TABLE form_submissions ALTER COLUMN error_reason TYPE VARCHAR(255);
