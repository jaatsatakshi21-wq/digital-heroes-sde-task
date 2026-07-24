# digital-heroes-sde-task
Production-grade URL audit API built for the Digital Heroes SDE qualification task, featuring caching, rate limiting, request tracing and automated  CI/CD testing.
# Page Pulse - Production-Grade URL Audit Service

Production-grade URL audit API built for the Digital Heroes SDE qualification task, featuring caching, rate limiting, request tracing, and automated CI/CD testing.

---

## 🚀 Live Demo & Links
- **Live Deployed API:** `https://digital-heroes-sde-task.onrender.com`
- **GitHub Repository:** `https://github.com/jaatsatakshi21-wq/digital-heroes-sde-task`

---

## 🛠️ Key Features
- **URL Audit Service:** Validates URLs, measures response latency, SSL status, and HTTP headers with request timeouts.
- **Configurable In-Memory Caching:** Prevents redundant audit fetches within a configurable TTL window.
- **Rate Limiting & Request Tracing:** Client rate limiting paired with unique `X-Request-ID` headers for structured logging.
- **CI/CD Pipeline:** Automated testing executed on every code push using GitHub Actions.

---

## 📄 API Documentation

### `POST /api/audit`
Performs a comprehensive audit on the provided URL.

**Request Body:**
```json
{
  "url": "[https://example.com](https://example.com)"
}

---

## 🤖 AI Usage Disclosure
I utilized Gemini to assist with initial boilerplate structure, optimal caching logic exploration, and test setup. Following the AI recommendations, I manually refined the concurrency error handling, restructured the rate limiter middleware, and configured the CI pipeline manually.

---

*Built for Digital Heroes Training Task - [digitalheroesco.com](https://digitalheroesco.com)*
