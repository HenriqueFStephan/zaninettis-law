# Architecture

```mermaid
flowchart TB
  subgraph Frontend["Angular"]
    Home[Structure selector]
    Practice[Atuação]
    Articles[Artigos]
    Updates[Atualizações]
    Contact[Contato]
    Studio["/studio hidden"]
  end
  subgraph Backend["FastAPI /api/v1"]
    API[services blog news contact review studio]
  end
  subgraph Actions["GitHub Actions"]
    Research["LAW RESEARCH publishes /report"]
    Agent[AI AGENT]
    Hook[DEPLOY BACKEND]
  end
  Frontend --> API
  Studio --> API
  API --> GitHub
  Research --> GitHub
  Agent --> Cursor
  Hook --> Render
  Netlify --> Frontend
  Render --> API
```

News and articles enter a review queue before they are treated as published copy. The law research action publishes the tax and corporate bulletin to `/report`. The `solve` label is only for code changes.
