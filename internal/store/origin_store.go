package store

import "database/sql"

type Origin struct {
	Id        int    `json:"id"`
	UserId    int    `json:"user_id"`
	Origin    string `json:"origin"`
	CreatedAt string `json:"created_at"`
}

type PostgresOriginStore struct {
	db *sql.DB
}

func NewPostgresOriginStore(db *sql.DB) *PostgresOriginStore {
	return &PostgresOriginStore{
		db: db,
	}
}

type OriginStore interface {
	CreateOrigin(*Origin) error
	GetOrigins(user_id int64) ([]Origin, error)
	GetAllOrigins() ([]Origin, error)
	GetOriginExists(origin string) (bool, error)
	DeleteOrigin(id string, user_id int64) error
}

func (s *PostgresOriginStore) CreateOrigin(origin *Origin) error {
	query := `
		INSERT INTO origins (origin, user_id) VALUES ($1, $2) RETURNING id
	`

	err := s.db.QueryRow(query, origin.Origin, origin.UserId).Scan(&origin.Id)
	if err != nil {
		return err
	}

	return nil
}

func (s *PostgresOriginStore) GetOrigins(user_id int64) ([]Origin, error) {
	query := `
		SELECT id, user_id, origin, created_at FROM origins WHERE user_id = $1
	`

	rows, err := s.db.Query(query, user_id)
	if err != nil {
		return nil, err
	}
	if rows.Err() != nil {
		return nil, rows.Err()
	}

	var origins []Origin
	for rows.Next() {
		var origin Origin
		err := rows.Scan(&origin.Id, &origin.UserId, &origin.Origin, &origin.CreatedAt)
		if err != nil {
			return nil, err
		}
		origins = append(origins, origin)
	}

	return origins, nil
}

func (s *PostgresOriginStore) GetAllOrigins() ([]Origin, error) {
	query := `
		SELECT id, origin FROM origins
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}

	var origins []Origin
	for rows.Next() {
		var origin Origin
		err := rows.Scan(&origin.Id, &origin.UserId, &origin.Origin)
		if err != nil {
			return nil, err
		}
		origins = append(origins, origin)
	}

	return origins, nil
}

func (s *PostgresOriginStore) GetOriginExists(origin string) (bool, error) {
	query := `
		SELECT EXISTS(SELECT 1 FROM origins WHERE origin = $1)
	`

	var exists bool

	err := s.db.QueryRow(query, origin).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (s *PostgresOriginStore) DeleteOrigin(id string, user_id int64) error {
	query := `
		DELETE FROM origins WHERE id = $1 AND user_id = $2
	`

	result, err := s.db.Exec(query, id, user_id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}
