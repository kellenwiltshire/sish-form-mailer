<p align="center">
<img width="289" height="288" alt="sish-logo" src="https://github.com/user-attachments/assets/547115f9-d00d-425a-8966-fd9099a03030" />
</p>

# SiSH Form Mailer

**Simple Self Hosted Form Mailer**

A lightweight, fast, self-hosted form backend for small developers.

SiSH Form Mailer provides a simple way to add forms to websites without building or maintaining a custom backend.

Create a form in the SiSH Form Mailer UI, get a unique six-character form code, and point your website at the generated endpoint.

**No custom API routes. No third-party form service. Just a simple form endpoint you can host yourself.**

This project is both a practical self-hosted tool and my journey learning Go by building a real application.

---

## Why I Built This

SiSH Form Mailer started as a project to learn Go.

Rather than learning through tutorials alone, I wanted to build a real application from the ground up. I also intentionally tried to use as little AI assistance as possible so that I would encounter and solve the problems myself.

The repository documents that process alongside the source code, including architectural decisions, challenges, mistakes, and lessons learned throughout development.

So while SiSH Form Mailer is a functional self-hosted form backend, the project is also a record of my journey learning Go by building something real.

---

## ✨ Features

- 🏠 **Self hosted** — Run it on your own infrastructure.
- ⚡ **Fast submissions** — Submissions are saved to PostgreSQL before the HTTP request completes.
- 💾 **Permanent submission storage** — Submissions remain available in the UI even if email delivery fails.
- 📬 **Asynchronous email delivery** — Email is sent after the submission has been persisted.
- 👥 **Multiple users** — One installation can support multiple users.
- 📝 **Multiple forms** — Each user can create multiple forms.
- 🔑 **Automatic form codes** — Every form gets a unique six-character alphanumeric code.
- 📧 **Per-user SMTP** — Each user can configure their own SMTP server and credentials.
- 🎯 **Per-form destinations** — Each form can have its own destination email address.
- 🔒 **CORS protection** — Restrict which websites are allowed to use a form.
- 🛡️ **Rate limiting & reCAPTCHA** — Protection for publicly accessible form endpoints.
- 🐳 **Docker** — Available as a pre-built Docker image.
- 🐘 **PostgreSQL** — Persistent storage for forms and submissions.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Quick Start](#quick-start)
- [Using a Form](#using-a-form)
- [Users, Forms & Email](#users-forms--email)
- [Fast & Reliable Submissions](#fast--reliable-submissions)
- [Configuration](#configuration)
- [Production Deployment](#production-deployment)
- [Development](#development)
- [Technology](#technology)
- [Security](#security)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

# How It Works

SiSH Form Mailer is designed to be hosted at a domain such as:

```text
https://form-mailer.example.com
```

A user creates a form through the SiSH Form Mailer UI.

For example:

```text
Form Name: Contact Form
Form Code: a7K92x
```

SiSH Form Mailer automatically creates the form's endpoint:

```text
https://form-mailer.example.com/api/forms/a7K92x
```

The user doesn't create a custom API route. The six-character code identifies the form.

An external website can then POST submissions directly to that endpoint.

```text
┌─────────────────┐
│   Your Website  │
│                 │
│   HTML Form     │
└────────┬────────┘
         │
         │ POST
         ▼
┌──────────────────────────┐
│     SiSH Form Mailer     │
│                          │
│  CORS / Validation       │
│  Rate Limiting           │
│  Spam Protection         │
└───────────┬──────────────┘
            │
            │ Save
            ▼
┌──────────────────────────┐
│        PostgreSQL        │
│                          │
│       Submission         │
│         stored           │
└───────────┬──────────────┘
            │
            │ Database Listener
            ▼
┌──────────────────────────┐
│      Email Delivery      │
│                          │
│       User's SMTP        │
└───────────┬──────────────┘
            │
            ▼
      Destination Email
```

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
      ## - DISABLE_RECAPTCHA=${DISABLE_RECAPTCHA} - OPTIONAL - ONLY SET A VALUE IF YOU WISH TO DISABLE RECAPTCHA
    restart: unless-stopped
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
DISABLE_RECAPTCHA=
```

Start the application:

```bash
make
```

SiSH Form Mailer will be available on the configured port.

> **Important:** Change `DB_PASSWORD`, `SECRET_KEY`, and `ADMIN_PASS` before using SiSH Form Mailer in production.
>
> reCAPTCHA is enabled by default. To disable it, set DISABLE_RECAPTCHA to any value (for example, DISABLE_RECAPTCHA=true). The actual value is not evaluated; only whether the variable is set matters.

---

# Using a Form

Once logged in, create a form through the SiSH Form Mailer UI.

The application generates a six-character code, for example:

```text
a7K92x
```

The form endpoint becomes:

```text
https://form-mailer.example.com/api/forms/a7K92x
```

An external website can submit directly to it:

```javascript
const handleSubmitForm = async (form: FormData) => {

  const formData: FormInformation = Object.fromEntries(
   form.entries(),
  ) as FormInformation

  const { name, email, phone, message } =
   formData
  try {
   const token = await executeRecaptcha('form_submission')

   const res = await fetch(
    `https://form-mailer.example.com/api/forms/a7K92x`
    {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json',
     },
     body: JSON.stringify({
      payload: {
       name,
       email,
       phone,
       message,
      },
      token,
     }),
    },
   )

   if (!res.ok) {
    throw new Error(`Form submission failed: ${res.status}`)
   }

   setFormStateCompleted(true)
  } catch (err) {
   console.error(err)
    // Any other error handling on UI side
  }
 }

```

The website does not need its own backend.

---

# Users, Forms & Email

SiSH Form Mailer is designed around a simple multi-user, multi-form model.

## Users

A single installation can support multiple users.

Each user can manage their own forms and configure their own SMTP settings.

## Forms

Each user can create multiple forms.

Every form receives its own generated six-character code:

```text
Contact Form       → a7K92x
Sales Enquiry      → B92mLp
Support Request    → x7Q4nK
Job Application    → P82kLm
```

## SMTP

SMTP configuration belongs to the user.

For example:

```text
User A → smtp.company-a.com
User B → smtp.company-b.com
```

Each user's submissions are sent using their configured SMTP credentials.

SMTP credentials are encrypted when stored and only decrypted when they are needed to send an email.

## Destination Email

The destination email belongs to the form.

For example:

```text
Contact Form       → contact@example.com
Sales Enquiry      → sales@example.com
Support Request    → support@example.com
```

This allows a single user to route different forms to different inboxes.

The resulting model is intentionally simple:

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

# Fast & Reliable Submissions

One of the core design goals of SiSH Form Mailer is that form submissions should feel instant.

The HTTP request does **not** wait for SMTP.

Instead:

```text
Browser
   │
   ▼
Form Endpoint
   │
   ▼
Validate Request
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
Process Submission
   │
   ▼
User's SMTP Server
   │
   ▼
Destination Email
```

The submission is permanently stored in PostgreSQL before email delivery is attempted.

This means:

- A slow SMTP server doesn't slow down the form submission.
- A temporary SMTP failure doesn't cause the submission to disappear.
- The submission remains accessible through the SiSH Form Mailer UI.
- Email delivery can be handled independently of the original HTTP request.

The database is the durable source of truth for submissions.

> **If an email fails, the submission is still there.**

Automatic retry of failed email delivery is planned for a future release and is not part of the 1.0 scope.

---

# Configuration

SiSH Form Mailer is configured through environment variables.

| Variable               | Description                                   |
| ---------------------- | --------------------------------------------- |
| `PORT`                 | HTTP port                                     |
| `TZ`                   | Application/container timezone                |
| `PUID`                 | Container user ID                             |
| `PGID`                 | Container group ID                            |
| `DB_HOST`              | PostgreSQL hostname                           |
| `DB_PORT`              | PostgreSQL port                               |
| `DB_USERNAME`          | PostgreSQL username                           |
| `DB_PASSWORD`          | PostgreSQL password                           |
| `DB_DATABASE_NAME`     | PostgreSQL database name                      |
| `SECRET_KEY`           | Application secret                            |
| `ADMIN_PASS`           | Initial administrator password                |
| `INITIAL_ORIGIN`       | Application origin                            |
| `RECAPTCHA_PROJECT_ID` | Google reCAPTCHA Enterprise project           |
| `RECAPTCHA_SITE_KEY`   | Google reCAPTCHA site key                     |
| `RECAPTCHA_API_KEY`    | Google reCAPTCHA API key                      |
| `DISABLE_RECAPTCHA`    | Disables reCAPTCHA when any value is provided |

### reCAPTCHA

reCAPTCHA is enabled by default.

To disable it, set `DISABLE_RECAPTCHA` to **any value**:

```env
DISABLE_RECAPTCHA=true
```

The value itself is not evaluated. The presence of a value disables reCAPTCHA.

SMTP settings are configured by users through the SiSH Form Mailer UI.

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
- Back up the PostgreSQL data.
- Protect SMTP credentials.

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

# Security

SiSH Form Mailer exposes public form endpoints, so abuse prevention is an important part of the application.

It includes:

- CORS protection
- Rate limiting
- Optional reCAPTCHA support
- Persistent database storage
- Encrypted SMTP credentials

For production deployments:

- Use HTTPS.
- Keep PostgreSQL off the public internet.
- Use strong passwords.
- Protect the application secret.
- Configure CORS appropriately.
- Keep the application and dependencies up to date.
- Monitor application and email-delivery logs.
- Back up the database.

> **CORS is not authentication.** A form endpoint should be considered publicly reachable even when CORS restrictions are configured. CORS controls browser origins; it does not prevent direct HTTP requests.

---

# Roadmap

SiSH Form Mailer intentionally focuses on being a small, simple solution rather than becoming a full-featured form platform.

Planned or potential future improvements include:

- [ ] Retry failed email deliveries
- [ ] File uploads

Features are intentionally kept focused on the needs of small developers and self-hosted deployments.

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
  A fast, simple, self-hosted form backend for small developers.
</p>
