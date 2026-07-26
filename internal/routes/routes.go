package routes

import (
	"github.com/kellenwiltshire/sish-form-mailer/internal/app"
	"github.com/kellenwiltshire/sish-form-mailer/internal/util"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func Routes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Group(func(r chi.Router) {
		r.Use(app.AuthMiddleware.Authenticate)
		r.Use(app.RateLimiter.RateLimiterMiddleware)

		// User Routes
		r.Get("/api/user", app.AuthMiddleware.RequireUser(app.UserHandler.HandleGetUser))
		r.Put("/api/user", app.AuthMiddleware.RequireUser(app.UserHandler.HandleUpdateUser))
		// r.Delete("/api/user", app.AuthMiddleware.RequireUser(app.UserHandler.HandleDeleteUser))

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
