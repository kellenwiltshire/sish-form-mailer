# SiSH Form Mailer

**Simple Self Hosted Form Mailer**

A lightweight, fast, self-hosted alternative to services like [Formspree](https://formspree.io/).

SiSH Form Mailer lets you create forms through a simple web interface and use them from any website. Each form is automatically assigned a unique six-character alphanumeric code, giving you a simple API endpoint that external websites can post submissions to.

Host it yourself, create multiple users and forms, configure SMTP independently for each user, and route each form's submissions to the email address you choose.

---

## ✨ Features

- 🏠 **Self hosted** — Run your own form processing infrastructure.
- ⚡ **Fast submissions** — Form submissions are persisted to the database before the request completes.
- 📬 **Asynchronous email delivery** — Email is delivered after the submission has been saved.
- 👥 **Multiple users** — A single installation can support multiple users.
- 📝 **Multiple forms** — Each user can create and manage multiple forms.
- 🔑 **Automatic form codes** — Every form receives a unique six-character alphanumeric code.
- 🌐 **Simple API endpoint** — Websites submit to `/api/forms/<code>`.
- 🔒 **CORS protection** — Restrict which websites are allowed to submit to a form.
- 📧 **Per-user SMTP settings** — Each user can configure their own SMTP server and credentials.
- 🎯 **Per-form destination email** — Each form can send submissions to its own target email address.
- 🛡️ **Spam protection** — Includes rate limiting and optional reCAPTCHA support.
- 🐳 **Docker support** — Designed for straightforward self-hosted deployment.
- 🐘 **PostgreSQL** — Persistent storage for users, forms, and submissions.
- 🚀 **Lightweight** — Built with Go with a focus on speed and simplicity.

---

# Why SiSH Form Mailer?

Services such as Formspree make it easy to add forms to websites without building a backend.

SiSH Form Mailer takes the same basic idea but lets you **run the infrastructure yourself**.

Instead of:

```text
Your Website
     │
     ▼
Third-Party Form Service
     │
     ▼
Email
```

you run:

```text
Your Website
     │
     ▼
SiSH Form Mailer
     │
     ├── PostgreSQL
     │
     └── Your SMTP
```

This gives you control over your form endpoints, submissions, database, email configuration, and hosting environment.

SiSH Form Mailer is designed to provide the small amount of infrastructure that most websites actually need:

> **Receive a form submission, save it reliably, and get it to the right inbox.**

---

# How It Works

A typical installation might be hosted at:

```text
https://form-mailer.example.com
```

A user creates a form through the SiSH Form Mailer UI.

For example:

```text
Form name: Contact Form
Form code: a7K92x
```

SiSH Form Mailer automatically generates the public endpoint:

```text
https://form-mailer.example.com/api/forms/a7K92x
```

The user does **not** create custom API routes.

The generated form code becomes the identifier for the form.

An external website can then POST its form data to that endpoint.

```text
┌───────────────────────┐
│      Your Website     │
│                       │
│      HTML Form        │
└───────────┬───────────┘
            │
            │ POST
            ▼
┌─────────────────────────────┐
│     SiSH Form Mailer        │
│                             │
│ /api/forms/a7K92x           │
│                             │
│  • CORS validation          │
│  • Request validation       │
│  • Rate limiting            │
│  • Spam protection          │
└─────────────┬───────────────┘
              │
              │ Save immediately
              ▼
┌─────────────────────────────┐
│         PostgreSQL          │
│                             │
│       Submission            │
│          saved              │
└─────────────┬───────────────┘
              │
              │ Database listener
              ▼
┌─────────────────────────────┐
│     Background Listener     │
│                             │
│      Process pending        │
│       submissions           │
└─────────────┬───────────────┘
              │
              │ Send using
              │ user's SMTP
              ▼
┌─────────────────────────────┐
│       Destination Email     │
│                             │
│    configured per form      │
└─────────────────────────────┘
```

The important part is that **email delivery is not on the critical path of the form submission**.

---

# Fast by Design

Speed is one of the primary design goals of SiSH Form Mailer.

A traditional implementation might make the visitor's request wait for an email provider:

```text
Browser
   │
   ▼
Application
   │
   ▼
SMTP Server
   │
   ▼
Email Provider
   │
   ▼
Response
   │
   ▼
Browser
```

If the SMTP server is slow, the form is slow.

If the email provider is temporarily unavailable, the form may fail.

SiSH Form Mailer separates **accepting a submission** from **delivering the email**.

```text
Browser
   │
   ▼
SiSH Form Mailer
   │
   ▼
Save Submission
   │
   ▼
PostgreSQL
   │
   ▼
HTTP Response
```

Email delivery happens afterward:

```text
PostgreSQL
   │
   ▼
Database Listener
   │
   ▼
Pending Submission
   │
   ▼
User's SMTP Server
   │
   ▼
Destination Email
```

Once the submission has been safely persisted, the HTTP request can complete without waiting for the email to be delivered.

### The result

To the person submitting the form, the experience is fast:

```text
Submit
  ↓
Saved
  ↓
Done
```

The email can then be processed independently.

This also means temporary SMTP problems do not need to prevent the initial form submission from being accepted.

---

# Users

SiSH Form Mailer supports multiple users on a single installation.

Each user can manage their own forms and configure their own SMTP settings.

This makes it possible to run one central SiSH Form Mailer instance for multiple people, websites, or organizations.

For example:

```text
                    SiSH Form Mailer
                           │
             ┌─────────────┼─────────────┐
             │             │             │
          User A         User B        User C
             │             │             │
          Forms          Forms         Forms
             │             │             │
          SMTP A         SMTP B        SMTP C
```

Each user's SMTP configuration is used when sending that user's form submissions.

This means a shared installation does not necessarily need to use one global SMTP account for everyone.

---

# SMTP Configuration

Each user can configure their own SMTP settings.

For example:

```text
User A
SMTP Host: smtp.example-a.com
SMTP User: forms@example-a.com
SMTP Password: ********

User B
SMTP Host: smtp.example-b.com
SMTP User: forms@example-b.com
SMTP Password: ********
```

When a form submission is processed, SiSH Form Mailer uses the SMTP configuration associated with the form's user.

This makes the application particularly useful for:

- Agencies
- Managed hosting
- Multiple websites
- Small businesses
- Organizations with separate email infrastructure

Each user can keep their outbound mail configuration separate from other users.

---

# Forms

Users can create multiple forms through the SiSH Form Mailer UI.

Every form receives a unique six-character alphanumeric code.

For example:

```text
Contact Form
    Code: a7K92x

Quote Request
    Code: B92mLp

Support Request
    Code: x7Q4nK

Job Application
    Code: P82kLm
```

These become:

```text
/api/forms/a7K92x
/api/forms/B92mLp
/api/forms/x7Q4nK
/api/forms/P82kLm
```

The form code is generated automatically.

Users do not need to configure routes, web servers, or custom API endpoints.

---

# Per-Form Email Destinations

Each form can have its own target email address.

For example:

```text
Contact Form
    → contact@example.com

Sales Enquiry
    → sales@example.com

Support Request
    → support@example.com

Careers
    → careers@example.com
```

This allows a single user to have several forms that route submissions to different inboxes.

Combined with per-user SMTP settings, the routing model looks like:

```text
                         SiSH Form Mailer
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
              User A                        User B
                 │                             │
             SMTP A                         SMTP B
                 │                             │
        ┌────────┼────────┐             ┌──────┴──────┐
        │        │        │             │             │
      Form 1   Form 2   Form 3        Form 4       Form 5
        │        │        │             │             │
     sales@   support@ careers@      contact@      orders@
```

This keeps users, SMTP configuration, forms, and destination addresses logically separated.

---

# Using a Form

Once a form has been created, an external website can submit form data directly to its endpoint.

For example:

```html
<form action="https://form-mailer.example.com/api/forms/a7K92x" method="POST">
  <label>
    Name
    <input type="text" name="name" required />
  </label>

  <label>
    Email
    <input type="email" name="email" required />
  </label>

  <label>
    Message
    <textarea name="message" required></textarea>
  </label>

  <button type="submit">Send Message</button>
</form>
```

The website hosting the form can be completely separate from the server running SiSH Form Mailer.

For example:

```text
www.example.com
       │
       │ POST
       ▼
form-mailer.example.com
       │
       ▼
SiSH Form Mailer
       │
       ▼
Destination Email
```

No custom backend is required on the website.

---

# CORS Protection

Because form endpoints are intended to be used by external websites, SiSH Form Mailer supports CORS protection.

A form can control which origins are permitted to submit to its endpoint.

For example, a form could allow:

```text
https://www.example.com
```

while rejecting requests from unauthorized origins.

The endpoint remains:

```text
https://form-mailer.example.com/api/forms/a7K92x
```

CORS provides an important layer of protection for browser-based submissions.

It should be considered alongside rate limiting, spam protection, and other application-level controls.

---

# Multiple Websites

One SiSH Form Mailer installation can support forms for many different websites.

For example:

```text
                  form-mailer.example.com
                           │
              ┌────────────┼────────────┐
              │            │            │
           Website A    Website B    Website C
              │            │            │
          Form A        Form B        Form C
          a7K92x        B92mLp        x7Q4nK
              │            │            │
              └────────────┼────────────┘
                           │
                    SiSH Form Mailer
                           │
                    PostgreSQL
                           │
                    Email Delivery
```

This makes SiSH Form Mailer useful for agencies or anyone managing multiple sites.

---

# Why Self Host?

Hosted form services are convenient, but they introduce another service into your infrastructure.

With SiSH Form Mailer, you control:

- The application
- The database
- The form endpoints
- User accounts
- SMTP configuration
- Destination addresses
- Hosting environment
- Form submissions

You can deploy it on your own VPS, server, homelab, or infrastructure.

The only external service required for email delivery is whatever SMTP provider you choose to configure.

---

# Installation

## Docker Compose

The easiest way to run SiSH Form Mailer is with Docker.

The repository includes Docker and Docker Compose configuration for running the application alongside PostgreSQL.

### 1. Clone the repository

```bash
git clone https://github.com/kellenwiltshire/sish-form-mailer.git
cd sish-form-mailer
```

### 2. Create the environment file

```bash
cp .env.example .env
```

Edit `.env` and configure the application for your environment.

At a minimum, change the default credentials and secret key before exposing the application to the internet.

### 3. Start the application

```bash
docker compose up -d
```

The application can then be placed behind a reverse proxy and exposed at a domain such as:

```text
https://form-mailer.example.com
```

---

# Configuration

Configuration is provided through environment variables.

See `.env.example` for the complete configuration available for the current version.

Common configuration includes:

| Variable               | Purpose                           |
| ---------------------- | --------------------------------- |
| `PORT`                 | HTTP port used by the application |
| `TZ`                   | Application/container timezone    |
| `PUID`                 | Container user ID                 |
| `PGID`                 | Container group ID                |
| `DB_HOST`              | PostgreSQL hostname               |
| `DB_PORT`              | PostgreSQL port                   |
| `DB_USERNAME`          | PostgreSQL username               |
| `DB_PASSWORD`          | PostgreSQL password               |
| `DB_DATABASE_NAME`     | PostgreSQL database name          |
| `SECRET_KEY`           | Application secret                |
| `ADMIN_PASS`           | Initial administrator password    |
| `INITIAL_ORIGIN`       | Initial application origin        |
| `RECAPTCHA_PROJECT_ID` | reCAPTCHA Enterprise project      |
| `RECAPTCHA_SITE_KEY`   | reCAPTCHA site key                |
| `RECAPTCHA_API_KEY`    | reCAPTCHA API key                 |
| `DISABLE_RECAPTCHA`    | Disable reCAPTCHA                 |

> **Never use default credentials or example secrets in a production deployment.**

SMTP credentials are configured by users through the application rather than being a single global SMTP configuration.

---

# Production Deployment

A typical production deployment looks like:

```text
                         Internet
                            │
                            │ HTTPS
                            ▼
                    ┌───────────────┐
                    │ Reverse Proxy │
                    │               │
                    │ form-mailer.  │
                    │ example.com   │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ SiSH Form     │
                    │ Mailer        │
                    └───────┬───────┘
                            │
                     ┌──────┴──────┐
                     │             │
                     ▼             ▼
                PostgreSQL    User SMTP
                     │             │
                     │             ▼
                     │        Destination
                     │          Email
                     │
                     ▼
              Pending Submissions
                     │
                     ▼
              Database Listener
```

The public application and form API share the same host:

```text
https://form-mailer.example.com
```

Forms are available at:

```text
https://form-mailer.example.com/api/forms/<code>
```

For production deployments, HTTPS should always be used.

---

# Security

SiSH Form Mailer is designed for publicly accessible form endpoints.

The application includes protections intended to reduce abuse, including rate limiting and optional reCAPTCHA support.

CORS restrictions can be configured to control which websites are permitted to use a form.

For production deployments:

- Use HTTPS.
- Change all default credentials.
- Generate a unique `SECRET_KEY`.
- Use a strong PostgreSQL password.
- Do not expose PostgreSQL directly to the internet.
- Configure appropriate CORS origins.
- Consider enabling reCAPTCHA.
- Keep the application and dependencies up to date.
- Back up the PostgreSQL database.
- Protect SMTP credentials.
- Monitor application and email-delivery logs.

---

# Database-Backed Email Delivery

One of the core architectural decisions in SiSH Form Mailer is using the database as the durable handoff between the HTTP request and email delivery.

When a submission arrives:

1. The form endpoint validates the request.
2. The submission is written to PostgreSQL.
3. The request can return to the browser.
4. A database listener detects the pending submission.
5. The submission is processed asynchronously.
6. Email is sent using the user's SMTP configuration.
7. The email is delivered to the form's configured destination address.

This approach means the web request does not need to wait for SMTP.

It also provides a durable record of the submission before email delivery begins.

Conceptually:

```text
                HTTP Request
                     │
                     ▼
               Validate Form
                     │
                     ▼
             Save Submission
                     │
                     ▼
                HTTP 200
                     │
                     │
              Request complete
                     │
                     ▼
             Database Listener
                     │
                     ▼
              Send Email
                     │
                     ▼
            Destination Inbox
```

---

# Technology

SiSH Form Mailer is built around a deliberately small stack.

### Backend

- Go
- Chi HTTP router
- PostgreSQL
- Goose database migrations

### Frontend

- React
- Bun

### Deployment

- Docker
- Docker Compose
- PostgreSQL

The production Docker image uses a multi-stage build to compile the application and frontend before packaging them into a lightweight runtime image.

---

# Project Structure

```text
.
├── client/              # Frontend application
├── internal/             # Go backend packages
├── journey/              # Integration / journey tests
├── migrations/           # Database migrations
│
├── main.go               # Application entry point
├── Dockerfile            # Production image
├── Dockerfile.dev        # Backend development image
├── DockerfileWeb.dev     # Frontend development image
├── compose.yml           # Docker Compose configuration
├── entrypoint.sh         # Container entrypoint
├── .env.example          # Configuration example
├── go.mod
├── go.sum
└── LICENSE
```

---

# Development

## Requirements

Local development requires:

- Go
- Bun
- PostgreSQL
- Docker / Docker Compose

The repository includes development Dockerfiles and a Compose configuration to simplify running the application locally.

```bash
docker compose up
```

The development environment provides the backend and frontend separately, making it possible to work on both sides of the application independently.

---

# Design Principles

SiSH Form Mailer is built around a few simple principles.

## Keep it simple

A website should only need a form and an endpoint:

```text
<form>
    ↓
POST /api/forms/<code>
```

Users don't need to configure API routes or write backend code.

## Be fast

Accept the submission as soon as it has been safely persisted.

Don't make the visitor wait for email delivery.

## Be self-hosted

The operator should own the application and the data.

## Be multi-user

One installation should be capable of serving multiple users without requiring a separate deployment for each one.

## Be multi-form

Each user can create as many forms as their installation allows, with each form receiving its own generated code and destination email.

## Keep mail configuration flexible

SMTP configuration belongs to the user, while the destination address belongs to the form.

This provides a simple separation:

```text
User
 └── SMTP Configuration

Form
 ├── Generated Code
 ├── CORS Configuration
 └── Destination Email
```

## Don't overcomplicate the API

Users don't create custom API routes.

SiSH Form Mailer generates the form identifier automatically:

```text
/api/forms/<six-character-code>
```

---

# Example

Suppose you run:

```text
https://form-mailer.example.com
```

You create a form called **Website Contact Form**.

SiSH Form Mailer generates:

```text
Form Code:
a7K92x
```

You configure:

```text
Destination:
contact@example.com
```

Your website then contains:

```html
<form action="https://form-mailer.example.com/api/forms/a7K92x" method="POST">
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>

  <button type="submit">Send</button>
</form>
```

A visitor submits the form.

SiSH Form Mailer:

```text
1. Receives the request
2. Validates the request
3. Checks CORS / rate limits / spam protection
4. Saves the submission to PostgreSQL
5. Returns a response
6. Processes the submission asynchronously
7. Sends it using the user's SMTP settings
8. Delivers it to contact@example.com
```

The visitor doesn't need to wait for steps 6–8.

---

# Use Cases

### Personal Websites

Add contact forms to static or server-rendered websites without building a custom backend.

### Small Businesses

Host contact, sales, enquiry, and support forms yourself.

### Agencies

Run one SiSH Form Mailer instance for multiple websites or clients.

### Managed Hosting

Provide form processing for multiple users from a single deployment.

### Homelabs

Keep form infrastructure and submission data on infrastructure you control.

### Static Websites

Use SiSH Form Mailer as the backend for:

- Plain HTML
- Hugo
- Jekyll
- Astro
- Eleventy
- Gatsby
- React
- Vue
- Svelte
- Other static-site frameworks

---

# Roadmap

Potential future improvements include:

- [ ] Improved form configuration
- [ ] Custom email templates
- [ ] Submission history
- [ ] Webhook support
- [ ] Additional spam protection
- [ ] Improved user and permission management
- [ ] API documentation
- [ ] More deployment examples
- [ ] Official container images
- [ ] Better email delivery monitoring
- [ ] Retry and failure handling improvements
- [ ] Submission analytics

---

# Contributing

Contributions are welcome.

To contribute:

```bash
git clone https://github.com/kellenwiltshire/sish-form-mailer.git
cd sish-form-mailer
```

Create a feature branch:

```bash
git checkout -b feature/my-feature
```

Make your changes, add tests where appropriate, and open a pull request.

For larger changes, opening an issue first is recommended so the design can be discussed before implementation.

---

# License

SiSH Form Mailer is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

See [LICENSE](LICENSE) for the full license.

---

# Name

**SiSH** stands for:

> **Simple Self Hosted**

The full project name is:

> **Simple Self Hosted Form Mailer**

Or simply:

> **SiSH Form Mailer**

---

<p align="center">
  <strong>SiSH Form Mailer</strong><br>
  A fast, simple, self-hosted alternative to hosted form mailers.
</p>
