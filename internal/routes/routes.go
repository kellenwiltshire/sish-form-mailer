package routes

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/kellenwiltshire/formality/internal/app"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func createViteProxy(target string) http.Handler {
	url, err := url.Parse(target)
	if err != nil {
		log.Fatal(err)
	}
	proxy := httputil.NewSingleHostReverseProxy(url)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Update the request to point to the Vite server
		r.Host = url.Host
		r.URL.Scheme = url.Scheme
		r.URL.Host = url.Host
		proxy.ServeHTTP(w, r)
	})
}

func Routes(app *app.Application) *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	viteProxy := createViteProxy("http://web:5173")

	r.Group(func(r chi.Router) {
		r.Use(app.Middleware.Authenticate)

		// User Routes
		r.Get("/api/user", app.Middleware.RequireUser(app.UserHandler.HandleGetUser))
		r.Put("/api/user", app.Middleware.RequireUser(app.UserHandler.HandleUpdateUser))
		// r.Delete("/api/user", app.Middleware.RequireUser(app.UserHandler.HandleDeleteUser))

		// Form Routes
		r.Get("/api/forms/{form_id}", app.Middleware.RequireUser(app.FormHandler.HandleGetForm))
		r.Put("/api/forms/{form_id}", app.Middleware.RequireUser(app.FormHandler.HandleUpdateForm))
		r.Delete("/api/forms/{form_id}", app.Middleware.RequireUser(app.FormHandler.HandleDeleteForm))

		r.Get("/api/forms", app.Middleware.RequireUser(app.FormHandler.HandleGetAllFormsForUser))
		r.Post("/api/forms", app.Middleware.RequireUser(app.FormHandler.HandleCreateForm))

		r.Get("/api/forms/{form_id}/responses", app.Middleware.RequireUser(app.SubmissionsHandler.HandleGetFormSubmissions))
		r.Get("/api/forms/{form_id}/responses/{submission_id}", app.Middleware.RequireUser(app.SubmissionsHandler.HandleGetFormSubmissionById))
		r.Delete("/api/forms/{form_id}/responses/{submission_id}", app.Middleware.RequireUser(app.SubmissionsHandler.HandleDeleteFormSubmission))

		// SMTP
		r.Get("/api/email-settings", app.Middleware.RequireUser(app.SMTPHandler.HandleGetSMTPSettings))
		r.Post("/api/email-settings", app.Middleware.RequireUser(app.SMTPHandler.HandleCreateSmtpSettings))
		r.Put("/api/email-settings", app.Middleware.RequireUser(app.SMTPHandler.HandleUpdateSmtpSettings))
		r.Delete("/api/email-settings", app.Middleware.RequireUser(app.SMTPHandler.HandleDeleteSmtpSetting))
		r.Get("/api/email-settings/test", app.Middleware.RequireUser(app.SMTPHandler.HandleTestEmail))

		r.Get("/api/auth/logout", app.TokenHandler.HandleDeleteTokens)
	})

	r.Group(func(r chi.Router) {
		r.Use(app.Middleware.AuthenticateAdmin)

		// Admin User Routes
		r.Get("/api/admin/getUsers", app.Middleware.RequireAdmin(app.UserHandler.HandleGetAllUsers))
		r.Post("/api/admin/createUser", app.Middleware.RequireAdmin(app.UserHandler.HandleCreateUser))
		r.Put("/api/admin/editUser/{id}", app.Middleware.RequireAdmin(app.UserHandler.HandleCreateUser))
		r.Delete("/api/admin/deleteUser/{id}", app.Middleware.RequireAdmin(app.UserHandler.HandleDeleteUser))

	})

	r.Post("/api/forms/{form_id}", app.SubmissionsHandler.HandleCreateSubmission)

	// Login
	r.Post("/api/auth/login", app.TokenHandler.HandleCreateToken)

	r.Handle("/*", viteProxy)

	return r
}
