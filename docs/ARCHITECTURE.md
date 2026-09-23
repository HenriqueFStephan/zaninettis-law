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
    Research[LAW RESEARCH on demand]
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

News and articles enter a review queue before they are treated as published copy. The on-demand research action opens an issue labeled `law-research`. A `[POST]` comment publishes one item. The `solve` label is only for code changes.
