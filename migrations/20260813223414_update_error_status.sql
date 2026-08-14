-- +goose Up
ALTER TYPE status_type ADD VALUE 'spam';
-- +goose Down
SELECT 'down SQL query';
