# MCP servers

Project config is `.cursor/mcp.json`, the same connection SobralPsico uses.

## Connected portals

### netlify

Local server:

`%LOCALAPPDATA%\netlify-mcp\node_modules\@netlify\mcp\dist\netlify-mcp.js`

Auth: environment variable `NETLIFY_PERSONAL_ACCESS_TOKEN`. The token is not stored in this repo.

### render

Remote server: `https://mcp.render.com/mcp`

Auth: environment variable `RENDER_API_KEY` sent as `Authorization: Bearer …`. The key is not stored in this repo.

Reload this Cursor window after the file is added so both servers show under **Agents → Customize → MCPs** for Zaninettis Law.

## Still a plan, not a server

These two were designed in Medi Canopy and are not installed:

- `zaninettis-updates-mcp` — search and review legal updates
- `zaninettis-research-mcp` — on-demand research for a branch of law

Until they exist, use GitHub Actions: **LAW RESEARCH** and **AI AGENT**.
