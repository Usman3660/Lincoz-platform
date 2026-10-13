# Lincoz Enterprise Platform — Pre-Deployment Security Gate & Runbook

This verification checklist must be passed prior to deploying Lincoz into staging or production.

---

## 1. Secrets & Environment Isolation (Rule 1)
- [ ] `.env` and `.env.*.local` are confirmed excluded by Git (`git status --ignored` verifies exclusion).
- [ ] No API keys, secret hashes, or database connection strings exist anywhere in `apps/web` or frontend client files.
- [ ] Production environment variables are injected securely via the hosting platform dashboard (AWS Parameter Store, Doppler, or Render Environment settings).
- [ ] `.env.example` is committed with all variable keys and empty values for onboarding.

## 2. Network & Boundary Protection (Rules 6 & 7)
- [ ] **CORS**: `ALLOWED_ORIGIN` is explicitly set to the production frontend domain (e.g. `https://app.lincoz.com`). Wildcards (`*`) are strictly prohibited.
- [ ] **HTTPS**: Enforced at the CDN / reverse-proxy layer with HSTS (`max-age=31536000; includeSubDomains; preload`).
- [ ] **Security Headers**: Helmet active with `X-Frame-Options: DENY`, `noSniff: true`, and strict Content Security Policy.
- [ ] **X-Powered-By**: Server header is stripped to conceal framework fingerprinting.

## 3. Rate Limiting Verification (Rule 2)
- [ ] Authentication endpoints (`/api/auth/*`) capped at **5 requests per 15 minutes per IP**.
- [ ] General API routes (`/api/*`) capped at **60 requests per minute per IP**.
- [ ] AI Proxy endpoints (`/api/ai/*`) capped at **10 requests per minute per user**.
- [ ] File uploads (`/api/upload`) capped at **5 requests per minute per IP**.
- [ ] Client receives `429 Too Many Requests` with a valid `Retry-After` header when limits are reached.

## 4. Input Validation & Database Security (Rules 3 & 5)
- [ ] All request payloads pass through server-side Zod schema validation before hitting business logic.
- [ ] Database interactions strictly use Prisma ORM or parameterized queries. String concatenation in queries is strictly zero.
- [ ] Database is in a private VPC and **not exposed to the public internet** (`0.0.0.0/0`).
- [ ] PostgreSQL user operates under least-privilege permissions.
- [ ] Generic error responses are returned to the client (database schema errors and stack traces are suppressed).

## 5. Authentication & Session Hygiene (Rule 4)
- [ ] User passwords are encrypted using `bcrypt` with a minimum cost factor of `12`.
- [ ] Access tokens are short-lived (15 minutes).
- [ ] Refresh tokens are stored strictly in `httpOnly`, `Secure`, `SameSite=Strict` cookies (never in `localStorage`).
- [ ] Account lockout activates automatically after 5 consecutive failed login attempts.
- [ ] Admin actions and financial disbursement routes enforce strict role checks (`SUPER_ADMIN`).

## 6. File Upload Controls (Rule 8)
- [ ] Uploaded files are validated on the server for both MIME type and file extension.
- [ ] File size ceilings enforced: 5MB for images, 25MB for documents.
- [ ] Files are renamed to non-guessable UUIDs upon receipt (client filenames discarded).
- [ ] Storage directory resides outside the web root or on AWS S3 / Cloudflare R2 with non-executable permissions.

## 7. AI & LLM Protection
- [ ] Gemini API key is stored server-side only and never exposed to the browser.
- [ ] User prompts are sanitized to neutralize prompt injection delimiters.
- [ ] Hard token ceilings (`max_tokens: 500`) enforced per request to prevent cost attacks.
- [ ] Daily per-user token quotas are tracked and enforced.
- [ ] AI output is sanitized before rendering to eliminate potential XSS vectors.

## 8. Dependencies & Audit Gate (Rule 10)
- [ ] Dependency versions are pinned in `package.json`.
- [ ] `npm audit --audit-level=high` runs with zero high or critical vulnerabilities.
