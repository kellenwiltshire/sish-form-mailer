package store

import (
	"database/sql"
	"time"
)

type Lockout struct {
	Id          int
	Email       string
	NumAttempts int
	Expiry      time.Time
}

type PostgresLockoutStore struct {
	db *sql.DB
}

func NewPostgresLockoutStore(db *sql.DB) *PostgresLockoutStore {
	return &PostgresLockoutStore{
		db: db,
	}
}

type LockoutStore interface {
	Insert(email string, expiry time.Time) error
	Update(lockout *Lockout) error
	Get(email string) (*Lockout, error)
}

func (l *PostgresLockoutStore) Insert(email string, expiry time.Time) error {
	query := `
		INSERT INTO lockout (email, num_attempts, expiry)
		VALUES ($1, $2, $3)
	`

	_, err := l.db.Exec(query, email, 1, expiry)
	return err
}

func (l *PostgresLockoutStore) Update(lockout *Lockout) error {
	query := `
		UPDATE lockout SET num_attempts = $1, expiry = $2 WHERE id = $3
	`

	result, err := l.db.Exec(query, lockout.NumAttempts, lockout.Expiry, lockout.Id)
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

func (l *PostgresLockoutStore) Get(email string) (*Lockout, error) {
	lockout := &Lockout{}
	query := `
		SELECT id, email, num_attempts, expiry FROM lockout WHERE email = $1 AND expiry > NOW()
	`

	err := l.db.QueryRow(query, email).Scan(&lockout.Id, &lockout.Email, &lockout.NumAttempts, &lockout.Expiry)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return lockout, nil
}
