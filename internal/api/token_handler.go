package api

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/kellenwiltshire/sish-form-mailer/internal/middleware"
	"github.com/kellenwiltshire/sish-form-mailer/internal/store"
	"github.com/kellenwiltshire/sish-form-mailer/internal/tokens"
	"github.com/kellenwiltshire/sish-form-mailer/internal/util"
)

type TokenHandler struct {
	tokenStore   store.TokenStore
	userStore    store.UserStore
	lockoutStore store.LockoutStore
	logger       *log.Logger
}

type createTokenRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Remember bool   `json:"remember"`
}

func NewTokenHandler(tokenStore store.TokenStore, userStore store.UserStore, lockoutStore store.LockoutStore, logger *log.Logger) *TokenHandler {
	return &TokenHandler{
		tokenStore:   tokenStore,
		userStore:    userStore,
		lockoutStore: lockoutStore,
		logger:       logger,
	}
}

func (h *TokenHandler) HandleCreateToken(w http.ResponseWriter, r *http.Request) {
	var req createTokenRequest
	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		h.logger.Printf("ERROR: createTokenRequest: %v", err)
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "invalid request payload"})
		return
	}

	// First check to see if this user email is already locked out

	lockout, err := h.lockoutStore.Get(req.Email)
	if err != sql.ErrNoRows {
		h.logger.Printf("ERROR: getLockout: %v", err)
		util.WriteJSON(w, http.StatusInternalServerError, util.Envelope{"error": "internal server error"})
		return
	}

	if lockout != nil {
		if lockout.NumAttempts > 2 && lockout.Expiry.After(time.Now()) {
			h.logger.Printf("LOCKOUT: User Locked Out %v", lockout.Email)
			util.WriteJSON(w, http.StatusUnauthorized, util.Envelope{"error": "login lockout"})
			return
		}
	}

	// Then we can get the user
	user, err := h.userStore.GetUserByEmail(req.Email)
	if err != nil || user == nil {
		h.logger.Printf("ERROR: GetUserByEmail: %v", err)
		util.WriteJSON(w, http.StatusInternalServerError, util.Envelope{"error": "internal server error"})
		return
	}

	passwordsDoMatch, err := user.PasswordHash.Matches(req.Password)
	if err != nil {
		h.logger.Printf("Error: PasswordHash.Matches %v", err)
		util.WriteJSON(w, http.StatusInternalServerError, util.Envelope{"error": "internal server error"})
		return
	}

	if !passwordsDoMatch {
		// Update or Create the lockout entry
		if lockout != nil {
			lockout.NumAttempts += 1
			h.lockoutStore.Update(lockout)
		} else {
			expiry := time.Now().Add(time.Hour)
			h.lockoutStore.Insert(req.Email, expiry)
		}
		util.WriteJSON(w, http.StatusUnauthorized, util.Envelope{"error": "invalid credentials"})
		return
	}

	var scope string

	if user.Role == tokens.ScopeAdmin || user.Role == tokens.ScopeSuper {
		scope = tokens.ScopeAdmin
	} else {
		scope = tokens.ScopeAuth
	}

	ttl := 24 * time.Hour

	if req.Remember {
		ttl = 30 * 24 * time.Hour
	}

	h.logger.Printf("Scope: %v\n", scope)

	token, err := h.tokenStore.CreateNewToken(user.Id, ttl, scope)
	if err != nil {
		h.logger.Printf("Error: Creating Token %v", err)
		util.WriteJSON(w, http.StatusInternalServerError, util.Envelope{"error": "internal server error"})
		return

	}

	http.SetCookie(w, &http.Cookie{
		Name:     "sish-form-mailer-auth",
		Value:    token.Plaintext,
		Expires:  token.Expiry,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
	})

	util.WriteJSON(w, http.StatusCreated, util.Envelope{"auth_token": token})

}

func (h *TokenHandler) HandleDeleteTokens(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r)

	err := h.tokenStore.DeleteAllTokensForUser(user.Id)
	if err != nil {
		h.logger.Printf("Error: Deleting Tokens %v", err)
		util.WriteJSON(w, http.StatusInternalServerError, util.Envelope{"error": "internal server error"})
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
