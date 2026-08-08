# Smart Link Router

A full-stack technical assessment project for managing smart links, handling platform-based redirects, tracking analytics, and publishing blog content.

## Overview

Smart Link Router allows administrators to create a single smart-link alias that redirects users to different destinations based on their device platform.

### Smart Redirect Behavior

For example:

```text
GET /l/my-app
```

The destination is selected automatically:

- iOS users -> App Store URL
- Android users -> Play Store URL
- Desktop/Other users -> Desktop/Fallback URL

The redirect returns an HTTP `302` response and analytics persistence is performed asynchronously after the redirect response.

## Features

### Smart Link Management

- Create, edit, and delete smart links
- Unique aliases
- iOS, Android, and Desktop/Fallback destination URLs
- Active/inactive link status
- Copy generated smart-link URL

### Smart Redirection

- User-Agent based platform detection
- iOS -> App Store
- Android -> Play Store
- Desktop/Other -> fallback URL
- HTTP `302` redirects
- Open-redirect protection
- Analytics persistence outside the redirect critical path

### Analytics

- Total click tracking
- Per-link analytics
- Platform distribution
- Click time-series
- Top-performing links
- Browser/device information
- IP-derived country
- Referrer
- Date filtering
- Recent click events
- Responsive analytics dashboard

### Blog CMS

- Create and edit blog posts
- Draft/publish/unpublish workflow
- Delete posts
- Markdown content
- Featured images
- Slug-based public URLs
- Public blog listing and detail pages
- Dynamic SEO metadata

### Authentication

- Admin login/logout/session check
- Environment-based admin credentials
- JWT authentication
- HTTP-only authentication cookie
- Protected admin APIs and pages

### Responsive UI

Tested at:

- 375px - mobile
- 768px - tablet
- 1280px - desktop

## Tech Stack

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- JWT
- cookie-parser
- ua-parser-js
- geoip-lite
- CORS

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Recharts
- react-markdown
- remark-gfm

## Architecture

The project is divided into a Next.js frontend and Express/MongoDB backend.

```text
                    Smart Link Router
                           |
             +-------------+-------------+
             |                           |
          Frontend                    Backend
        Next.js 16                  Express 5
             |                           |
       +-----+-----+              +------+------+
       |     |     |              |      |      |
     Public Admin Blog           Auth   Links Analytics
       |     |     |                     |
       +-----+-----+---------------------+
                                     |
                                  MongoDB
```

### Backend architecture

```text
Routes
  |
Controllers
  |
Services
  |
Models
  |
MongoDB
```

Middleware handles authentication, validation, centralized errors, and 404 responses.

### Frontend architecture

```text
Next.js App Router
        |
Pages / Routes
        |
Components
        |
Services
        |
API Client
        |
Express Backend
```

## Project Structure

```text
smart-link-router/
|
+-- backend/
|   +-- src/
|   |   +-- config/
|   |   +-- controllers/
|   |   +-- middleware/
|   |   +-- models/
|   |   +-- routes/
|   |   +-- services/
|   |   +-- utils/
|   |   +-- validators/
|   +-- package.json
|
+-- frontend/
|   +-- app/
|   |   +-- admin/
|   |   |   +-- analytics/
|   |   |   +-- blogs/
|   |   |   +-- links/
|   |   +-- blog/
|   |   +-- login/
|   |   +-- page.tsx
|   +-- components/
|   +-- lib/
|   +-- package.json
|
+-- .env.example
+-- README.md
+-- SETUP.md
```

## Application Routes

### Public Frontend

```text
/
 /blog
 /blog/[slug]
```

### Admin Frontend

```text
/login
/admin
/admin/links
/admin/analytics
/admin/blogs
```

Admin pages require authentication.

## Smart Redirect

### Endpoint

```http
GET /l/:alias
```

Example:

```text
http://localhost:5000/l/my-app
```

### Behavior

```text
iOS
  |
App Store URL

Android
  |
Play Store URL

Desktop / Other
  |
Desktop/Fallback URL
```

The redirect process:

1. Normalize the alias.
2. Perform the link lookup.
3. Verify that the link is active.
4. Parse the User-Agent.
5. Select the appropriate destination.
6. Return HTTP `302`.
7. Persist analytics asynchronously after the response.

Only URLs stored in the database are used for redirects. Query-string redirect parameters are ignored.

## Analytics

Analytics events record:

- Link ID
- Timestamp
- IP address
- IP-derived country
- Platform
- Device type
- Browser
- User-Agent
- Referrer

Analytics persistence is intentionally kept outside the redirect critical path.

### Global Summary

```http
GET /api/analytics/summary
```

### Per-Link Summary

```http
GET /api/analytics/summary/:linkId
```

### Per-Link Events

```http
GET /api/analytics/:linkId
```

## Blog CMS

### Admin API

```http
POST   /api/blogs
GET    /api/blogs
GET    /api/blogs/:id
PUT    /api/blogs/:id
DELETE /api/blogs/:id
```

### Public API

```http
GET /api/blogs/published
GET /api/blogs/slug/:slug
```

Only published posts are exposed through the public API.

Public pages:

```text
/blog
/blog/[slug]
```

Markdown is rendered using `react-markdown` with GFM support. Raw HTML execution is disabled.

## Authentication

Authentication uses an environment-configured single admin account.

### Endpoints

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

After successful login, the backend issues a JWT stored in an HTTP-only cookie.

The frontend:

- Does not read the JWT.
- Does not store the JWT in localStorage.
- Does not store the JWT in sessionStorage.
- Sends authenticated requests using `credentials: include`.

Protected API areas include:

```text
/api/links
/api/analytics
/api/blogs
```

Public functionality such as smart redirects and public blog endpoints does not require authentication.

## API Overview

### Authentication

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Links

```http
POST   /api/links
GET    /api/links
GET    /api/links/:id
PUT    /api/links/:id
DELETE /api/links/:id
```

### Redirect

```http
GET /l/:alias
```

### Analytics

```http
GET /api/analytics/:linkId
GET /api/analytics/summary/:linkId
GET /api/analytics/summary
```

### Blog

```http
POST   /api/blogs
GET    /api/blogs
GET    /api/blogs/:id
PUT    /api/blogs/:id
DELETE /api/blogs/:id

GET /api/blogs/published
GET /api/blogs/slug/:slug
```

### Health

```http
GET /api/health
```

## Local Development

See `SETUP.md` for complete setup instructions.

Quick start:

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

## Testing

The application was tested across:

### Authentication

- Login
- Logout
- Session validation
- Protected API access
- Unauthenticated access

### Smart Links

- Link creation
- Link editing
- Link deletion
- Duplicate aliases
- URL validation
- iOS redirect
- Android redirect
- Desktop redirect

### Analytics

- Global summary
- Per-link summary
- Platform distribution
- Time-series
- Date filtering
- Recent events
- Real redirect-generated events

### Blog

- Draft creation
- Publishing
- Editing
- Unpublishing
- Deletion
- Public visibility
- Slug-based pages
- Markdown rendering
- Invalid slug / 404 behavior

### Responsive Testing

```text
375px
768px
1280px
```

### Quality Checks

```bash
npm run build
npm run lint
```

Frontend build and lint checks pass.

## Environment Configuration

Backend environment variables are stored in the root `.env` file.

Frontend environment variables are stored in:

```text
frontend/.env.local
```

Environment files containing real credentials must never be committed.

`.env.example` contains placeholders only.

See `SETUP.md` for complete environment configuration.

## Screenshots

Screenshots can be added for:

- Admin Dashboard
- Link Management
- Analytics Dashboard
- Blog CMS
- Public Blog
- Login Page

## Future Improvements

- Role-based multi-user administration
- Richer analytics dimensions and exports
- Automated Playwright/Cypress tests in CI
- Optional caching for high-traffic redirect workloads
- Production deployment and monitoring
