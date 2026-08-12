package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type Client struct {
	projectID string
	apiKey    string
	http      *http.Client
}

func NewRecaptchaClient() (*Client, error) {
	projectID := os.Getenv("RECAPTCHA_PROJECT_ID")
	apiKey := os.Getenv("RECAPTCHA_API_KEY")

	if projectID == "" {
		return nil, fmt.Errorf("RECATPCHA_PROJECT_ID is not set")
	}

	if apiKey == "" {
		return nil, fmt.Errorf("RECAPTCHA_API_KEY is not set")
	}

	return &Client{
		projectID: projectID,
		apiKey:    apiKey,
		http:      &http.Client{},
	}, nil
}

type assessmentRequest struct {
	Event event `json:"event"`
}

type event struct {
	Token          string `json:"token"`
	SiteKey        string `json:"siteKey"`
	UserAgent      string `json:"userAgent,omitempty"`
	UserIPAddress  string `json:"userIpAddress,omitempty"`
	ExpectedAction string `json:"expectedAction,omitempty"`
}

type assessmentResponse struct {
	TokenProperties *tokenProperties `json:"TokenProperties,omitempty"`
	RiskAnalysis    *riskAnalysis    `json:"riskAnalysis,omitempty"`
	Event           *event           `json:"event,omitempty"`
}

type tokenProperties struct {
	Valid    bool   `json:"valid"`
	Hostname string `json:"hostname,omitempty"`
	Action   string `json:"action,omitempty"`
}

type riskAnalysis struct {
	Score   float64  `json:"score"`
	Reasons []string `json:"reasons,omitempty"`
}

func (c *Client) CreateAssessment(ctx context.Context, token string, siteKey string, userAgent string, userIP string, expectedAction string) (*assessmentResponse, error) {
	reqBody := assessmentRequest{
		Event: event{
			Token:          token,
			SiteKey:        siteKey,
			UserAgent:      userAgent,
			UserIPAddress:  userIP,
			ExpectedAction: expectedAction,
		},
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("marshal recaptcha request: %w", err)
	}

	url := fmt.Sprintf("https://recaptchaenterprise.googleapis.com/v1/projects/%s/assessments?key=%s", c.projectID, c.apiKey)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create recaptcha request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("send recaptcha request: %w", err)
	}

	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var errorBody struct {
			Error struct {
				Code    int    `json:"code"`
				Message string `json:"message"`
				Status  string `json:"status"`
			} `json:"error"`
		}

		_ = json.NewDecoder(resp.Body).Decode(&errorBody)

		return nil, fmt.Errorf("recaptcha API error: HTTP %d: %s", resp.StatusCode, errorBody.Error.Message)
	}

	var result assessmentResponse

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode recaptcha response: %w", err)
	}

	return &result, nil
}
