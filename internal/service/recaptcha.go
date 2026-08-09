package service

import (
	"context"
	"fmt"
	"os"

	recaptcha "cloud.google.com/go/recaptchaenterprise/v2/apiv1"
	recaptchapb "cloud.google.com/go/recaptchaenterprise/v2/apiv1/recaptchaenterprisepb"
)

func CreateAssessment(token string) error {
	projectId := os.Getenv("GOOGLE_PROJECT_ID")
	if projectId == "" {
		return fmt.Errorf("Error: Must provide projectId")
	}
	recaptchaKey := os.Getenv("GOOGLE_RECAPTCHA_KEY")
	if recaptchaKey == "" {
		return fmt.Errorf("Error: Must provide Recaptcha Key")
	}

	action := os.Getenv("GOOGLE_RECAPTCHA_ACTION")
	if action == "" {
		return fmt.Errorf("Error: Must provide recaptcha action")
	}

	ctx := context.Background()
	client, err := recaptcha.NewClient(ctx)
	if err != nil {
		return fmt.Errorf("Error creating captcha client")
	}
	defer client.Close()

	event := &recaptchapb.Event{
		Token:   token,
		SiteKey: recaptchaKey,
	}

	assessment := &recaptchapb.Assessment{
		Event: event,
	}

	request := &recaptchapb.CreateAssessmentRequest{
		Assessment: assessment,
		Parent:     fmt.Sprintf("projects/%s", projectId),
	}

	response, err := client.CreateAssessment(ctx, request)
	if err != nil {
		return fmt.Errorf("Error calling Create Assessment")
	}

	// Check that the Token is valid
	if !response.TokenProperties.Valid {
		return fmt.Errorf("Token Invalid")
	}

	// Check that the action was valid
	if response.TokenProperties.Action != action {
		return fmt.Errorf("Invalid Action")
	}

	// Get the risk score. If below 0.7, reject
	if response.RiskAnalysis.Score < 0.7 {
		return fmt.Errorf("Rejected. Score %v", response.RiskAnalysis.Score)
	}

	// Score is above threshold, return true and allow submission
	return nil
}
