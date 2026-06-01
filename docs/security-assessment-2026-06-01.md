# Security Assessment - 2026-06-01

Scope: deployed `https://carvex.hu`, `https://www.carvex.hu`, repository source, and Netlify Forms lead flow after the domain, Netlify Forms migration, and spam controls were deployed.

## Result

No critical launch blockers found.

The previous FormSubmit exposure is resolved. The deployed lead form no longer references FormSubmit and posts through Netlify Forms.

The previous missing anti-abuse control is resolved. Netlify Forms detects the `lead` form, the Netlify dashboard shows "Extra spam prevention enabled via honeypot field", and verified submissions are recorded in Netlify Forms.

## Verified Controls

- Production deploy includes `main@47ffa22` lead-form hardening.
- `https://carvex.hu/` returns HTTP 200 over HTTPS.
- `https://www.carvex.hu/` redirects to `https://carvex.hu/`.
- `http://carvex.hu/` redirects to `https://carvex.hu/`.
- `http://www.carvex.hu/` reaches the canonical apex host through HTTPS.
- TLS certificate is issued by Let's Encrypt and covers `carvex.hu` and `www.carvex.hu`.
- HSTS is enabled: `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
- Deployed security headers include:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- A live Netlify Forms POST returned the thank-you page and appeared in Netlify Forms as a verified submission.
- Repository scan found no secrets, FormSubmit references, unsafe JavaScript sinks, third-party script tags, or storage usage.

## Findings

### Medium - Privacy notice should name the deployed form processing flow

The privacy page already covers quote requests and the submitted data categories, but it still describes the site as using an email-link flow. The deployed site now collects lead data through a Netlify-hosted form.

Recommended fix: update `adatkezelesi-tajekoztato.html` to mention the website form and Netlify/hosting provider processing in plain Hungarian legal copy.

### Low - CSP / `frame-ancestors` header is not configured

The site has `X-Frame-Options: DENY`, but no `Content-Security-Policy` header. A CSP would provide stronger browser-side hardening, including modern `frame-ancestors` coverage.

Recommended fix: add a conservative CSP in `_headers`, accounting for same-origin assets, inline styles/scripts currently embedded in static HTML, Google Fonts, image data URLs, and Netlify Forms POST behavior.

### Informational - HSTS is enabled but not preload-ready by policy

The deployed HSTS header uses a one-year max age and includes subdomains. It does not include `preload`.

Recommended fix: only add `preload` after confirming all current and future subdomains are HTTPS-only and intended for preload submission.

## Follow-Up Issues

- Add a CSP header for the static site.
- Update privacy notice for Netlify Forms processing.
