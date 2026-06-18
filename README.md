# 🤖 AI Code Review Agent

An automated GitHub PR code reviewer powered by **Groq (Llama 3.3 70B)** and **LangGraph**. It triggers on PR webhooks, parses the diff, runs static analysis via Semgrep, sends everything to the LLM for a structured review, and posts a rich Markdown comment back to the PR.

---

## Architecture

```
GitHub PR webhook
       │
       ▼
  [webhook.js]  ← Express route, signature verification, async dispatch
       │
       ▼
  LangGraph Pipeline:
  ┌─────────────┐    ┌───────────┐    ┌─────────────┐    ┌────────────────┐
  │ extractDiff │───▶│ parseDiff │───▶│ runAnalysis │───▶│ classifyIssues │
  └─────────────┘    └───────────┘    └─────────────┘    └────────────────┘
                                                                  │
                                                                  ▼
  ┌──────────────┐    ┌──────────┐    ┌─────────────────┐    ┌───────────┐
  │ postToGitHub │◀───│ generate │◀───│ aggregateResults│◀───│ llmReview │
  │              │    │  Report  │    └─────────────────┘    └───────────┘
  └──────────────┘    └──────────┘
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Fill in:
- `GITHUB_TOKEN` — GitHub personal access token with `repo` + `pull_request` permissions
- `GROQ_API_KEY` — Get one at https://console.groq.com
- `GITHUB_WEBHOOK_SECRET` — Optional but recommended for security

### 3. Run the server
```bash
npm start        # production
npm run dev      # with nodemon hot-reload
```

### 4. Expose via ngrok (for local development)
```bash
ngrok http 3000
```
Use the ngrok URL as your GitHub webhook URL: `https://your-ngrok-url.ngrok.io/api/webhook`

### 5. Configure GitHub Webhook
In your repo → Settings → Webhooks → Add webhook:
- **Payload URL:** `https://your-server/api/webhook`
- **Content type:** `application/json`
- **Secret:** Your `GITHUB_WEBHOOK_SECRET`
- **Events:** Select "Pull requests"

---

## Testing locally

Test the LLM review without a real PR:
```bash
node src/test-llm.js
```

---

## What the agent reviews

- 🔒 **Security** — SQL injection, XSS, hardcoded secrets, insecure patterns
- 🧠 **Logic** — Off-by-one errors, null checks, error handling
- ⚡ **Performance** — N+1 queries, unnecessary re-renders, memory leaks  
- 🔧 **Maintainability** — Code duplication, naming, complexity
- 🎨 **Style** — Formatting, consistency (informed by language conventions)

## Semgrep (optional)

If `semgrep` is installed, it runs before the LLM for fast pattern-based detection:
```bash
pip install semgrep
```
If not installed, the agent skips static analysis and proceeds with LLM-only review.
