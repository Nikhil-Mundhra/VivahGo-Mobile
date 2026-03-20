# VivahGo

VivahGo now supports two login modes:

- Demo login: opens the planner with seeded example wedding data.
- Google login: verifies the Google account on the backend, creates a blank planner for new users, and stores planner data in MongoDB so it is restored when the same account logs in again.

## Environment

Copy values from .env.example into a local .env file and set:

- VITE_GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_ID
- MONGODB_URI
- JWT_SECRET
- CLIENT_ORIGIN

Use the same Google web client ID for both VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID.

Important: the Google OAuth client must be created as a Web application client. Android, iOS, Desktop, or other client types will fail here with errors such as invalid_client or no registered origin.

For Google Sign-In to work in local development, open your OAuth 2.0 Client ID in Google Cloud Console and add these under Authorized JavaScript origins:

- http://localhost:5173
- http://127.0.0.1:5173

If Vite runs on a different port, add that exact frontend origin as well.

If you later move to a redirect-based OAuth flow, also add the backend callback URL under Authorized redirect URIs. For the current implementation, Authorized JavaScript origins are the key setting.

## Run

Install dependencies:

```bash
npm install
```

Start the frontend and backend together:

```bash
npm run dev
```

The Vite app runs on http://localhost:5173 and the API runs on http://localhost:4000.

## API

- POST /api/auth/google: verifies Google sign-in and creates a user session.
- GET /api/planner/me: loads the saved planner for the logged-in user.
- PUT /api/planner/me: saves the current planner to MongoDB.
