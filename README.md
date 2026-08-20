# SiSH Form Mailer

**Simple Self Hosted Form Mailer**

A lightweight, fast, self-hosted alternative to services like [Formspree](https://formspree.io/).

SiSH Form Mailer lets you create forms through a web interface and use them from any website. Each form is automatically assigned a unique six-character alphanumeric code, which becomes its API endpoint.

**Create a form → Add the endpoint to your website → Receive submissions by email.**

## Features

- 🏠 **Self hosted** — Your forms and submissions run on your own infrastructure.
- ⚡ **Fast** — Submissions are saved to PostgreSQL before the request completes.
- 📬 **Asynchronous email** — Email delivery happens after the submission has been saved.
- 👥 **Multiple users** — One installation can support multiple users.
- 📝 **Multiple forms** — Each user can create multiple forms.
- 🔑 **Automatic form codes** — Every form gets a unique six-character alphanumeric code.
- 📧 **Per-user SMTP** — Each user can configure their own SMTP server and credentials.
- 🎯 **Per-form destinations** — Each form can send submissions to its own target email address.
- 🔒 **CORS protection** — Control which websites can submit to each form.
- 🛡️ **Rate limiting & reCAPTCHA** — Protection for public form endpoints.
- 🐳 **Docker** — Deploy with a pre-built Docker image.
- 🐘 **PostgreSQL** — Persistent storage for forms and submissions.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Quick Start](#quick-start)
- [Using a Form](#using-a-form)
- [Users, Forms & Email](#users-forms--email)
- [Fast by Design](#fast-by-design)
- [Configuration](#configuration)
- [Production Deployment](#production-deployment)
- [Development](#development)
- [Technology](#technology)
- [Security](#security)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## How It Works

SiSH Form Mailer is designed to sit between your website and your email infrastructure.

For example, you might host it at:

```text
https://form-mailer.example.com
```

You create a form through the SiSH Form Mailer UI:

```text
Form Name: Contact Form
Form Code: a7K92x
```

The form's API endpoint is then:

```text
https://form-mailer.example.com/api/forms/a7K92x
```

Your website posts form submissions to that endpoint.

```text
┌─────────────────┐
│   Your Website  │
│                 │
│  HTML Form      │
└────────┬────────┘
         │
         │ POST
         ▼
┌─────────────────────────┐
│    SiSH Form Mailer     │
│                         │
│  CORS / Validation      │
│  Rate Limiting           │
│  Spam Protection         │
└───────────┬─────────────┘
            │
            │ Save
            ▼
┌─────────────────────────┐
│       PostgreSQL        │
│                         │
│      Submission         │
└───────────┬─────────────┘
            │
            │ DB Listener
            ▼
┌─────────────────────────┐
│     Email Delivery      │
│                         │
│      User's SMTP        │
└───────────┬─────────────┘
            │
            ▼
      Destination Email
```

Users don't create custom API routes. The application generates the form code automatically.

---

# Quick Start

SiSH Form Mailer is available as a pre-built Docker image:

```text
kellenwiltshire/sish-form-mailer:latest
```

Create a `docker-compose.yml`:

```yaml
services:
  database:
    container_name: sish-database
    image: postgres:17
    ports:
      - "${DB_PORT}:5432"
    environment:
      - PUID=${PUID}
      - PGID=${PGID}
      - TZ=${TZ}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_USER=${DB_USERNAME}
      - POSTGRES_DB=${DB_DATABASE_NAME}
    volumes:
      - "/mnt/user/appdata/sish/db:/var/lib/postgresql/data/:rw"

  sish-form-mailer:
    image: kellenwiltshire/sish-form-mailer:latest
    container_name: sish-form-mailer
    ports:
      - "${PORT}:8080"
    depends_on:
      - database
    environment:
      - PUID=${PUID}
      - PGID=${PGID}
      - TZ=${TZ}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_USERNAME=${DB_USERNAME}
      - DB_DATABASE_NAME=${DB_DATABASE_NAME}
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - SECRET_KEY=${SECRET_KEY}
      - ADMIN_PASS=${ADMIN_PASS}
      - INITIAL_ORIGIN=${INITIAL_ORIGIN}
      - RECAPTCHA_PROJECT_ID=${RECAPTCHA_PROJECT_ID}
      - RECAPTCHA_SITE_KEY=${RECAPTCHA_SITE_KEY}
      - RECAPTCHA_API_KEY=${RECAPTCHA_API_KEY}
    restart: unless-stopped

networks:
  media-centre-network:
    driver: bridge
```

Create an environment file:

```env
PUID=99
PGID=100
TZ=America/New_York

PORT=8080

DB_HOST=database
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=change-me
DB_DATABASE_NAME=sish

SECRET_KEY=change-me
ADMIN_PASS=change-me

INITIAL_ORIGIN=https://form-mailer.example.com

RECAPTCHA_PROJECT_ID=
RECAPTCHA_SITE_KEY=
RECAPTCHA_API_KEY=
```

Then start the application:

```bash
docker compose up -d
```

SiSH Form Mailer will be available on the configured port.

> **Important:** Change `DB_PASSWORD`, `SECRET_KEY`, and `ADMIN_PASS` before using SiSH Form Mailer in production.
> reCAPTCHA is enabled by default. To disable it, set DISABLE_RECAPTCHA to any value (for example, DISABLE_RECAPTCHA=true). The actual value is not evaluated; only whether the variable is set matters.

---

# Using a Form

After logging into SiSH Form Mailer, create a form through the web interface.

The application will generate a six-character code such as:

```text
a7K92x
```

The resulting endpoint is:

```text
https://form-mailer.example.com/api/forms/a7K92x
```

An external website can submit directly to it:

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

The website does not need its own backend.

---

# Users, Forms & Email

SiSH Form Mailer is designed around a **multi-user, multi-form** model.

### Users

A single installation can have multiple users.

Each user can manage their own forms and configure their own SMTP settings.

### Forms

Each user can create multiple forms.

Every form gets its own generated six-character code:

```text
Contact Form       → a7K92x
Sales Enquiry      → B92mLp
Support Request    → x7Q4nK
Job Application    → P82kLm
```

### SMTP

SMTP configuration belongs to the user.

For example:

```text
User A → smtp.company-a.com
User B → smtp.company-b.com
```

This allows a single SiSH Form Mailer installation to serve multiple users without requiring everyone to share the same outbound mail account.

### Destination Email

The destination email belongs to the form.

For example:

```text
Contact Form       → contact@example.com
Sales Enquiry      → sales@example.com
Support Request    → support@example.com
```

This gives you a simple separation:

```text
User
├── SMTP Configuration
│
├── Form
│   ├── Generated Code
│   ├── CORS Configuration
│   └── Destination Email
│
└── Form
    ├── Generated Code
    ├── CORS Configuration
    └── Destination Email
```

---

# Fast by Design

A key design goal of SiSH Form Mailer is that **form submissions should feel instant**.

The HTTP request does not wait for an email to be sent.

Instead:

```text
Browser
   │
   ▼
Form Endpoint
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

Email delivery happens afterward through a database listener:

```text
PostgreSQL
   │
   ▼
Database Listener
   │
   ▼
Process Submission
   │
   ▼
User's SMTP Server
   │
   ▼
Form's Destination Email
```

This means a slow SMTP server or temporary email-provider delay doesn't need to make the website visitor wait.

The database provides the durable handoff between accepting the submission and delivering the email.

---

# Configuration

SiSH Form Mailer is configured through environment variables.

| Variable               | Description                         |
| ---------------------- | ----------------------------------- |
| `PORT`                 | HTTP port                           |
| `TZ`                   | Application/container timezone      |
| `PUID`                 | Container user ID                   |
| `PGID`                 | Container group ID                  |
| `DB_HOST`              | PostgreSQL hostname                 |
| `DB_PORT`              | PostgreSQL port                     |
| `DB_USERNAME`          | PostgreSQL username                 |
| `DB_PASSWORD`          | PostgreSQL password                 |
| `DB_DATABASE_NAME`     | PostgreSQL database name            |
| `SECRET_KEY`           | Application secret                  |
| `ADMIN_PASS`           | Initial administrator password      |
| `INITIAL_ORIGIN`       | Application origin                  |
| `RECAPTCHA_PROJECT_ID` | Google reCAPTCHA Enterprise project |
| `RECAPTCHA_SITE_KEY`   | reCAPTCHA site key                  |
| `RECAPTCHA_API_KEY`    | reCAPTCHA API key                   |

SMTP configuration is managed by users through the application.

---

# Production Deployment

A typical production setup looks like:

```text
                       Internet
                           │
                         HTTPS
                           │
                           ▼
                  ┌─────────────────┐
                  │ Reverse Proxy   │
                  │                 │
                  │ form-mailer.    │
                  │ example.com     │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ SiSH Form       │
                  │ Mailer          │
                  └────────┬────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                    ▼             ▼
               PostgreSQL     User SMTP
                    │             │
                    ▼             ▼
              DB Listener    Destination
                    │           Email
                    └─────┬───────┘
                          │
                          ▼
                     Submission
                      delivered
```

For production deployments:

- Use HTTPS.
- Put the application behind a reverse proxy.
- Keep PostgreSQL private.
- Use strong database credentials.
- Use a unique `SECRET_KEY`.
- Configure CORS appropriately.
- Consider enabling reCAPTCHA.
- Back up the PostgreSQL data directory.

---

# Development

For development, clone the repository:

```bash
git clone https://github.com/kellenwiltshire/sish-form-mailer.git
cd sish-form-mailer
```

The repository includes development Dockerfiles and Docker Compose configuration for running the backend, frontend, and PostgreSQL locally.

```bash
docker compose up
```

---

# Technology

SiSH Form Mailer uses:

- **Go** — Backend
- **React** — Frontend
- **Bun** — Frontend tooling
- **PostgreSQL** — Database
- **Docker** — Deployment
- **Goose** — Database migrations

---

# Project Structure

```text
.
├── client/              # Frontend application
├── internal/            # Go backend packages
├── journey/             # Integration tests
├── migrations/          # Database migrations
│
├── main.go              # Application entry point
├── Dockerfile           # Production image
├── Dockerfile.dev       # Backend development image
├── DockerfileWeb.dev   # Frontend development image
├── compose.yml          # Docker Compose configuration
├── entrypoint.sh        # Container entrypoint
├── .env.example         # Configuration example
├── go.mod
├── go.sum
└── LICENSE
```

---

# Security

SiSH Form Mailer exposes public form endpoints, so abuse prevention is an important part of the application.

It includes:

- CORS protection
- Rate limiting
- Optional reCAPTCHA support
- Database-backed submission persistence

For production deployments, also:

- Use HTTPS.
- Keep PostgreSQL off the public internet.
- Protect SMTP credentials.
- Use strong passwords.
- Keep the application and dependencies up to date.
- Monitor logs and email delivery.

---

# Roadmap

Potential future improvements:

- [ ] Improved form configuration
- [ ] Custom email templates
- [ ] Submission history
- [ ] Webhook support
- [ ] Additional spam protection
- [ ] Improved user and permission management
- [ ] API documentation
- [ ] Email delivery monitoring
- [ ] Retry/failure handling improvements
- [ ] Submission analytics

---

# Contributing

Contributions are welcome.

For larger changes, opening an issue first is recommended so the approach can be discussed before implementation.

---

# License

SiSH Form Mailer is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

See [LICENSE](LICENSE) for the full license text.

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
