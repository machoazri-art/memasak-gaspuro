# AI Assistant setup — Memasak Gaspuro

The game is hosted as a static GitHub Pages site. Keep the OpenAI API key on a server-side Worker; never put it in index.html, browser storage, or GitHub source.

## 1. Create a Cloudflare Worker
1. Cloudflare Dashboard → Workers & Pages → Create → Worker.
2. Deploy the contents of `ai-worker.js` from this repository as the Worker entry point.
3. Worker Settings → Variables and Secrets:
   - Secret `OPENAI_API_KEY`: your OpenAI API key
   - Variable `ALLOWED_ORIGIN`: `https://machoazri-art.github.io`
   - Optional variable `OPENAI_MODEL`: `gpt-6.2-astra`
4. Deploy and copy the Worker URL, e.g. `https://your-worker.your-account.workers.dev`.

## 2. Connect the game
Open Memasak Gaspuro, paste the Worker URL into **AI Assistant Gaspuro**, then tap **Analisis bandar sekarang**. The URL is stored in this browser only; the API key is never sent to the browser.

## What it can inspect
- Game state at request time: cash, level, customers, buildings, staffing, districts, projects, festival status and upgrades.
- A JPEG snapshot of the visible map canvas for visual comments.
- Player questions, with a fresh snapshot on each request.

This is on-demand snapshot analysis, not continuous video monitoring. Each request may incur OpenAI API charges. AI is read-only and cannot spend money or change game state.

## Local testing
Use a deployed HTTPS Worker URL. Do not expose `OPENAI_API_KEY` in browser JavaScript or commit it to this repository.
