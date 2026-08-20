//go:build !dev
// +build !dev

package util

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
)

//go:embed all:dist
var FrontendFS embed.FS

func Front(r chi.Router) {
	// Sub into 'dist' so the root of staticFiles is the contents of the dist folder
	staticFiles, err := fs.Sub(FrontendFS, "dist")
	if err != nil {
		log.Fatal("Failed to create sub-filesystem:", err)
	}

	fileServer := http.FileServer(http.FS(staticFiles))

	r.Handle("/*", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		path := strings.TrimPrefix(req.URL.Path, "/")

		if path != "" {
			if _, err := fs.Stat(staticFiles, path); err == nil {
				fileServer.ServeHTTP(w, req)
				return
			}
		}

		req.URL.Path = "/index.html"
		fileServer.ServeHTTP(w, req)
	}))
	log.Println("Serving production static files from embedded filesystem")
}
