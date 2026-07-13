package app

import (
	"database/sql"
	"log"
	"os"
	"time"

	"github.com/kellenwiltshire/formality/internal/api"
	"github.com/kellenwiltshire/formality/internal/middleware"
	"github.com/kellenwiltshire/formality/internal/service"
	"github.com/kellenwiltshire/formality/internal/store"
	"github.com/kellenwiltshire/formality/migrations"
)

type Application struct {
	Logger             *log.Logger
	Db                 *sql.DB
	UserHandler        *api.UserHandler
	FormHandler        *api.FormHandler
	SMTPHandler        *api.SmtpHandler
	SubmissionsHandler *api.SubmissionHandler
	TokenHandler       *api.TokenHandler

	SendMailService *service.SendMailService

	AuthMiddleware         middleware.UserMiddleware
	RateLimiter            *middleware.LimiterMiddleware
	RateLimiterSubmissions *middleware.LimiterMiddleware
}

func NewApplication() (*Application, error) {
	pgDb, err := store.ConnectDatabase()
	if err != nil {
		return nil, err
	}

	err = store.MigrateFs(pgDb, migrations.FS, ".")
	if err != nil {
		panic(err)
	}

	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	userStore := store.NewPostgresUserStore(pgDb)
	formStore := store.NewPostgresFormStore(pgDb)
	smtpStore := store.NewPostgresSmtpStore(pgDb)
	submissionsStore := store.NewPostgresSubmissionsStore(pgDb)
	tokenStore := store.NewPostgresTokenStore(pgDb)

	userHandler := api.NewUserHandler(userStore, logger)
	formHandler := api.NewFormHandler(formStore, logger)
	submissionsHandler := api.NewSubmissionHandler(submissionsStore, logger)
	tokenHandler := api.NewTokenHandler(tokenStore, userStore, logger)

	sendMailService := service.NewSendMailService(formStore, submissionsStore, smtpStore, logger)
	smtpHandler := api.NewSmtpHandler(smtpStore, *sendMailService, logger)

	AuthMiddleware := middleware.UserMiddleware{UserStore: userStore}

	rateLimiter := middleware.NewLimiterMiddleware(logger, 10, 1, time.Second)
	rateLimiterSubmissions := middleware.NewLimiterMiddleware(logger, 2, 1, 12*time.Hour)

	app := &Application{
		Logger:             logger,
		Db:                 pgDb,
		UserHandler:        userHandler,
		FormHandler:        formHandler,
		SMTPHandler:        smtpHandler,
		SubmissionsHandler: submissionsHandler,
		TokenHandler:       tokenHandler,

		SendMailService: sendMailService,

		AuthMiddleware:         AuthMiddleware,
		RateLimiter:            rateLimiter,
		RateLimiterSubmissions: rateLimiterSubmissions,
	}

	return app, nil
}
