# VivahGo

VivahGo is a wedding planning platform built for Indian weddings. It combines a React + Vite frontend, a local Express API for development, and Vercel-style serverless API routes for deployment. The product now includes collaborative planning, public wedding websites, guest RSVP flows, vendor onboarding, subscriptions, careers, and admin operations.

## Table of Contents

- [What’s in the Product](#whats-in-the-product)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Run Locally](#run-locally)
- [Observability](#observability)
- [Routes and Product Areas](#routes-and-product-areas)
- [API Overview](#api-overview)
- [API and Architecture Doc](#api-and-architecture-doc)
- [Automation and Security](#automation-and-security)
- [Testing and Linting](#testing-and-linting)
- [Deployment Notes](#deployment-notes)
- [Security](#security)

## What’s in the Product

- Wedding planner workspace with dashboards, events, budget, guests, vendors, and tasks.
- Demo mode for quick product exploration with seeded local planner data.
- Google-authenticated mode with MongoDB persistence.
- Multi-plan support for managing more than one wedding workspace.
- Collaborator roles per plan: `owner`, `editor`, and `viewer`.
- Workspace switching for shared planner access.
- Public wedding website generation with custom slug/theme/settings.
- Guest RSVP links and RSVP submission flow for invited guests.
- Marketing home and pricing pages.
- Vendor portal with business registration, profile editing, portfolio/media management, and private verification document uploads.
- Public vendor directory backed by approved vendor records.
- Admin portal for vendor moderation, staff management, career applications, and paid subscriber visibility.
- Careers page with application submission and private resume upload to Backblaze B2.
- Subscription checkout for `premium` and `studio` plans with Razorpay, coupon support, and receipt generation.
- Feedback submission flow and legal/about modals.
- Capacitor iOS wrapper for mobile packaging.

## Project Structure

```text
.
├── api/              # Vercel serverless API routes and shared helpers
├── config/           # Local config data such as careers and coupon examples
├── test/             # Root Mocha test suite
├── vivahgo/          # Main app workspace
│   ├── src/          # React frontend
│   ├── server/       # Express server for local development
│   ├── public/       # Static assets
│   └── ios/          # Capacitor iOS project
├── FEATURE_GUIDE.md
├── Makefile
├── README.md
├── SECURITY.md
└── vercel.json
```

## Tech Stack

- Frontend: React 19, Vite
- Styling: CSS, Tailwind tooling
- Local backend: Express 5
- Deployment backend: Vercel serverless functions
- Database: MongoDB with Mongoose
- Authentication: Google OAuth token verification + JWT sessions
- Payments: Razorpay
- Public media storage: Cloudflare R2
- Private document storage: Backblaze B2 (S3-compatible)
- Analytics and observability: PostHog, Sentry, Axiom, Microsoft Clarity, Vercel Analytics, Vercel Speed Insights
- Mobile shell: Capacitor iOS
- Testing: Mocha, Supertest, c8
- Linting: ESLint

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB instance
- Google Cloud OAuth Web client credentials

### Install Dependencies

Repository root:

```bash
npm install
```

App workspace:

```bash
cd vivahgo
npm install
```

## Configuration

Create a local environment file:

```bash
cp vivahgo/.env.example vivahgo/.env
```

### Core required variables

- `VITE_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_ID`
- `MONGODB_URI`
- `JWT_SECRET`
- `PLANNER_ENCRYPTION_KEY`
- `CLIENT_ORIGIN`

### Frontend/runtime variables

- `VITE_API_BASE_URL`
- `VITE_USE_REMOTE_API`

### Feature-specific backend variables

- Feedback: `FEEDBACK_WEBHOOK_URL`, `FEEDBACK_SECRET_KEY`
- Planner field encryption: `PLANNER_ENCRYPTION_KEY`
- RSVP signing: `RSVP_TOKEN_SECRET` (optional, otherwise falls back to `JWT_SECRET`)
- Coupons: `SUBSCRIPTION_COUPONS_JSON`
- Payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- Payment amount overrides:
  - `RAZORPAY_PREMIUM_MONTHLY_AMOUNT`
  - `RAZORPAY_PREMIUM_YEARLY_AMOUNT`
  - `RAZORPAY_STUDIO_MONTHLY_AMOUNT`
  - `RAZORPAY_STUDIO_YEARLY_AMOUNT`
- Billing email: `RESEND_API_KEY`, `BILLING_FROM_EMAIL`
- Public media storage (vendor portfolio + Choice assets):
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_ENDPOINT`
  - `R2_BUCKET_NAME`
  - `R2_PUBLIC_URL`
- Admin bootstrap: `ADMIN_OWNER_EMAIL`
- Private document storage (Backblaze B2 for resumes and vendor verification uploads):
  - `B2_ACCESS_KEY_ID`
  - `B2_SECRET_ACCESS_KEY`
  - `B2_ENDPOINT`
  - `B2_BUCKET_NAME`
- Observability:
  - `VITE_POSTHOG_KEY`
  - `VITE_POSTHOG_HOST`
  - `VITE_SENTRY_DSN`
  - `VITE_SENTRY_PROJECT_URL`
  - `SENTRY_DSN`
  - `VITE_CLARITY_PROJECT_ID`
  - `AXIOM_TOKEN`
  - `AXIOM_DATASET`
  - `AXIOM_ORG_ID`
  - `AXIOM_URL`
  - `AXIOM_EDGE`
  - `AXIOM_EDGE_URL`
- Public asset map refresh:
  - `BLOB_READ_WRITE_TOKEN`
  - `PUBLIC_ASSET_MAP_USE_DOTENV_BLOB_TOKEN=true` to allow the asset-map generator to read `BLOB_READ_WRITE_TOKEN` from `.env` during an intentional local refresh
  - `PUBLIC_ASSET_MAP_BLOB_TIMEOUT_MS` to override the Blob listing timeout

Use [vivahgo/.env.example](/Users/nikhil/Documents/VivahGo-mobile/vivahgo/.env.example) as the source of truth for local setup.

### Planner encryption

Planner data is encrypted server-side before it is stored in MongoDB when `PLANNER_ENCRYPTION_KEY` is configured. The encryption layer protects private planner content such as wedding details, events, budgets, guests, vendors, tasks, website settings, framework answers, and custom templates. Lookup and access-control fields that the app still needs to query remain plaintext, including `googleId`, plan/item IDs, `planId`, public `websiteSlug`, and collaborator emails/roles.

Use a 32-byte base64 key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Local, staging, and production keys can be different when they use different MongoDB databases. A database must always be read with the same key that encrypted its planner data; pointing local code at production MongoDB requires the production planner encryption key.

Production requires a real `PLANNER_ENCRYPTION_KEY`; placeholder values are rejected.

### Google OAuth Notes

- Use a Google OAuth client of type **Web application**.
- Keep `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` the same.
- Add local frontend origins such as:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
- Add your deployed frontend domain to both Google OAuth and `CLIENT_ORIGIN`.

## Run Locally

From the app directory:

```bash
cd vivahgo
npm run dev
```

This starts:

- Vite frontend on `http://localhost:5173`
- Express API server on `http://localhost:4000`

From repository root you can also use:

```bash
npm run dev
```

Or:

```bash
make run_local
```

## Observability

VivahGo uses the strongest free parts of several observability tools, with PostHog as the main product analytics timeline:

- PostHog captures manual pageviews, auth lifecycle events, product events, user identity, route context, and shared observability properties.
- Sentry captures frontend and backend exceptions plus browser/server tracing. Frontend Sentry events are mirrored into PostHog as `exception_occurred` events, including Sentry event IDs and search links when configured.
- Microsoft Clarity remains the session replay store. Clarity project/session/page IDs and replay links are attached to PostHog events and person properties so a PostHog event can lead directly to the relevant replay.
- Axiom stores backend request and application logs. Client requests carry an `axiom_trace_id` header so PostHog, Sentry, Axiom logs, and API requests can be correlated.

The shared browser context lives in [vivahgo/src/shared/observability.js](/Users/nikhil/Documents/VivahGo-mobile/vivahgo/src/shared/observability.js). PostHog event capture is centralized in [vivahgo/src/shared/posthog.js](/Users/nikhil/Documents/VivahGo-mobile/vivahgo/src/shared/posthog.js), Sentry mirroring in [vivahgo/src/shared/sentry.js](/Users/nikhil/Documents/VivahGo-mobile/vivahgo/src/shared/sentry.js), and Clarity replay linking in [vivahgo/src/shared/clarity.js](/Users/nikhil/Documents/VivahGo-mobile/vivahgo/src/shared/clarity.js).

## Routes and Product Areas

- `/` - Main planner application
- `/home` - Marketing home page
- `/pricing` - Pricing page
- `/careers` - Careers page
- `/vendor` - Vendor portal
- `/admin` - Admin portal
- `/wedding` - Local wedding website preview
- `/:slug` - Public wedding website by slug
- `/rsvp/:token` - Guest RSVP page

## API Overview

For a fuller route map and backend architecture walkthrough, see [docs/api-architecture.md](/Users/nikhil/Documents/VivahGo-mobile/docs/api-architecture.md).

### Auth and account

- `POST /api/auth/google`
- `DELETE /api/auth/me`

### Planner

- `GET /api/planner/me`
- `PUT /api/planner/me`
- `GET /api/planner/access`
- `GET /api/planner/public`
- `POST /api/planner/me/rsvp-link`
- `GET /api/planner/rsvp`
- `POST /api/planner/rsvp`
- `GET /api/planner/me/collaborators`
- `POST /api/planner/me/collaborators`
- `PUT /api/planner/me/collaborators`
- `DELETE /api/planner/me/collaborators`

### Vendor and media

- `GET /api/vendors`
- `GET /api/vendor/me`
- `POST /api/vendor/me`
- `PATCH /api/vendor/me`
- `POST /api/media/presigned-url`
- `POST /api/media/verification-presigned-url`
- `POST /api/vendor/media`
- `PUT /api/vendor/media`
- `DELETE /api/vendor/media`
- `POST /api/vendor/verification`
- `DELETE /api/vendor/verification`

### Subscription

- `GET /api/subscription/status`
- `POST /api/subscription/quote`
- `POST /api/subscription/checkout`
- `POST /api/subscription/confirm`
- `POST /api/subscription/portal`
- `POST /api/subscription/webhook`

### Admin

- `GET /api/admin/me`
- `GET /api/admin/vendors`
- `PATCH /api/admin/vendors`
- `GET /api/admin/staff`
- `POST /api/admin/staff`
- `PUT /api/admin/staff`
- `DELETE /api/admin/staff`
- `GET /api/admin/applications`
- `GET /api/admin/subscribers`

### Misc

- `GET /api/health`
- `GET /api/careers`
- `POST /api/careers`
- `POST /api/feedback`

## API and Architecture Doc

The main backend architecture and route documentation lives in [docs/api-architecture.md](/Users/nikhil/Documents/VivahGo-mobile/docs/api-architecture.md).

## Automation and Security

The repository includes baseline automation for dependency maintenance, static security analysis, and deployment workflows:

- Dependabot config in [.github/dependabot.yml](/Users/nikhil/Documents/VivahGo-mobile/.github/dependabot.yml) for the root, `vivahgo`, and `my-video` npm workspaces
- CodeQL SAST scanning in [.github/workflows/codeql.yml](/Users/nikhil/Documents/VivahGo-mobile/.github/workflows/codeql.yml)
- Vercel deployment automation in [.github/workflows/vercel-deploy.yml](/Users/nikhil/Documents/VivahGo-mobile/.github/workflows/vercel-deploy.yml)

To use the Vercel deployment workflow, configure these GitHub repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Testing and Linting

Run the full test suite from the repository root:

```bash
npm test
```

Run coverage:

```bash
npm run test:coverage
```

Check the coverage threshold:

```bash
npm run coverage:check
```

Run app linting:

```bash
cd vivahgo
npm run lint
```

## Deployment Notes

- The `api/` directory contains the serverless routes used for Vercel deployment.
- The local Express server in [vivahgo/server/index.js](/Users/nikhil/Documents/VivahGo-mobile/vivahgo/server/index.js) mirrors the main API behavior for development.
- In local development, the frontend defaults to `http://localhost:4000/api` unless `VITE_USE_REMOTE_API=true`.
- Production can usually use relative `/api` requests without setting `VITE_API_BASE_URL`.
- `npm run build --prefix vivahgo` refreshes the public asset map before Vite builds. Local builds fall back to the checked-in generated map unless `BLOB_READ_WRITE_TOKEN` is present in the real environment. To intentionally refresh from a token stored in `.env`, set `PUBLIC_ASSET_MAP_USE_DOTENV_BLOB_TOKEN=true`.

## SEO Verification

After deploying, run the smoke test against production:

```bash
npm run verify:seo -- https://vivahgo.com
```

To verify public wedding or RSVP previews too, pass real routes:

```bash
npm run verify:seo -- https://vivahgo.com /home /pricing /careers /asha-rohan-1 /rsvp/REAL_TOKEN
```

The script checks the initial HTML response for:

- `<title>`
- canonical link
- description
- Open Graph tags
- Twitter card tags
- robots tag

## Security

See [SECURITY.md](/Users/nikhil/Documents/VivahGo-mobile/SECURITY.md) for supported versions and vulnerability reporting instructions.
