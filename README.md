# Zaninettis

Portfolio and practice site for a law office in Brazil. This repository follows the same shape as Medi Canopy: an Angular frontend, a FastAPI backend, Netlify for the site, Render for the API, and GitHub Actions for the agent and the backend deploy hook.

Institutional copy is not written yet. The home page is a selector: five page structures and five palettes. The choice is stored in the browser.

## Pages

| Path | Role |
|------|------|
| `/` | Structure and palette selector |
| `/atuacao` | Practice areas (`/api/v1/services`) |
| `/artigos` | Articles (`/api/v1/blog`) |
| `/atualizacoes` | Legal updates (`/api/v1/news`) |
| `/contato` | Contact form (`/api/v1/contact`) |
| `/studio` | Hidden creative overlay. Not in the public nav. |

## Local

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

```powershell
cd frontend
npm install
npm start
```

API: http://localhost:8000/docs  
Site: http://localhost:4200  
Studio: http://localhost:4200/studio (no token on localhost)

## What you still configure

See [docs/DEPLOY.md](docs/DEPLOY.md). Secrets stay out of git. Start from [debt.txt.example](debt.txt.example).
