# Smart Link Router - Setup Guide

This guide explains how to install, configure, run, and test the Smart Link Router project locally.

## 1. Prerequisites

Install:

- Git
- Node.js 20+
- npm
- MongoDB

Validated during development with:

```text
Node.js 24.14.0
npm 11.9.0
```

MongoDB should be running locally.

## 2. Project Structure

```text
smart-link-router/
+-- backend/
+-- frontend/
+-- .env.example
+-- README.md
+-- SETUP.md
```

Backend:

```text
http://localhost:5000
```

Frontend:

```text
http://localhost:3000
```

## 3. MongoDB Setup

MongoDB must be running before starting the backend.

Default local MongoDB address:

```text
mongodb://127.0.0.1:27017
```

Default database:

```text
smart-link-router
```

Default connection string:

```text
mongodb://127.0.0.1:27017/smart-link-router
```

If MongoDB is unavailable, the backend is configured to fail startup rather than run without a database connection.

## 4. Clone the Repository

```bash
git clone <your-repository-url>
cd smart-link-router
```

## 5. Install Backend Dependencies

```bash
cd backend
npm install
```

## 6. Install Frontend Dependencies

From the project root:

```bash
cd frontend
npm install
```

## 7. Configure Backend Environment

The backend `.env` file is located at the project root:

```text
smart-link-router/
+-- .env
+-- .env.example
+-- backend/
+-- frontend/
```

Create `.env` from `.env.example`.

### Windows PowerShell

From the project root:

```powershell
Copy-Item .env.example .env
```

### macOS/Linux

```bash
cp .env.example .env
```

Then open `.env` and provide the required local values.

## 8. Backend Environment Variables

The root `.env` should contain:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart-link-router
TRUST_PROXY=false

ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=your-admin-password

JWT_SECRET=your-long-random-secret
COOKIE_NAME=admin_token

FRONTEND_URL=http://localhost:3000
```

### Variable descriptions

| Variable | Description |
|---|---|
| `NODE_ENV` | Application environment |
| `PORT` | Backend HTTP port |
| `MONGODB_URI` | MongoDB connection string |
| `TRUST_PROXY` | Enables Express proxy trust when required by deployment |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `JWT_SECRET` | Secret used to sign authentication JWTs |
| `COOKIE_NAME` | Authentication cookie name |
| `FRONTEND_URL` | Frontend origin used for CORS |

Use a strong random value for `JWT_SECRET`.

Do not commit real credentials or secrets.

Do not put real credentials into `.env.example`.

## 9. Configure Frontend Environment

Create:

```text
frontend/.env.local
```

with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The frontend uses this value for API requests and generated smart-link URLs.

## 10. Start MongoDB

Make sure MongoDB is running before starting the backend.

The application expects the connection configured in:

```env
MONGODB_URI
```

## 11. Start the Backend

Open a terminal:

```bash
cd backend
npm run dev
```

Backend:

```text
http://localhost:5000
```

## 12. Verify Backend Health

Open:

```text
http://localhost:5000/api/health
```

A successful response should indicate that the application is running and the database is connected.

## 13. Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Open:

```text
http://localhost:3000
```

## 14. Admin Login

Open:

```text
http://localhost:3000/login
```

Use the credentials configured in the root `.env`:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Authentication uses an HTTP-only cookie.

The JWT is not stored in:

- localStorage
- sessionStorage

## 15. Test Link Management

After logging in, open:

```text
http://localhost:3000/admin/links
```

Create a smart link with example values:

```text
Alias: my-app

iOS URL:
https://apps.apple.com/

Android URL:
https://play.google.com/

Desktop URL:
https://example.com/
```

The application generates a smart link similar to:

```text
http://localhost:5000/l/my-app
```

## 16. Test Smart Redirects

Open:

```text
http://localhost:5000/l/<alias>
```

Expected:

```text
iOS       -> iOS URL
Android   -> Android URL
Desktop   -> Desktop URL
Other     -> Desktop URL
```

The endpoint returns HTTP `302`.

## 17. Test Platform User-Agents

### iOS

```bash
curl -I -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" http://localhost:5000/l/<alias>
```

Expected:

```text
302
Location: <iOS URL>
```

### Android

```bash
curl -I -A "Mozilla/5.0 (Linux; Android 14; Pixel 7)" http://localhost:5000/l/<alias>
```

Expected:

```text
302
Location: <Android URL>
```

### Desktop

```bash
curl -I -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" http://localhost:5000/l/<alias>
```

Expected:

```text
302
Location: <Desktop URL>
```

## 18. Test Analytics

After generating redirect traffic, open:

```text
http://localhost:3000/admin/analytics
```

Verify:

- Total clicks
- Platform distribution
- Click time-series
- Top links
- Recent events
- Link selection
- Date filters

Analytics persistence occurs asynchronously after the redirect response.

## 19. Create and Publish a Blog

Open:

```text
http://localhost:3000/admin/blogs
```

Create a blog post.

A post can be saved as a draft or published.

A draft should be visible in the Admin CMS but should not appear on the public blog.

After publishing, verify:

```text
http://localhost:3000/blog
```

## 20. Public Blog

Blog index:

```text
http://localhost:3000/blog
```

Individual article:

```text
http://localhost:3000/blog/<slug>
```

Only published posts are publicly accessible.

## 21. Authentication API

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Admin authentication is handled using the HTTP-only cookie issued by the backend.

## 22. Link API

```http
POST   /api/links
GET    /api/links
GET    /api/links/:id
PUT    /api/links/:id
DELETE /api/links/:id
```

These endpoints require admin authentication.

## 23. Redirect API

```http
GET /l/:alias
```

This endpoint is public and does not require authentication.

## 24. Analytics API

```http
GET /api/analytics/:linkId
GET /api/analytics/summary/:linkId
GET /api/analytics/summary
```

Analytics admin endpoints require authentication.

## 25. Blog API

### Admin

```http
POST   /api/blogs
GET    /api/blogs
GET    /api/blogs/:id
PUT    /api/blogs/:id
DELETE /api/blogs/:id
```

### Public

```http
GET /api/blogs/published
GET /api/blogs/slug/:slug
```

Only published posts are exposed through the public blog endpoints.

## 26. Health Check

```http
GET /api/health
```

Use this endpoint to verify that the backend is running and connected to MongoDB.

## 27. Build the Frontend

```bash
cd frontend
npm run build
```

## 28. Start Backend in Production Mode

```bash
cd backend
npm run start
```

Make sure all required environment variables are configured.

## 29. Run Frontend Lint

```bash
cd frontend
npm run lint
```

The backend currently has no dedicated lint script.

## 30. Responsive Testing

Important pages should be tested at:

```text
375px  - Mobile
768px  - Tablet
1280px - Desktop
```

Verify:

- No horizontal overflow
- Navigation works
- Forms remain usable
- Tables/cards remain readable
- Analytics charts fit their containers
- Dialogs fit the viewport
- Buttons remain accessible

## 31. Recommended End-to-End Test

```text
1. Start MongoDB
       |
2. Start backend
       |
3. Start frontend
       |
4. Login as admin
       |
5. Create smart link
       |
6. Open /l/:alias
       |
7. Verify platform redirect
       |
8. Open Analytics
       |
9. Verify click event
       |
10. Create blog draft
       |
11. Publish blog
       |
12. Open /blog
       |
13. Open /blog/[slug]
       |
14. Logout
       |
15. Verify admin routes require login
```

## 32. Environment and Security Notes

Never commit:

```text
.env
frontend/.env.local
```

The repository should contain:

```text
.env.example
```

with placeholder values only.

Never place real:

- Admin passwords
- JWT secrets
- Database credentials
- API keys

inside source code or documentation.

Authentication uses an HTTP-only cookie, and the frontend does not store the JWT in browser storage.

## 33. Troubleshooting

### Backend fails to start

Check:

1. MongoDB is running.
2. `MONGODB_URI` is correct.
3. Required environment variables exist.
4. Port `5000` is available.

### Frontend cannot connect to backend

Check:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Also verify the backend is running and:

```env
FRONTEND_URL=http://localhost:3000
```

is configured in the backend `.env`.

### Authentication does not work

Check:

- Backend is running.
- Frontend is running on `http://localhost:3000`.
- `FRONTEND_URL` matches the frontend origin.
- Browser cookies are enabled.
- The frontend API client uses `credentials: include`.

### Blog or analytics data is empty

This may simply mean there is no data yet.

Create:

- At least one smart link and generate redirect traffic.
- At least one published blog post.

Then refresh the relevant page.

## 34. Repository Safety Checklist

Before pushing to GitHub:

```text
[ ] .env is not tracked
[ ] frontend/.env.local is not tracked
[ ] node_modules/ is not tracked
[ ] .next/ is not tracked
[ ] dist/ is not tracked
[ ] No real credentials are present
[ ] .env.example contains placeholders only
[ ] README.md is present
[ ] SETUP.md is present
[ ] Frontend build passes
[ ] Frontend lint passes
[ ] Backend starts successfully
[ ] MongoDB connection works
```

Check Git status:

```bash
git status
```

## 35. Git Commit and Push

After verifying the repository:

```bash
git add .
```

Review staged files:

```bash
git status
```

Commit:

```bash
git commit -m "Finalize smart link router assessment"
```

Push:

```bash
git push origin main
```

If your repository uses a different branch, replace `main` with the appropriate branch name.

## 36. Final Verification

After pushing, open the GitHub repository and verify that it contains:

```text
README.md
SETUP.md
backend/
frontend/
.env.example
```

and does NOT contain:

```text
.env
frontend/.env.local
node_modules/
.next/
dist/
```

The repository is ready for submission once the final GitHub review is complete.
