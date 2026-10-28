*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)*

## What I Built

**Siempre** (*"Some stories deserve to stay"*) is a private, AI-powered digital memorial and living ofrenda inspired by Día de los Muertos and personal remembrance traditions.

### The Interpretation of "Ghost in the Machine"
As Halloween and Día de los Muertos approach on November 1st and 2nd, tradition holds that the boundary between past and present grows thin. But our computers usually treat memory with cold sterility—a folder of JPEGs in the cloud or a detached chat window.

Instead of building another hollow chatbot pretending to channel the dead, I built a tactile, warm, and reverent digital altar where family memories, authentic voices, favorite foods, and heirloom objects remain alive. Every object on the altar has a true story behind it:
- **Tiered Interactive Altar:** A customizable 3-tiered ofrenda adorned with handcrafted golden *cempasúchil* (marigolds), flickering candlelight vigils, papel picado banners, clay cazuelas of mole poblano, sweet pan de muerto, and vintage polaroids.
- **Family Voice Archive:** An in-browser audio recorder and player with interactive timestamped transcripts. Clicking any transcript snippet jumps playback directly to that moment in the original recording.
- **Ethical AI Remembrance Studio:** A local-first narrative weaver powered by open-weight models (Ollama / Llama 3.2 / Gemma). It drafts celebratory, warm tributes grounded *strictly* in user-entered memories—with hard constraints forbidding fabricated quotes, fake stories, or pretending to speak for deceased loved ones.
- **Archive Search & Rediscovery:** Instant keyword search across all altar items, spoken audio transcripts, and memory slips with context highlighting.
- **Complete Preservability:** One-click JSON archive export and print-ready keepsakes (`@media print`) so family memories are never trapped in a proprietary walled garden.

---

## Demo

<!-- REPLACE WITH YOUR DEPLOYED VERCEL URL (e.g. https://siempre.vercel.app) OR VIDEO WALKTHROUGH LINK -->
🔗 **Live Application:** [Deploy link coming soon / Insert your Vercel URL here]

*(Tip: You can test the full interactive experience locally with sample data by running `./start.sh` or launching the pre-seeded "Abuela Elena Rosales" demonstration memorial.)*

---

## Code

{% github https://github.com/Trideep091/siempre %}

Repository: [https://github.com/Trideep091/siempre](https://github.com/Trideep091/siempre)

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, bespoke SVG artwork, and canvas-confetti.
- **Backend:** FastAPI, SQLAlchemy (asyncio), SQLite / aiosqlite, Pydantic v2.
- **Deployment:** Vercel Multi-Service architecture (`vercel.json`), single-command production deployment script (`deploy.sh`), and multi-stage Docker container (`Dockerfile`).

---

## How I Built It

Siempre is engineered entirely around open-source AI, local-first inference, and ethical guardrails:

1. **Open-Weight Language Models via Local Inference (Ollama):**
   - The Remembrance Studio interfaces directly with open-weight models (like `llama3.2:3b`, `gemma2:2b`, or `mistral:7b`) via local Ollama inference (`http://localhost:11434`).
   - The prompt architecture enforces strict **grounding transparency**: users select exactly which altar keepsakes, favorite dishes, and audio stories the model may reference. If a fact isn't in the provided notes, the model is instructed never to invent it.

2. **Open-Source Speech Recognition (`faster-whisper`):**
   - Spoken family stories recorded via the browser MediaRecorder API are transcribed locally using open-source Whisper models.
   - Preserves timestamps for every sentence so listeners can scrub through family recordings interactively.

3. **Graceful Cloud Fallback:**
   - In cloud environments where local hardware inference isn't running (e.g. on serverless Vercel), the application gracefully reports local AI engine status and allows full manual editing, transcript correction, and audio archiving without breaking or throwing errors.

---

## Why Does Open Innovation Matter?

Preserving the memory of someone you love is an inherently sacred, vulnerable human act. Closed-source, commercial AI clouds fundamentally fail this use case:

1. **Privacy & Grief Are Not Training Data:**
   When someone records their grandmother’s voice or uploads personal photos and handwritten notes, they should never have to wonder whether their grief is being scraped to train a trillion-parameter commercial model or monitored by third-party telemetry. Open-source models running locally on the user's computer guarantee that intimate family memories never leave the room.

2. **The "Forever" Test (Longevity):**
   Proprietary APIs shut down, change pricing, deprecate endpoints, or pivot business models. An open-weight model (`llama3.2`, `gemma`, `whisper`) running in an open-source container will still run 10, 20, or 50 years from now. A memory space must be durable enough to outlive cloud startups.

3. **Ethical Guardrails Over Sycophancy:**
   Commercial consumer chatbots are optimized for user retention and engagement, often hallucinating flattering fiction or pretending to channel the deceased. Open innovation allowed me to inspect, control, and strictly enforce the prompt boundaries: AI assists in polishing the prose of the living, but **never puts fabricated words into the mouths of the dead**.

---

## My Agent Session

<!-- Optional: If you saved your agent session with DevRelay, you can embed it here:
{% agent_session <SESSION_ID> %}
Or describe how you built this using Antigravity AI pair programming. -->

*This project was designed, implemented, and deployed with the assistance of Google Antigravity, autonomously scaffolding the full-stack architecture, designing original SVGs, implementing local speech and LLM pipelines, and configuring Vercel multi-service orchestration.*

---

## The Spirit of It

When building the demonstration ofrenda, I created **Abuela Elena Rosales**—a grandmother from Pátzcuaro, Michoacán.

On her altar, you find a steaming clay cazuela of mole poblano, sweet pan de muerto, a vintage polaroid of her courtyard garden, and an audio memo recorded by her grandson Carlos recalling how she used to slip lemon drops into small eager hands while baking.

When you click on her voice recording and hear the gentle courtyard sounds while reading her story, it doesn't feel like an "AI feature"—it feels like opening a cherished wooden keepsake box tucked away in an attic. That is what AI should do: honor what is real, rather than fabricating what is not.

---

## Prize Categories

<!-- Select the categories you qualify for, or remove any that do not apply: -->
- **Best Use of Gemma:** (Configured and tested with open-weight Gemma models via local Ollama inference)
- **Overall Winner:** Hacktoberfest Open-Source AI Challenge: Week 4

