# VELA One — scroll-dissected 3D showcase

Re-skin for a client in `src/config.js`: brand/product names, palette, all chapter copy + specs, camera, explode gap, motion timings. Set `PORTFOLIO_URL` there and `VITE_MAKE_WEBHOOK_URL` in a `.env` file (see `.env.example`). Deploy on Vercel: import the repo, set Root Directory to `vela-one` (auto-detects Vite: build `npm run build`, output `dist`), add `VITE_MAKE_WEBHOOK_URL` under Environment Variables. No vercel.json needed; the repo-root vercel.json belongs to the portfolio site and is ignored when the root directory is set.
