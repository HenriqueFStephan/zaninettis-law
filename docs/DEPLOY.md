# Deploy Zaninettis

These steps need your logins. They cannot be completed from the editor.

## 1. GitHub repository

1. Open https://github.com/new
2. Name the repository `zaninettis-law` (or another name, then update `GITHUB_REPO` in `render.yaml` and `debt.txt`).
3. Do not add a README.
4. From this folder:

```powershell
git init
git add .
git commit -m "Initial Zaninettis site structure"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zaninettis-law.git
git push -u origin main
```

Use a Personal Access Token as the GitHub password if Git asks.

## 2. Render (API)

1. https://dashboard.render.com → **New +** → **Blueprint**
2. Select this repository. Render reads `render.yaml`.
3. When asked, fill the values marked `sync: false`:
   - `AUTHOR_EMAIL`
   - `SMTP_USERNAME`, `SMTP_FROM`, `SMTP_PASSWORD`
   - `CONSULTING_NOTIFY_TO`, `RESEARCH_DIGEST_TO`
   - `GITHUB_STUDIO_TOKEN`
   - `STUDIO_ACCESS_TOKEN`
4. Wait for the deploy. Copy the URL, for example `https://zaninettis-api.onrender.com`.
5. Open `https://YOUR-API.onrender.com/health`.
6. Copy **Settings → Deploy Hook** and save it. You will paste it into GitHub in step 4.

If the service name differs from `zaninettis-api`, update the host in `netlify.toml`.

## 3. Netlify (site)

1. https://app.netlify.com → **Add new site** → **Import an existing project** → GitHub.
2. Select this repository. Netlify reads `netlify.toml`.
3. Confirm:

   | Field | Value |
   |-------|-------|
   | Base directory | `frontend` |
   | Build command | `npm ci && npm run build:ci` |
   | Publish directory | `frontend/dist/zaninettis` |

4. Environment variable: `NG_APP_API_URL` = `/api/v1` (already in `netlify.toml`; the browser calls the same origin and Netlify proxies to Render).
5. Deploy, then copy the site URL.
6. Optional: rename the site to `zaninettis`.

`NETLIFY_SITE_ID` from Medi Canopy belongs to that other site. Create this site fresh. Do not reuse that id.

## 4. GitHub Actions secrets

Repo → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Where it comes from |
|--------|---------------------|
| `CURSOR_API_KEY` | https://cursor.com/dashboard?tab=integrations → API keys |
| `RENDER_DEPLOY_HOOK_URL` | Render → zaninettis-api → Settings → Deploy Hook |

`GITHUB_TOKEN` is provided by Actions. Do not create it.

Also install the **Cursor GitHub App** on this repository from the same Cursor integrations tab. Without it, the agent workflows cannot open branches.

## 5. Point the API at the site

Render → zaninettis-api → **Environment** → `FRONTEND_URL` = your Netlify URL, no trailing slash. Save. Render redeploys.

Also set `LIVE` origins: if the Netlify hostname is not `zaninettis.netlify.app`, add it to `LIVE_FRONTEND_ORIGINS` in `backend/app/core/cors.py` or set `CORS_EXTRA_ORIGINS` on Render. Same-origin proxy in `netlify.toml` avoids most CORS issues in production.

## 6. Studio tokens

| Variable | Where | What it is |
|----------|--------|------------|
| `STUDIO_ACCESS_TOKEN` | Render and local `debt.txt` | A password you invent for `/studio` in production. Localhost skips it. |
| `GITHUB_STUDIO_TOKEN` | Render and local `debt.txt` | Fine-grained GitHub PAT. This repo only. **Issues** read/write and **Contents** read/write (snips go to branch `studio-attachments`). |
| `GITHUB_REPO` | Already in `render.yaml` | `owner/zaninettis-law` |

`/studio` files an issue **without** the `solve` label. Add `solve` on GitHub when the agent should implement it.

## 7. Check

- Netlify URL loads the structure selector.
- `/atuacao` lists five practice areas.
- `/studio` opens the note panel on your machine, and asks for the studio token in production.
- Actions → **LAW RESEARCH** can be run by hand after `CURSOR_API_KEY` exists.
- A push that touches `backend/**` calls the Render deploy hook after `RENDER_DEPLOY_HOOK_URL` exists.
