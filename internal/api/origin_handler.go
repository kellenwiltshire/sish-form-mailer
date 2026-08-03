package api

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/kellenwiltshire/sish-form-mailer/internal/middleware"
	"github.com/kellenwiltshire/sish-form-mailer/internal/store"
	"github.com/kellenwiltshire/sish-form-mailer/internal/util"
	"github.com/patrickmn/go-cache"
)

type CreateOriginRequest struct {
	Origin string `json:"origin"`
}

type OriginHandler struct {
	originStore store.OriginStore
	logger      *log.Logger
}

func NewOriginHandler(originStore store.OriginStore, logger *log.Logger) *OriginHandler {
	return &OriginHandler{
		originStore: originStore,
		logger:      logger,
	}
}

func (h *OriginHandler) HandleCreateOrigin(w http.ResponseWriter, r *http.Request) {
	var req CreateOriginRequest
	user := middleware.GetUser(r)

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		h.logger.Printf("Error decoding create origin request %v", err)
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "invalid request payload"})
		return
	}

	origin := &store.Origin{
		UserId: user.Id,
		Origin: req.Origin,
	}

	err = h.originStore.CreateOrigin(origin)
	if err != nil {
		h.logger.Printf("ERROR: registering origin %v", err)
		util.WriteJSON(w, http.StatusInternalServerError, util.Envelope{"error": "internal server error"})
		return
	}

	util.WriteJSON(w, http.StatusCreated, util.Envelope{"origin": origin})
}

func (h *OriginHandler) HandleGetOrigins(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r)

	origins, err := h.originStore.GetOrigins(int64(user.Id))
	if err != nil {
		h.logger.Printf("ERROR: Get Origins: %v", err)
		util.WriteJSON(w, http.StatusInternalServerError, util.Envelope{"error": "Error getting all origins for user"})
		return
	}

	util.WriteJSON(w, http.StatusOK, util.Envelope{"origins": origins})
}

func (h *OriginHandler) HandleDeleteOrigin(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r)

	originId := chi.URLParam(r, "origin_id")
	if originId == "" {
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "invalid id"})
	}

	err := h.originStore.DeleteOrigin(originId, int64(user.Id))
	if err == sql.ErrNoRows {
		http.Error(w, "origin not found", http.StatusNotFound)
		return
	}

	if err != nil {
		http.Error(w, "error deleting origin", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *OriginHandler) HandleGetOriginExists(origin string, appCache *cache.Cache) bool {
	h.logger.Printf("Checking Origin Cache: %v", origin)
	if val, found := appCache.Get(origin); found {
		return val.(bool)
	}

	initialOrigin := os.Getenv("INITIAL_ORIGIN")
	if initialOrigin == "" {
		h.logger.Println("ERROR: No Origin Provided in Env")
	}

	appCache.Set(initialOrigin, true, cache.DefaultExpiration)

	if initialOrigin == origin {
		return true
	}

	exists, err := h.originStore.GetOriginExists(origin)
	if err != nil {
		h.logger.Printf("ERROR: Get Origin Exists: %v", err)
		return false
	}

	appCache.Set(origin, exists, cache.DefaultExpiration)

	return exists
}
