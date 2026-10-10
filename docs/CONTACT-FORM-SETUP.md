# Contact form — private deployment checklist

This form is staged, not active for visitors until configured. It is **not a patient portal**.

## Environment (Vercel project settings, encrypted)
- `CONTACT_TO_EMAIL`: private destination inbox (never commit or expose in HTML)
- `CONTACT_FROM_EMAIL`: address on a domain verified with Resend (e.g. `contact@your-verified-domain.tld`)
- `RESEND_API_KEY`: server-only Resend API key
- `TURNSTILE_SITE_KEY`: public Cloudflare Turnstile site key for the project's deployed hostnames
- `TURNSTILE_SECRET_KEY`: server-only Turnstile secret

Use separate Turnstile widgets for distinct hostnames if required. Only enable after securing credentials and verifying the sender domain. No user email address is required in committed code.

## Behavior
1. GET `/api/contact` reports `ready:false` with no secrets until every variable exists.
2. Contact page disables submission while unconfigured; browser never receives the recipient email or provider key.
3. POST requires a signed expiring proof, a short elapsed time, same-site Origin, honeypot check, server-side Turnstile validation, strict field lengths and a no-PHI acknowledgment.
4. Resend sends plain text to the private inbox and sets reply-to to the visitor's supplied address.
5. Errors never echo provider responses, addresses or secrets.

## Required tests before release
- Load `/contact.html` on mobile and desktop and verify keyboard focus / CAPTCHA.
- Confirm unconfigured endpoint cannot send.
- Verify a configured message goes to the intended inbox (including reply-to).
- Test invalid CAPTCHA, early/expired proof, blank fields, honeypot, missing consent and oversize message.
- Confirm successful delivery before promoting/merging.
- Preserve the legacy CPL production deployment until the user approves release.

**Privacy:** Contact requests are email, not encrypted healthcare intake. Visitors should not send PHI or confidential case information. Resend and Cloudflare process data to deliver and protect the form.
