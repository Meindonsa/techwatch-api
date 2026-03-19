# RSS Reader API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)

A lightweight REST API built with Hono that detects and reads RSS, Atom, and other feed formats from websites.

---

## Technologies

- **[Hono](https://hono.dev/)** — Fast, lightweight web framework
- **[Node.js](https://nodejs.org/)** — Runtime environment
- **[rss-parser](https://github.com/rbren/rss-parser)** — RSS/Atom feed parser
- **[node-html-parser](https://github.com/taoqf/node-html-parser)** — HTML parser for feed detection
- **[Zod](https://zod.dev/)** — Input validation
- **[node-cache](https://github.com/node-cache/node-cache)** — In-memory caching
- **[Vitest](https://vitest.dev/)** — Unit testing

---

## Project Structure

```
src/
├── index.ts                        # Entry point
├── doc.ts                          # OpenAPI documentation
├── middlewares/
│   ├── auth.middleware.ts          # Bearer token authentication
│   ├── rate-limit.middleware.ts    # Rate limiting (60 req/min per IP)
│   └── ssrf.middleware.ts          # SSRF protection (disabled in dev)
├── routes/
│   ├── detection.route.ts              # Feed detection route
│   ├── article.route.ts            # Single feed route
│   └── articles.route.ts          # Multiple feeds route
├── services/
│   ├── feed.service.ts             # Feed detection logic
│   ├── article.service.ts          # Feed parsing logic
│   └── cache.service.ts            # Cache management
├── validators/
│   └── feed.validator.ts           # Zod schemas
├── utils/
│   └── errors.ts                   # Typed errors
└── tests/                          # Vitest unit tests
```

---

## Installation

```bash
# Clone the repository
git clone https://github.com/Meindonsa/Techwatch-api.git
cd Techwatch-api

# Install dependencies
npm install
```

---

## Configuration

Create a `.env` file at the root of the project:

```env
API_SECRET_TOKEN=your-secret-token-here
```

> All API requests must include this token in the `Authorization` header.

---

## Running the API

```bash
# Development
npm run dev

# Production
npm run build
npm start

# Tests
npm run test

# Tests with coverage
npm run test:coverage
```

The server runs on `http://localhost:3000` by default.

---

## Docker

```bash
# Build and start
docker compose up --build

# Run in background
docker compose up --build -d

# Stop
docker compose down
```

---

## Authentication

Every request must include a Bearer token in the `Authorization` header:

```
Authorization: Bearer your-secret-token-here
```

Requests without a valid token will receive a `401 Unauthorized` response.

---

## API Documentation

Swagger UI is available at `http://localhost:3000/ui` (no token required).

The raw OpenAPI JSON is available at `http://localhost:3000/doc`.

---

## Endpoints

### `POST /detect`

Detects whether a website has an RSS, Atom, or other feed available. Results are cached for 1 hour.

**Request body:** a plain URL string

```bash
curl -X POST http://localhost:3000/detect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token-here" \
  -d '"dev.to"'
```

**Success response `200`:**

```json
{
  "type": "rss",
  "feedUrl": "https://dev.to/feed",
  "detectionMethod": "Balise <link> dans le HTML",
  "originalUrl": "https://dev.to",
  "fromCache": false
}
```

**No feed found `404`:**

```json
{
  "error": "Aucun flux détecté",
  "originalUrl": "https://example.com"
}
```

---

### `POST /article`

Fetches all articles from a single feed URL, sorted by date descending.

**Request body:** a plain feed URL string

```bash
curl -X POST http://localhost:3000/article \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token-here" \
  -d '"https://dev.to/feed"'
```

**Success response `200`:**

```json
{
  "feedUrl": "https://dev.to/feed",
  "title": "DEV Community",
  "articles": [
    {
      "title": "My Article Title",
      "link": "https://dev.to/user/my-article",
      "date": "2024-01-15T10:00:00Z",
      "summary": "A short description of the article...",
      "author": "john_doe",
      "image": null
    }
  ]
}
```

**Error responses:**

| Status | Code | Description |
|---|---|---|
| `422` | `TIMEOUT` | Site took too long to respond |
| `422` | `UNREACHABLE` | Site is down or doesn't exist |
| `422` | `PARSE_ERROR` | Feed content could not be parsed |
| `404` | `NOT_FOUND` | No feed found at this URL |

---

### `POST /articles`

Fetches articles from multiple feed URLs in a single request. Failed feeds are skipped and reported separately. Maximum 10 URLs per request.

**Request body:** an array of feed URL strings

```bash
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-token-here" \
  -d '[
    "https://dev.to/feed",
    "https://blog.nasa.gov/feed/",
    "https://invalid-url.xyz/feed"
  ]'
```

**Success response `200`:**

```json
{
  "total": 2,
  "failed": [
    {
      "feedUrl": "https://invalid-url.xyz/feed",
      "error": "Site inaccessible ou inexistant",
      "code": "UNREACHABLE"
    }
  ],
  "feeds": [
    {
      "feedUrl": "https://dev.to/feed",
      "title": "DEV Community",
      "articles": [...]
    },
    {
      "feedUrl": "https://blog.nasa.gov/feed/",
      "title": "NASA Blog",
      "articles": [...]
    }
  ]
}
```

> If all feeds succeed, the `failed` field is omitted from the response.

---

## Contributors

- **Meindonsa** — [@Meindonsa](https://github.com/Meindonsa)

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.