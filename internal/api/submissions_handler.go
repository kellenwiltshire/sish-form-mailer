package api

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/kellenwiltshire/sish-form-mailer/internal/middleware"
	"github.com/kellenwiltshire/sish-form-mailer/internal/service"
	"github.com/kellenwiltshire/sish-form-mailer/internal/store"
	"github.com/kellenwiltshire/sish-form-mailer/internal/util"

	"github.com/go-chi/chi/v5"
)

type registerSubmissionRequest struct {
	Payload json.RawMessage `json:"payload"`
	Token   string          `json:"token"`
}

type SubmissionHandler struct {
	submissionsStore store.SubmissionsStore
	logger           *log.Logger
}

func NewSubmissionHandler(submissionsStore store.SubmissionsStore, logger *log.Logger) *SubmissionHandler {
	return &SubmissionHandler{
		submissionsStore: submissionsStore,
		logger:           logger,
	}
}

func (h *SubmissionHandler) Recaptcha(token string, siteKey string, r *http.Request) (bool, error) {
	ctx := context.Background()

	captcha, err := service.NewRecaptchaClient()
	if err != nil {
		h.logger.Printf("error create recaptcha client: %v", err)
	}

	assessment, err := captcha.CreateAssessment(
		ctx,
		token,
		siteKey,
		r.Header.Get("User-Agent"),
		r.RemoteAddr,
		"form_submission",
	)
	if err != nil {
		h.logger.Printf("error creating recaptcha assessment: %v", err)
		return true, fmt.Errorf("creating recaptcha assessment: %v", err)
	}

	if assessment.TokenProperties == nil || !assessment.TokenProperties.Valid {
		h.logger.Printf("error invalid recaptcha token: %v", err)
		return true, fmt.Errorf("invalid captcha token", err)
	}

	score := assessment.RiskAnalysis.Score

	if score < 0.5 {
		h.logger.Printf("recaptcha score below threshold: %v", score)
		return true, fmt.Errorf("invalid recaptcha score: %v", score)
	}
	return false, nil
}

func (h *SubmissionHandler) HandleCreateSubmission(w http.ResponseWriter, r *http.Request) {
	siteKey := os.Getenv("RECAPTCHA_SITE_KEY")
	idParam := chi.URLParam(r, "form_id")
	if idParam == "" {
		h.logger.Printf("Invalid Id param")
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "invalid id"})
		return
	}
	var submissionRequest registerSubmissionRequest

	projectID := os.Getenv("RECAPTCHA_PROJECT_ID")
	apiKey := os.Getenv("RECAPTCHA_API_KEY")

	var isRecaptchaEnabled bool

	if projectID == "" || apiKey == "" {
		isRecaptchaEnabled = false
	} else {
		isRecaptchaEnabled = true
	}

	err := json.NewDecoder(r.Body).Decode(&submissionRequest)
	if err != nil {
		h.logger.Printf("Error decoding create submission request %v", err)
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "invalid payload request"})
		return
	}

	if !json.Valid(submissionRequest.Payload) {
		h.logger.Printf("Error invalid json %v", err)
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "invalid submission payload"})
		return
	}

	submission_status := "received"
	var error_reason string

	if isRecaptchaEnabled {
		isSpam, err := h.Recaptcha(submissionRequest.Token, siteKey, r)
		if isSpam {
			submission_status = "spam"
			error_reason = fmt.Sprintf("Spam: %v", err)
		}
	}

	submission := &store.Submission{
		FormId:      idParam,
		Payload:     string(submissionRequest.Payload),
		Status:      submission_status,
		ErrorReason: error_reason,
	}

	err = h.submissionsStore.CreateSubmission(submission)
	if err != nil {
		h.logger.Printf("ERROR: registering submission %v", err)
		util.WriteJSON(w, http.StatusInternalServerError, util.Envelope{"error": "internal server error"})
		return
	}

	util.WriteJSON(w, http.StatusCreated, util.Envelope{"status": "success"})
}

func (h *SubmissionHandler) HandleGetFormSubmissions(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r)

	idParam := chi.URLParam(r, "form_id")
	if idParam == "" {
		h.logger.Printf("Invalid Id param")
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "invalid id"})
		return
	}

	err := h.submissionsStore.DoesUserOwnForm(int64(user.Id), idParam)
	if err != nil {
		h.logger.Printf("Unable to get form ownership %v", err)
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "Unable to get form ownership"})
		return
	}

	submissions, err := h.submissionsStore.GetFormSubmissions(idParam)
	if err != nil {
		h.logger.Printf("ERROR: getSubmissions: %v", err)
		util.WriteJSON(w, http.StatusInternalServerError, util.Envelope{"error": "internal server error"})
		return
	}

	util.WriteJSON(w, http.StatusOK, util.Envelope{"submissions": submissions})
}

func (h *SubmissionHandler) HandleGetFormSubmissionById(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r)

	idParam := chi.URLParam(r, "form_id")
	if idParam == "" {
		h.logger.Printf("Invalid Id param")
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "invalid id"})
		return
	}

	err := h.submissionsStore.DoesUserOwnForm(int64(user.Id), idParam)
	if err != nil {
		h.logger.Printf("Unable to get form ownership %v", err)
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "Unable to get form ownership"})
		return
	}

	submissionParam := chi.URLParam(r, "submission_id")
	if idParam == "" {
		h.logger.Printf("Invalid Id param")
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "invalid id"})
		return
	}

	submissionId, err := strconv.ParseInt(submissionParam, 10, 64)
	if err != nil {
		h.logger.Printf("Unable to parse ID %v", err)
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "Unable to parse id"})
		return
	}

	submission, err := h.submissionsStore.GetFormSubmissionById(submissionId)
	if err != nil {
		h.logger.Printf("ERROR: getSubmission: %v", err)
		util.WriteJSON(w, http.StatusInternalServerError, util.Envelope{"error": "internal server error"})
		return
	}

	util.WriteJSON(w, http.StatusOK, util.Envelope{"submission": submission})
}

func (h *SubmissionHandler) HandleDeleteFormSubmission(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r)

	idParam := chi.URLParam(r, "form_id")
	if idParam == "" {
		h.logger.Printf("Invalid Id param")
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "invalid id"})
		return
	}

	err := h.submissionsStore.DoesUserOwnForm(int64(user.Id), idParam)
	if err != nil {
		h.logger.Printf("Unable to get form ownership %v", err)
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "Unable to get form ownership"})
		return
	}

	submissionParam := chi.URLParam(r, "submission_id")
	if idParam == "" {
		h.logger.Printf("Invalid Id param")
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "invalid id"})
		return
	}

	submissionId, err := strconv.ParseInt(submissionParam, 10, 64)
	if err != nil {
		h.logger.Printf("Unable to parse ID %v", err)
		util.WriteJSON(w, http.StatusBadRequest, util.Envelope{"error": "Unable to parse id"})
		return
	}

	err = h.submissionsStore.DeleteSubmission(submissionId)
	if err == sql.ErrNoRows {
		http.Error(w, "submission not found", http.StatusNotFound)
		return
	}

	if err != nil {
		http.Error(w, "error deleting submission", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
