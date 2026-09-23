# Deployment architecture

## Production model

**Source repository:** private GitHub repository.

**Public surface:** the static website only. The site should contain vetted public-facing resources and metadata; working files and admin/project material remain private.

### Preferred host: Vercel

Connect the private GitHub repository to Vercel and deploy the `main` branch. The current site is static and requires no build command.

### GitHub Pages alternative

GitHub Pages can publish from private repositories only on GitHub plans that support Pages for private repositories. The published site is still public. If the account is on GitHub Free, use Vercel rather than making the source repository public solely for hosting.

## Publication boundary

Never publish PHI, completed assessment protocols, restricted test content, proprietary scoring materials, or copyrighted full-text research PDFs.
