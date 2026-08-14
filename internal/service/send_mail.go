package service

import (
	"bytes"
	"embed"
	"encoding/json"
	"fmt"
	"log"
	netSmtp "net/smtp"
	"strconv"
	"text/template"
	"time"

	"github.com/kellenwiltshire/sish-form-mailer/internal/store"
)

//go:embed email-template.html
var templateFS embed.FS

type SendMailService struct {
	formStore        store.FormStore
	submissionsStore store.SubmissionsStore
	smtpStore        store.SmtpStore
	logger           *log.Logger
}

func NewSendMailService(formStore store.FormStore, submissionsStore store.SubmissionsStore, smtpStore store.SmtpStore, logger *log.Logger) *SendMailService {
	return &SendMailService{
		formStore:        formStore,
		submissionsStore: submissionsStore,
		smtpStore:        smtpStore,
		logger:           logger,
	}
}

func (s *SendMailService) SendMail(submissionId int64) error {
	submission, err := s.submissionsStore.GetFormSubmissionById(submissionId)
	if err != nil {
		error := fmt.Sprintf("Error sending email: %v", err)
		err = s.submissionsStore.UpdateSubmissionStatus(submissionId, error, "error")
		return err
	}

	form, err := s.formStore.GetFormInfoForEmail(submission.FormId)
	if err != nil {
		error := fmt.Sprintf("Error sending email: %v", err)
		err = s.submissionsStore.UpdateSubmissionStatus(submissionId, error, "error")

		return err
	}

	smtp, pass, err := s.smtpStore.GetSmtpEmailSettings(int64(form.UserId))
	if err != nil {
		error := fmt.Sprintf("Error sending email: %v", err)
		err = s.submissionsStore.UpdateSubmissionStatus(submissionId, error, "error")

		return err
	}

	auth := netSmtp.PlainAuth("", smtp.Username, pass, smtp.Host)

	t, err := template.ParseFS(templateFS, "email-template.html")
	if err != nil {
		s.logger.Printf("Failed to parse embedded template: %v", err)
		error := fmt.Sprintf("Error sending email: %v", err)
		err = s.submissionsStore.UpdateSubmissionStatus(submissionId, error, "error")

		return err
	}

	var body bytes.Buffer

	subject := fmt.Sprintf("Form Response for %s", form.Name)

	body.WriteString(fmt.Sprintf("From: %s\r\n", smtp.SenderEmail))
	body.WriteString(fmt.Sprintf("To: %s\r\n", form.TargetEmail))
	body.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	body.WriteString("MIME-Version: 1.0\r\n")
	body.WriteString("Content-Type: text/html; charset=utf-8\r\n\r\n")

	var payloadData map[string]any
	if err := json.Unmarshal([]byte(submission.Payload), &payloadData); err != nil {
		s.logger.Printf("Error unmarshaling payload: %v", err)
		return err
	}

	parsedTime, err := time.Parse(time.RFC3339Nano, submission.SubmittedAt)
	if err != nil {
		s.logger.Printf("Error parsing time: %v\n", err)
		error := fmt.Sprintf("Error sending email: %v", err)
		err = s.submissionsStore.UpdateSubmissionStatus(submissionId, error, "error")

		return err
	}

	formattedTime := parsedTime.Format("2006-01-02 03:04 PM")

	err = t.Execute(&body, struct {
		Name     string
		Received string
		Payload  map[string]any
	}{
		Name:     form.Name,
		Received: formattedTime,
		Payload:  payloadData,
	})
	if err != nil {
		s.logger.Printf("Error creating template: %v\n", err)
		return err
	}

	to := []string{form.TargetEmail}

	err = netSmtp.SendMail(smtp.Host+":"+strconv.Itoa(smtp.Port), auth, smtp.SenderEmail, to, body.Bytes())
	if err != nil {
		s.logger.Printf("Error sending email: %v", err)
		err = s.submissionsStore.UpdateSubmissionStatus(submissionId, "Error sending email", "error")
		return err
	}

	err = s.submissionsStore.UpdateSubmissionStatus(submissionId, "", "dispatched")
	if err != nil {
		s.logger.Printf("Error updating status: %v", err)
		error := fmt.Sprintf("Error sending email: %v", err)
		err = s.submissionsStore.UpdateSubmissionStatus(submissionId, error, "error")

		return err
	}
	return nil
}

func (s *SendMailService) TestSendMail(userId int64, testPayload string) error {
	smtp, pass, err := s.smtpStore.GetSmtpEmailSettings(int64(userId))
	if err != nil {
		s.logger.Printf("Error GetSmtpEmailSettings: %v", err)
		return err
	}

	// use exported Plaintext field of PasswordEncrypted
	auth := netSmtp.PlainAuth("", smtp.Username, pass, smtp.Host)

	to := []string{smtp.RecipientEmail}
	msg := []byte("To: " + smtp.RecipientEmail + "\r\n" +
		"Subject: Testing Email Settings From sish-form-mailer\r\n" +
		"\r\n" +
		testPayload)

	err = netSmtp.SendMail(smtp.Host+":"+strconv.Itoa(smtp.Port), auth, smtp.SenderEmail, to, msg)
	if err != nil {
		return err
	}

	return nil
}
