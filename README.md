# TECHWATCH RSS Reader API

A lightweight REST API built with Hono that detects and reads RSS, Atom, and other feed formats from websites.

---

## Technologies

- **[Hono](https://hono.dev/)** — Fast, lightweight web framework
- **[Node.js](https://nodejs.org/)** — Runtime environment
- **[rss-parser](https://github.com/rbren/rss-parser)** — RSS/Atom feed parser
- **[node-html-parser](https://github.com/taoqf/node-html-parser)** — HTML parser for feed detection

---

## Project Structure

```
src/
├── index.ts                  # Entry point
├── middlewares/
│   └── auth.middleware.ts    # Bearer token authentication
├── routes/
│   ├── check.route.ts        # Feed detection route
│   ├── article.route.ts      # Single feed route
│   └── articles.route.ts     # Multiple feeds route
└── services/
    ├── feed.service.ts       # Feed detection logic
    └── article.service.ts    # Feed parsing logic
```

---

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/rss-reader.git
cd rss-reader

# Install dependencies
npm install
```

---

## Configuration

Create a `.env` file at the root of the project:

```env
API_SECRET_TOKEN=your-secret-token-here
```

> All requests must include this token in the `Authorization` header.

---

## Running the API

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The server runs on `http://localhost:3000` by default.

---

## Authentication

Every request must include a Bearer token in the `Authorization` header:

```
Authorization: Bearer your-secret-token-here
```

Requests without a valid token will receive a `401 Unauthorized` response.

---

## Endpoints

### `POST /check`

Detects whether a website has an RSS, Atom, or other feed available.

**Request body:** a plain URL string

```bash
curl -X POST http://localhost:3000/check \
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
  "originalUrl": "https://dev.to"
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

Fetches all articles from a single feed URL.

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

**Invalid feed `422`:**

```json
{
  "error": "Impossible de lire ce flux",
  "feedUrl": "https://dev.to/feed"
}
```

---

### `POST /articles`

Fetches articles from multiple feed URLs in a single request. Failed feeds are skipped and reported separately.

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
      "error": "Flux inaccessible ou invalide"
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