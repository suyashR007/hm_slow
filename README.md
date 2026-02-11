# H&M Fashion & Quality

Static e-commerce-style site (H&M replica). Deployable to **GitHub Pages**.

## Deploy to GitHub Pages

1. **Push this repo to GitHub** (if you haven’t already):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/Hm_fast.git
   git push -u origin main
   ```

2. **Turn on GitHub Pages with Actions**
   - Open the repo on GitHub → **Settings** → **Pages**.
   - Under **Build and deployment**, set **Source** to **GitHub Actions**.

3. **Deploy**
   - Every push to `main` runs the workflow and deploys the site.
   - To deploy once without pushing, go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**.

4. **View the site**
   - After the first successful run: **Settings** → **Pages** → see the URL (e.g. `https://YOUR_USERNAME.github.io/Hm_fast/`).

### What’s included for deployment

- **`.nojekyll`** – Ensures all files are served as static assets (no Jekyll processing).
- **`.github/workflows/deploy-pages.yml`** – Builds and deploys the repo to GitHub Pages on push to `main`.
- **`404.html`** – Custom 404 page that matches the site and links back to home.

No build step is required; the site is served as static HTML/CSS/JS.
