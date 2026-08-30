# SiSH Form Mailer API

HTTP API documentation for SiSH Form Mailer.

SiSH Form Mailer is a self-hosted form backend that accepts form submissions, stores responses, and forwards submissions through configurable SMTP settings.

The API routes are defined in `internal/routes`, with their handlers implemented in `internal/api`.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [API Overview](#api-overview)
- [Authentication Endpoints](#authentication-endpoints)
  - [POST `/api/auth/login`](#post-apiauthlogin)
  - [GET `/api/auth/logout`](#get-apiauthlogout)
  - [GET `/api/auth/forgot-password`](#get-apiauthforgot-password)
- [User Endpoints](#user-endpoints)
  - [GET `/api/user`](#get-apiuser)
  - [PUT `/api/user`](#put-apiuser)
- [Form Endpoints](#form-endpoints)
  - [GET `/api/forms`](#get-apiforms)
  - [POST `/api/forms`](#post-apiforms)
  - [GET `/api/forms/{form_id}`](#get-apiformsform_id)
  - [PUT `/api/forms/{form_id}`](#put-apiformsform_id)
  - [DELETE `/api/forms/{form_id}`](#delete-apiformsform_id)
- [Form Submissions](#form-submissions)
  - [POST `/api/forms/{form_id}`](#post-apiformsform_id)
  - [GET `/api/forms/{form_id}/responses`](#get-apiformsform_idresponses)
  - [GET `/api/forms/{form_id}/responses/{submission_id}`](#get-apiformsform_idresponsessubmission_id)
  - [DELETE `/api/forms/{form_id}/responses/{submission_id}`](#delete-apiformsform_idresponsessubmission_id)
- [SMTP Settings](#smtp-settings)
- [Allowed Origins](#allowed-origins)
- [Administration](#administration)
- [Rate Limiting](#rate-limiting)
- [CORS](#cors)
- [HTTP Status Codes](#http-status-codes)
- [Data Models](#data-models)
- [Examples](#examples)
- [Implementation Reference](#implementation-reference)
- [Notes](#notes)
- [License](#license)

## Base URL

The API is served from the same host as the SiSH Form Mailer installation.

```text
https://form-mailer.example.com/api
```

For example:

```text
https://form-mailer.example.com/api/forms
```

## Authentication

The management API uses cookie-based authentication.

After a successful login, the server sets an HTTP-only authentication cookie:

```http
Set-Cookie: sish-form-mailer-auth=<token>; Path=/; HttpOnly; SameSite=Lax
```

The browser will automatically send this cookie with subsequent requests.

There is no requirement to send a Bearer token in the `Authorization` header.

### Authentication Roles

| Role          | Description                 |
| ------------- | --------------------------- |
| `user`        | Standard authenticated user |
| `admin`       | Administrator               |
| `super_admin` | Super administrator         |

Admin endpoints require an authenticated user with appropriate administrative privileges.

### Token Lifetime

| `remember` | Lifetime |
| ---------- | -------- |
| `false`    | 24 hours |
| `true`     | 30 days  |

### Authentication Errors

Unauthenticated requests to protected endpoints return:

```text
401 Unauthorized
```

## API Overview

| Method   | Endpoint                                         | Auth   | Description                    |
| -------- | ------------------------------------------------ | ------ | ------------------------------ |
| `POST`   | `/api/auth/login`                                | Public | Authenticate a user            |
| `GET`    | `/api/auth/logout`                               | User   | Log out                        |
| `GET`    | `/api/auth/forgot-password`                      | Public | Reset the super-admin password |
| `GET`    | `/api/user`                                      | User   | Get the current user           |
| `PUT`    | `/api/user`                                      | User   | Update the current user        |
| `GET`    | `/api/forms`                                     | User   | List forms                     |
| `POST`   | `/api/forms`                                     | User   | Create a form                  |
| `GET`    | `/api/forms/{form_id}`                           | User   | Get a form                     |
| `PUT`    | `/api/forms/{form_id}`                           | User   | Update a form                  |
| `DELETE` | `/api/forms/{form_id}`                           | User   | Delete a form                  |
| `POST`   | `/api/forms/{form_id}`                           | Public | Submit a form                  |
| `GET`    | `/api/forms/{form_id}/responses`                 | User   | List submissions               |
| `GET`    | `/api/forms/{form_id}/responses/{submission_id}` | User   | Get a submission               |
| `DELETE` | `/api/forms/{form_id}/responses/{submission_id}` | User   | Delete a submission            |
| `GET`    | `/api/email-settings`                            | User   | Get SMTP settings              |
| `POST`   | `/api/email-settings`                            | User   | Create SMTP settings           |
| `PUT`    | `/api/email-settings`                            | User   | Update SMTP settings           |
| `DELETE` | `/api/email-settings`                            | User   | Delete SMTP settings           |
| `GET`    | `/api/email-settings/test`                       | User   | Send a test email              |
| `GET`    | `/api/origins`                                   | User   | List allowed origins           |
| `POST`   | `/api/origins`                                   | User   | Add an allowed origin          |
| `DELETE` | `/api/origins/{origin_id}`                       | User   | Remove an allowed origin       |
| `GET`    | `/api/admin/getUsers`                            | Admin  | List users                     |
| `POST`   | `/api/admin/createUser`                          | Admin  | Create a user                  |
| `PUT`    | `/api/admin/editUser/{id}`                       | Admin  | Update a user                  |
| `DELETE` | `/api/admin/deleteUser/{id}`                     | Admin  | Delete a user                  |

## Authentication Endpoints

### POST `/api/auth/login`

Authenticates a user and creates an authentication token.

#### Request

```json
{
  "email": "user@example.com",
  "password": "your-password",
  "remember": true
}
```

#### Request Parameters

| Field      | Type    | Required | Description                                         |
| ---------- | ------- | -------- | --------------------------------------------------- |
| `email`    | string  | Yes      | User email address                                  |
| `password` | string  | Yes      | User password                                       |
| `remember` | boolean | No       | Extend the authentication token lifetime to 30 days |

#### Response

**201 Created**

```json
{
  "auth_token": {
    "token": "..."
  }
}
```

The server also sets the `sish-form-mailer-auth` cookie.

#### Errors

**400 Bad Request**

```json
{
  "error": "invalid request payload"
}
```

**401 Unauthorized**

Returned for invalid credentials or a login lockout.

### GET `/api/auth/logout`

Logs out the current user and revokes their authentication tokens.

#### Authentication

Required.

#### Response

**204 No Content**

No response body.

### GET `/api/auth/forgot-password`

Resets the super-admin password using the configured `ADMIN_PASS`.

#### Query Parameters

| Parameter    | Type   | Required | Description                       |
| ------------ | ------ | -------- | --------------------------------- |
| `admin_pass` | string | Yes      | The configured `ADMIN_PASS` value |

#### Example

```http
GET /api/auth/forgot-password?admin_pass=your-admin-password
```

#### Security warning

This endpoint accepts the admin password through the URL query string. Query strings may be recorded in browser history, reverse-proxy logs, access logs, and monitoring systems. Use this endpoint with care.

## User Endpoints

### GET `/api/user`

Returns the currently authenticated user.

#### Authentication

Required.

#### Response

**200 OK**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "created_at": "2026-08-30T12:00:00Z",
    "num_forms": 3
  }
}
```

Passwords and password hashes are never returned.

### PUT `/api/user`

Updates the currently authenticated user's account.

#### Request

```json
{
  "email": "new@example.com",
  "password": "new-password"
}
```

#### Request Parameters

| Field      | Type   | Required | Description       |
| ---------- | ------ | -------- | ----------------- |
| `email`    | string | No       | New email address |
| `password` | string | No       | New password      |

Both fields are optional.

#### Response

**200 OK**

```json
{
  "user": 1
}
```

## Form Endpoints

Forms are identified by a unique string ID.

### Form Object

```json
{
  "id": "a7K92x",
  "user_id": 1,
  "name": "Contact Form",
  "target_email": "contact@example.com",
  "created_at": "2026-08-30T12:00:00Z"
}
```

### GET `/api/forms`

Returns all forms belonging to the authenticated user.

#### Authentication

Required.

#### Response

**200 OK**

```json
{
  "forms": [
    {
      "id": "a7K92x",
      "user_id": 1,
      "name": "Contact Form",
      "target_email": "contact@example.com",
      "created_at": "2026-08-30T12:00:00Z"
    }
  ]
}
```

### POST `/api/forms`

Creates a new form.

#### Authentication

Required.

#### Request

```json
{
  "name": "Contact Form",
  "target_email": "contact@example.com"
}
```

#### Request Parameters

| Field          | Type   | Required | Description                             |
| -------------- | ------ | -------- | --------------------------------------- |
| `name`         | string | Yes      | Human-readable form name                |
| `target_email` | string | Yes      | Email address that receives submissions |

The authenticated user's ID is assigned automatically.

#### Response

**201 Created**

```json
{
  "form": {
    "id": "a7K92x",
    "user_id": 1,
    "name": "Contact Form",
    "target_email": "contact@example.com",
    "created_at": "2026-08-30T12:00:00Z"
  }
}
```

#### Errors

**400 Bad Request**

Returned when required fields are missing or invalid.

### GET `/api/forms/{form_id}`

Returns a specific form.

#### Authentication

Required.

#### Path Parameters

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `form_id` | string | Unique form ID |

#### Response

**200 OK**

```json
{
  "form": {
    "id": "a7K92x",
    "user_id": 1,
    "name": "Contact Form",
    "target_email": "contact@example.com",
    "created_at": "2026-08-30T12:00:00Z"
  }
}
```

Users can only access forms belonging to their account.

### PUT `/api/forms/{form_id}`

Updates a form.

#### Authentication

Required.

#### Path Parameters

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `form_id` | string | Unique form ID |

#### Request

```json
{
  "name": "Website Contact Form",
  "target_email": "hello@example.com"
}
```

#### Request Parameters

| Field          | Type   | Required | Description           |
| -------------- | ------ | -------- | --------------------- |
| `name`         | string | No       | New form name         |
| `target_email` | string | No       | New destination email |

#### Response

**200 OK**

```json
{
  "form": "a7K92x"
}
```

### DELETE `/api/forms/{form_id}`

Deletes a form.

#### Authentication

Required.

#### Path Parameters

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `form_id` | string | Unique form ID |

#### Response

**204 No Content**

No response body.

#### Errors

**404 Not Found**

`form not found`

## Form Submissions

The public submission endpoint is the primary endpoint used by external websites.

Unlike the management API, it does not require authentication.

### POST `/api/forms/{form_id}`

Submits data to a form.

#### Authentication

Not required.

#### Path Parameters

| Parameter | Type   | Description    |
| --------- | ------ | -------------- |
| `form_id` | string | Unique form ID |

#### Request

```json
{
  "payload": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "message": "Hello!"
  }
}
```

The payload can contain arbitrary JSON.

#### Request Parameters

| Field     | Type   | Required    | Description                               |
| --------- | ------ | ----------- | ----------------------------------------- |
| `payload` | object | Yes         | Form submission data                      |
| `token`   | string | Conditional | reCAPTCHA token when reCAPTCHA is enabled |

#### With reCAPTCHA

```json
{
  "payload": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "message": "Hello!"
  },
  "token": "RECAPTCHA_TOKEN"
}
```

#### Response

**201 Created**

```json
{
  "status": "success"
}
```

The submission is stored and subsequently processed for email delivery.

#### Invalid Request

**400 Bad Request**

```json
{
  "error": "invalid submission payload"
}
```

### reCAPTCHA

reCAPTCHA is enabled by default.

It can be disabled using the `DISABLE_RECAPTCHA` environment variable.

When enabled, submissions must contain a valid reCAPTCHA token and achieve the required risk score.

Failed reCAPTCHA validation causes the submission to be recorded as spam rather than being treated as a successful submission.

### GET `/api/forms/{form_id}/responses`

Returns submissions for a form.

#### Authentication

Required.

The authenticated user must own the form.

#### Response

**200 OK**

```json
{
  "submissions": [
    {
      "id": 123,
      "form_id": "a7K92x",
      "payload": "{\"name\":\"Jane Smith\",\"message\":\"Hello!\"}",
      "submitted_at": "2026-08-30T12:00:00Z",
      "status": "received",
      "error_reason": ""
    }
  ]
}
```

### GET `/api/forms/{form_id}/responses/{submission_id}`

Returns a single submission.

#### Authentication

Required.

#### Path Parameters

| Parameter       | Type    | Description    |
| --------------- | ------- | -------------- |
| `form_id`       | string  | Unique form ID |
| `submission_id` | integer | Submission ID  |

#### Response

**200 OK**

```json
{
  "submission": {
    "id": 123,
    "form_id": "a7K92x",
    "payload": "{\"name\":\"Jane Smith\"}",
    "submitted_at": "2026-08-30T12:00:00Z",
    "status": "received",
    "error_reason": ""
  }
}
```

### DELETE `/api/forms/{form_id}/responses/{submission_id}`

Deletes a submission.

#### Authentication

Required.

#### Response

**204 No Content**

No response body.

#### Errors

**404 Not Found**

`submission not found`

## SMTP Settings

Each user can configure an SMTP server for sending form submissions.

SMTP passwords are encrypted before being stored and are not returned by the API.

### SMTP Object

```json
{
  "id": 1,
  "user_id": 1,
  "host": "smtp.example.com",
  "port": 587,
  "username": "mailer@example.com",
  "encryption_type": "starttls",
  "updated_at": "2026-08-30T12:00:00Z",
  "recipient_email": "contact@example.com",
  "sender_email": "mailer@example.com"
}
```

### GET `/api/email-settings`

Returns the current user's SMTP configuration.

#### Response

**200 OK**

```json
{
  "smtp": {
    "id": 1,
    "user_id": 1,
    "host": "smtp.example.com",
    "port": 587,
    "username": "mailer@example.com",
    "encryption_type": "starttls",
    "updated_at": "2026-08-30T12:00:00Z",
    "recipient_email": "contact@example.com",
    "sender_email": "mailer@example.com"
  }
}
```

If no SMTP configuration exists, `smtp` may be `null`.

### POST `/api/email-settings`

Creates SMTP settings.

#### Request

```json
{
  "host": "smtp.example.com",
  "port": 587,
  "username": "mailer@example.com",
  "password": "smtp-password",
  "encryption_type": "starttls",
  "recipient_email": "contact@example.com",
  "sender_email": "mailer@example.com"
}
```

#### Request Parameters

| Field             | Type    | Required | Description          |
| ----------------- | ------- | -------- | -------------------- |
| `host`            | string  | Yes      | SMTP server hostname |
| `port`            | integer | Yes      | SMTP server port     |
| `username`        | string  | Yes      | SMTP username        |
| `password`        | string  | Yes      | SMTP password        |
| `encryption_type` | string  | No       | SMTP encryption type |
| `recipient_email` | string  | Yes      | Submission recipient |
| `sender_email`    | string  | Yes      | Submission sender    |

#### Response

**201 Created**

```json
{
  "smtp": {
    "id": 1,
    "user_id": 1,
    "host": "smtp.example.com",
    "port": 587,
    "username": "mailer@example.com",
    "encryption_type": "starttls",
    "updated_at": "2026-08-30T12:00:00Z",
    "recipient_email": "contact@example.com",
    "sender_email": "mailer@example.com"
  }
}
```

The password is never included in the response.

### PUT `/api/email-settings`

Updates existing SMTP settings.

#### Request

```json
{
  "host": "smtp.example.net",
  "port": 465,
  "username": "mailer@example.net",
  "password": "new-password",
  "encryption_type": "ssl",
  "recipient_email": "contact@example.net",
  "sender_email": "mailer@example.net"
}
```

All fields are optional.

#### Response

**200 OK**

```json
{
  "smtp": 1
}
```

### DELETE `/api/email-settings`

Deletes the current user's SMTP configuration.

#### Response

**204 No Content**

No response body.

### GET `/api/email-settings/test`

Sends a test email using the configured SMTP settings.

#### Response

**200 OK**

```json
{
  "test": "success"
}
```

The test email contains:

> This is a test email for sish-form-mailer!

## Allowed Origins

Allowed origins control which websites can make browser-based requests to the API.

### Origin Object

```json
{
  "id": 1,
  "user_id": 1,
  "origin": "https://www.example.com",
  "created_at": "2026-08-30T12:00:00Z"
}
```

### GET `/api/origins`

Lists the authenticated user's allowed origins.

#### Response

**200 OK**

```json
{
  "origins": [
    {
      "id": 1,
      "user_id": 1,
      "origin": "https://www.example.com",
      "created_at": "2026-08-30T12:00:00Z"
    }
  ]
}
```

### POST `/api/origins`

Adds an allowed origin.

#### Request

```json
{
  "origin": "https://www.example.com"
}
```

#### Response

**201 Created**

```json
{
  "origin": {
    "id": 1,
    "user_id": 1,
    "origin": "https://www.example.com",
    "created_at": "2026-08-30T12:00:00Z"
  }
}
```

### DELETE `/api/origins/{origin_id}`

Removes an allowed origin.

#### Path Parameters

| Parameter   | Type    | Description |
| ----------- | ------- | ----------- |
| `origin_id` | integer | Origin ID   |

#### Response

**204 No Content**

#### Errors

**404 Not Found**

`origin not found`

## Administration

Administrative endpoints require an authenticated administrator.

### GET `/api/admin/getUsers`

Returns all users.

#### Response

**200 OK**

```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "user",
      "created_at": "2026-08-30T12:00:00Z",
      "num_forms": 2
    }
  ]
}
```

### POST `/api/admin/createUser`

Creates a user.

#### Request

```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "role": "user"
}
```

#### Request Parameters

| Field      | Type   | Required | Description   |
| ---------- | ------ | -------- | ------------- |
| `email`    | string | Yes      | User email    |
| `password` | string | Yes      | User password |
| `role`     | string | Yes      | User role     |

#### Valid Roles

- `user`
- `admin`
- `super_admin`

#### Response

**201 Created**

```json
{
  "user": {
    "id": 2,
    "email": "user@example.com",
    "role": "user",
    "created_at": "2026-08-30T12:00:00Z"
  }
}
```

Passwords are hashed and are never returned.

### PUT `/api/admin/editUser/{id}`

Updates an existing user.

#### Path Parameters

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | User ID     |

#### Request

```json
{
  "email": "updated@example.com",
  "role": "admin",
  "password": "new-password"
}
```

All fields are optional.

#### Response

**200 OK**

```json
{
  "user": 2
}
```

#### Permissions

Administrators have restrictions on which accounts they can modify.

In particular, regular administrators cannot modify super-admin accounts.

### DELETE `/api/admin/deleteUser/{id}`

Deletes a user.

#### Path Parameters

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| `id`      | integer | User ID     |

#### Response

**204 No Content**

No response body.

Administrative role restrictions apply.

## Rate Limiting

The API uses IP-based rate limiting.

There are separate rate-limiting paths for:

- General authenticated API requests
- Public form submissions

The client IP is determined using:

- `X-Forwarded-For`
- `X-Real-IP`
- `RemoteAddr`

### Rate Limit Headers

Responses include:

```http
X-RateLimit-Limit: <limit>
X-RateLimit-Remaining: <remaining>
```

When the limit is exceeded:

```text
429 Too Many Requests

Too Many Requests
```

A `Retry-After` header may also be returned.

If the application is deployed behind a reverse proxy, make sure proxy headers are configured correctly. Rate limiting relies on the resolved client IP.

## CORS

The API uses CORS middleware.

The following methods are supported:

- `GET`
- `POST`
- `PUT`
- `DELETE`
- `OPTIONS`

Allowed request headers include:

- `Accept`
- `Authorization`
- `Content-Type`

Origins are permitted when they are configured for the user or match the configured `INITIAL_ORIGIN`.

CORS preflight responses are cached for approximately five minutes.

## HTTP Status Codes

| Status | Meaning                                              |
| ------ | ---------------------------------------------------- |
| `200`  | Request completed successfully                       |
| `201`  | Resource created successfully                        |
| `204`  | Request completed successfully with no response body |
| `400`  | Invalid request or validation error                  |
| `401`  | Authentication or authorization failure              |
| `404`  | Resource not found                                   |
| `429`  | Rate limit exceeded                                  |
| `500`  | Internal server error                                |

> **Note:** Error responses are not completely uniform. Most handlers return JSON errors, while some errors are returned as plain text using `http.Error`. Clients should not assume every non-2xx response contains JSON.

## Data Models

### User

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "user",
  "created_at": "2026-08-30T12:00:00Z",
  "num_forms": 2
}
```

| Field        | Type    | Description                       |
| ------------ | ------- | --------------------------------- |
| `id`         | integer | User ID                           |
| `email`      | string  | Email address                     |
| `role`       | string  | User role                         |
| `created_at` | string  | Account creation timestamp        |
| `num_forms`  | integer | Number of forms owned by the user |

### Form

```json
{
  "id": "a7K92x",
  "user_id": 1,
  "name": "Contact Form",
  "target_email": "contact@example.com",
  "created_at": "2026-08-30T12:00:00Z"
}
```

| Field          | Type    | Description            |
| -------------- | ------- | ---------------------- |
| `id`           | string  | Unique form ID         |
| `user_id`      | integer | Owning user            |
| `name`         | string  | Form name              |
| `target_email` | string  | Submission destination |
| `created_at`   | string  | Creation timestamp     |

### Submission

```json
{
  "id": 123,
  "form_id": "a7K92x",
  "payload": "{\"name\":\"Jane Smith\"}",
  "submitted_at": "2026-08-30T12:00:00Z",
  "status": "received",
  "error_reason": ""
}
```

| Field          | Type    | Description                      |
| -------------- | ------- | -------------------------------- |
| `id`           | integer | Submission ID                    |
| `form_id`      | string  | Associated form                  |
| `payload`      | string  | Submitted JSON data              |
| `submitted_at` | string  | Submission timestamp             |
| `status`       | string  | Processing status                |
| `error_reason` | string  | Error information, if applicable |

Common statuses include:

- `received`
- `spam`
- `error`

### SMTP Settings

```json
{
  "id": 1,
  "user_id": 1,
  "host": "smtp.example.com",
  "port": 587,
  "username": "mailer@example.com",
  "encryption_type": "starttls",
  "updated_at": "2026-08-30T12:00:00Z",
  "recipient_email": "contact@example.com",
  "sender_email": "mailer@example.com"
}
```

The SMTP password is intentionally excluded.

### Origin

```json
{
  "id": 1,
  "user_id": 1,
  "origin": "https://www.example.com",
  "created_at": "2026-08-30T12:00:00Z"
}
```

## Examples

### Login with cURL

Store the authentication cookie in `cookies.txt`:

```bash
curl -i \
  -c cookies.txt \
  -X POST \
  https://form-mailer.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password",
    "remember": true
  }'
```

### Get Forms

```bash
curl \
  -b cookies.txt \
  https://form-mailer.example.com/api/forms
```

### Create a Form

```bash
curl \
  -b cookies.txt \
  -X POST \
  https://form-mailer.example.com/api/forms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Contact Form",
    "target_email": "contact@example.com"
  }'
```

### Submit a Form

The public form endpoint does not require authentication:

```bash
curl \
  -X POST \
  https://form-mailer.example.com/api/forms/a7K92x \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "message": "Hello!"
    }
  }'
```

### Submit a Form with reCAPTCHA

```bash
curl \
  -X POST \
  https://form-mailer.example.com/api/forms/a7K92x \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "message": "Hello!"
    },
    "token": "RECAPTCHA_TOKEN"
  }'
```

### List Submissions

```bash
curl \
  -b cookies.txt \
  https://form-mailer.example.com/api/forms/a7K92x/responses
```

### Delete a Submission

```bash
curl \
  -b cookies.txt \
  -X DELETE \
  https://form-mailer.example.com/api/forms/a7K92x/responses/123
```

## Implementation Reference

The API is currently implemented in the following areas of the repository:

```text
internal/
├── api/
│   ├── form_handler.go
│   ├── origin_handler.go
│   ├── smtp_handler.go
│   ├── submissions_handler.go
│   ├── token_handler.go
│   └── user_handler.go
│
├── middleware/
│   └── tokenbucket.go
│
├── routes/
│   └── routes.go
│
└── store/
    ├── forms_store.go
    ├── origin_store.go
    ├── smtp_store.go
    ├── submissions_store.go
    └── users_store.go
```

The route definitions in `internal/routes/routes.go` are the authoritative source for which endpoints are currently exposed.

The handler implementations in `internal/api` are the authoritative source for request/response behavior and validation.

## Notes

- Authentication uses an HTTP-only cookie rather than a Bearer token.
- Form submission is intentionally unauthenticated.
- Form submission payloads are arbitrary JSON.
- reCAPTCHA is enabled unless explicitly disabled.
- SMTP passwords are encrypted at rest and never returned through the API.
- Users can only access their own forms and submissions.
- CORS is tied to configured origins.
- Public submissions and authenticated API requests are rate limited.
- Error response formats are not completely consistent between handlers.

## License

See the repository's `LICENSE` file for licensing information.
