---
description: How to run a complete E2E User Journey test
---

This workflow executes a full end-to-end test of the MusicDNA application, from landing to soulmate interest.

1. Ensure the development server is running:
```bash
pnpm dev
```

2. (Optional) Install Playwright if not already present:
```bash
npm install -g playwright
```

3. Run the E2E simulation script:
```bash
npx tsx scripts/e2e_journey.ts
```

// turbo
4. Verify the results in the console output or by visiting the Soulmates page.
