//go:build dev
// +build dev

package util

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/go-chi/chi/v5"
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

func Front(r chi.Router) {
	viteProxy := createViteProxy("http://web:5173")
	r.Handle("/*", viteProxy)
	log.Println("Proxying all frontend requests to Vite dev server at http://web:5173")
}
