package routes

import (
	"net/http"

	"github.com/kellenwiltshire/sish-form-mailer/internal/app"
	"github.com/kellenwiltshire/sish-form-mailer/internal/util"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func Routes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Use(cors.Handler(cors.Options{
		AllowOriginFunc: func(r *http.Request, origin string) bool {
			return app.OriginHandler.HandleGetOriginExists(origin, app.AppCache)
		},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
		},
		MaxAge: 300,
	}))

	r.Group(func(r chi.Router) {
		r.Use(app.AuthMiddleware.Authenticate)
		r.Use(app.RateLimiter.RateLimiterMiddleware)

		// User Routes
		r.Get("/api/user", app.AuthMiddleware.RequireUser(app.UserHandler.HandleGetUser))
		r.Put("/api/user", app.AuthMiddleware.RequireUser(app.UserHandler.HandleUpdateUser))

		// Form Routes
		r.Get("/api/forms/{form_id}", app.AuthMiddleware.RequireUser(app.FormHandler.HandleGetForm))
		r.Put("/api/forms/{form_id}", app.AuthMiddleware.RequireUser(app.FormHandler.HandleUpdateForm))
		r.Delete("/api/forms/{form_id}", app.AuthMiddleware.RequireUser(app.FormHandler.HandleDeleteForm))

		r.Get("/api/forms", app.AuthMiddleware.RequireUser(app.FormHandler.HandleGetAllFormsForUser))
		r.Post("/api/forms", app.AuthMiddleware.RequireUser(app.FormHandler.HandleCreateForm))

		r.Get("/api/forms/{form_id}/responses", app.AuthMiddleware.RequireUser(app.SubmissionsHandler.HandleGetFormSubmissions))
		r.Get("/api/forms/{form_id}/responses/{submission_id}", app.AuthMiddleware.RequireUser(app.SubmissionsHandler.HandleGetFormSubmissionById))
		r.Delete("/api/forms/{form_id}/responses/{submission_id}", app.AuthMiddleware.RequireUser(app.SubmissionsHandler.HandleDeleteFormSubmission))

		// SMTP
		r.Get("/api/email-settings", app.AuthMiddleware.RequireUser(app.SMTPHandler.HandleGetSMTPSettings))
		r.Post("/api/email-settings", app.AuthMiddleware.RequireUser(app.SMTPHandler.HandleCreateSmtpSettings))
		r.Put("/api/email-settings", app.AuthMiddleware.RequireUser(app.SMTPHandler.HandleUpdateSmtpSettings))
		r.Delete("/api/email-settings", app.AuthMiddleware.RequireUser(app.SMTPHandler.HandleDeleteSmtpSetting))
		r.Get("/api/email-settings/test", app.AuthMiddleware.RequireUser(app.SMTPHandler.HandleTestEmail))

		// Origins
		r.Get("/api/origins", app.AuthMiddleware.RequireUser(app.OriginHandler.HandleGetOrigins))
		r.Post("/api/origins", app.AuthMiddleware.RequireUser(app.OriginHandler.HandleCreateOrigin))
		r.Delete("/api/origins/{origin_id}", app.AuthMiddleware.RequireUser(app.OriginHandler.HandleDeleteOrigin))

		r.Get("/api/auth/logout", app.TokenHandler.HandleDeleteTokens)
	})

	r.Group(func(r chi.Router) {
		r.Use(app.AuthMiddleware.AuthenticateAdmin)
		r.Use(app.RateLimiter.RateLimiterMiddleware)

		// Admin User Routes
		r.Get("/api/admin/getUsers", app.AuthMiddleware.RequireAdmin(app.UserHandler.HandleGetAllUsers))
		r.Post("/api/admin/createUser", app.AuthMiddleware.RequireAdmin(app.UserHandler.HandleCreateUser))
		r.Put("/api/admin/editUser/{id}", app.AuthMiddleware.RequireAdmin(app.UserHandler.HandleAdminUpdateUser))
		r.Delete("/api/admin/deleteUser/{id}", app.AuthMiddleware.RequireAdmin(app.UserHandler.HandleDeleteUser))
	})

	r.Group(func(r chi.Router) {
		r.Use(app.RateLimiterSubmissions.RateLimiterMiddleware)

		r.Post("/api/forms/{form_id}", app.SubmissionsHandler.HandleCreateSubmission)

		r.Get("/api/auth/forgot-password", app.UserHandler.HandleResetAdminPassword)
	})

	// Login
	r.Post("/api/auth/login", app.TokenHandler.HandleCreateToken)

	util.Front(r)

	return r
}
