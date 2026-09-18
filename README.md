MansionAI is an AI-powered interior-design application built with Next.js, Supabase, Stripe, and configurable AI image-generation providers.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Before running locally, copy `.env.example` to `.env.local` and fill in the services you want to use. `AI_PROVIDER=mock` works without an AI-provider account.

## Quality checks

```bash
npm run lint
npm run test
npm run build
```

The GitHub Actions workflow runs these checks for pull requests and pushes to `main`.

## Production readiness

Production image generation uses Upstash QStash. Copy `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, and `QSTASH_NEXT_SIGNING_KEY` from the QStash dashboard, then set `NEXT_PUBLIC_APP_URL` to the deployed HTTPS URL. The `/api/queue/generate` callback validates the QStash signature before processing and retries failed deliveries up to three times.

Baseline browser security headers are configured in `next.config.ts`. Add a Content Security Policy only after inventorying the final analytics, monitoring, and AI-provider domains, so it protects the app without breaking legitimate traffic.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
