# Lead Form Spam Protection

The Carvex lead form uses Netlify Forms instead of a third-party form endpoint.

## Active Controls

- Netlify Forms form detection is enabled for the `lead` form.
- Netlify's verified submissions view is used as the source of accepted leads.
- The form includes `netlify-honeypot="bot-field"` with a hidden `bot-field` input. Netlify rejects submissions where that field is filled.
- The Netlify dashboard confirmed "Extra spam prevention enabled via honeypot field" for the `lead` form on 2026-06-01.
- Notification email is scoped to new submissions from the `lead` form.

## Client-Side Constraints

The form also limits payload size before submission:

- Name: 80 characters
- Phone: 32 characters
- Email: 120 characters
- Listing URL: 500 characters, restricted to `http://` or `https://`
- Location: 120 characters
- Car type/year: 120 characters
- Urgency: 120 characters
- Note: 1200 characters

The listing URL accepts user input like `www.example.com`, normalizes it to `https://www.example.com`, and then validates it as an HTTP(S) URL.

## CAPTCHA Decision

Turnstile or reCAPTCHA is not enabled right now. Netlify's built-in spam filtering plus a confirmed honeypot keeps the form low-friction for legitimate users, which is appropriate unless verified spam submissions become a recurring issue.

If spam gets through, add a stronger challenge such as Turnstile/reCAPTCHA or move submissions behind a server-side validation function.
