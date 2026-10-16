# Cloudflare readiness plan — Clinical Practice Library

Status: preparation only. Not a statement that Cloudflare zone, analytics, Turnstile, email routing or forms were verified active.

## Current production and change control
- Current public site: https://clinical-practice-library.vercel.app/
- Hosting remains Vercel. Cloudflare can provide DNS, Web Analytics, Turnstile and other edge services without moving the site to Cloudflare Pages.
- PR #14 is development-only. Do not change production DNS, Vercel project domains or Cloudflare SSL/proxy settings from this branch.
- If a custom domain is connected to Cloudflare, inspect DNS records, SSL mode, certificate status, active hostname and Vercel domain verification before changing anything.
- The proposed cohonpractice.com domain has not been purchased as part of this work. Do not assume it exists or is under Cloudflare.

## Web Analytics
- Cloudflare Web Analytics can track an unproxied Vercel hostname through a site-specific beacon, or can inject automatically if a custom hostname is proxied through Cloudflare.
- Avoid installing a duplicate beacon when automatic injection is enabled. Never guess a beacon token; use the actual site token if manual install is necessary.
- Verify behavior separately on the final production hostname and privacy practices for educational/clinical visitors. Do not track form content, student records, identifiers or medical details.
- Official instructions: https://developers.cloudflare.com/web-analytics/get-started/

## Feedback and technical reports (not enabled)
- Route CPL website bug reports to Sophia Korb Cohon, PhD. Separate technical reports from clinical advice requests.
- Reject/avoid attachments containing client/student identifiers and warn visitors not to submit health records or confidential information.
- If a form is added: validate form schema and Turnstile token on the server; use per-IP/server-side rate limiting, size limits, mail routing rules, and data retention rules.
- Cloudflare Turnstile requires server-side Siteverify validation and a non-public secret key. A client widget alone does not protect a form: https://developers.cloudflare.com/turnstile/get-started/
- Keep worker tokens/API keys out of git, HTML, and logs. Use Cloudflare Worker secrets or another platform-managed secret store.
- Do not expose a live submission control until recipient delivery, validation and failure handling have been tested end-to-end.

## Security and rollout QA
1. Confirm which hostnames are actually controlled by the Cloudflare zone.
2. Record current DNS and SSL settings without publishing credentials or exact private records.
3. Prefer preserving Vercel hosting and cert issuance; do not change the DNS authority as a side effect of analytics setup.
4. Check canonical URL, redirect loops, robots, cache settings, and that resource HTML/PDF downloads work after any DNS change.
5. Run existing GitHub Actions site QA and preview smoke checks before and after deployment.
6. Confirm bug reports reach the intended mailbox using a non-sensitive test message before labeling the feature live.

## No action taken
This document stages requirements and precautions only. Cloudflare account-level setup requires authenticated access to the specific zone/dashboard; a website link to Cloudflare is not proof this session has management rights.
