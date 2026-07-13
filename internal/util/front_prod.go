//go:build !dev
// +build !dev

package util

import (
	"embed"
	"io/fs"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// /go:embed dist/*
var FrontendFS embed.FS

func Front(r chi.Router) {
	// Trim the "client/dist" prefix so the file server reads directly from the root of dist
	staticFiles, err := fs.Sub(FrontendFS, "dist")
	if err != nil {
		log.Fatal("Failed to create sub-filesystem:", err)
	}

	fileServer := http.FileServer(http.FS(staticFiles))

	// Use "/*" so Chi routes /assets/index.js, /favicon.ico, etc. to the fileServer
	r.Handle("/*", fileServer)

	log.Println("Serving production static files from embedded filesystem")
}
