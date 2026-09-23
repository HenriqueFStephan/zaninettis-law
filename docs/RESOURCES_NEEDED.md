# Resources you create

Nothing in this list is stored in git.

| Resource | Used by | Where to put it |
|----------|---------|-----------------|
| GitHub repository | source | github.com/new |
| `CURSOR_API_KEY` | 🔧 AI AGENT and 📚 LAW RESEARCH | GitHub Actions secret |
| Cursor GitHub App | cloud agents | Cursor dashboard → integrations |
| `RENDER_DEPLOY_HOOK_URL` | 🚀 DEPLOY BACKEND | GitHub Actions secret |
| Render service | API | Blueprint from `render.yaml` |
| Netlify site | frontend | Import from GitHub. New site id. |
| `SMTP_*` | intake email | Render env |
| `GITHUB_STUDIO_TOKEN` | `/studio` snips and issues | Render env and local `debt.txt` |
| `STUDIO_ACCESS_TOKEN` | production `/studio` gate | Render env and local `debt.txt` |

## MCP

`.cursor/mcp.json` connects the same two portals as SobralPsico:

- **netlify** — local `@netlify/mcp`, token from `NETLIFY_PERSONAL_ACCESS_TOKEN`
- **render** — `https://mcp.render.com/mcp`, key from `RENDER_API_KEY`

Neither value is committed. Reload Cursor so this project lists them under Agents → Customize → MCPs.

`zaninettis-updates-mcp` and `zaninettis-research-mcp` are still only a plan. Use the GitHub Actions for those jobs.

See `.cursor/mcp/README.md`.
