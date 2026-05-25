# Why `webhook_events` and `subscription_notifications` are empty

These tables are **not** filled when you click Subscribe. They are filled only when **Stripe sends events to your app** at `/api/webhooks` and the handler succeeds.

```
Subscribe button → Stripe Checkout → payment succeeds
       → Stripe sends webhook POST → your Next.js /api/webhooks
       → inserts webhook_events + updates product_subscriptions
       → may insert subscription_notifications
```

If checkout never completes (e.g. "No such price" error), **no webhooks are sent** → tables stay empty.

---

## Local development (required)

Stripe cannot reach `http://localhost:3000` from the internet unless you use **Stripe CLI**.

### Step 1 — Terminal 1: Next.js

```bash
npm run dev
```

### Step 2 — Terminal 2: Forward webhooks

```bash
npm run stripe:listen
```

You will see something like:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxx (^C to quit)
```

### Step 3 — Update `.env.local`

Copy **that** `whsec_...` value into:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
```

**Important:** The secret from Stripe Dashboard → Webhooks is **different** from the CLI secret. For local dev, use the **CLI** secret.

Restart `npm run dev` after changing `.env.local`.

### Step 4 — Complete a test subscription

1. Log in on your site.
2. Subscribe to a plan (complete Stripe Checkout with test card `4242 4242 4242 4242`).
3. Watch Terminal 2 — you should see events like `checkout.session.completed`.

### Step 5 — Check Supabase

| Table | When you should see rows |
|-------|-------------------------|
| `webhook_events` | After **any** webhook is processed successfully |
| `product_subscriptions` | After `checkout.session.completed` |
| `subscription_notifications` | After checkout, cancel, renewal reminders, etc. |

---

## Health check

```bash
curl http://localhost:3000/api/webhooks/health
```

All checks should be `"ok"`.

---

## Production (deployed site)

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://your-domain.com/api/webhooks`
3. Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`, `invoice.upcoming`
4. Copy the endpoint **Signing secret** → `STRIPE_WEBHOOK_SECRET` in production env (not the CLI secret).

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|--------|-----|
| Both tables always empty | `stripe listen` not running | Run `npm run stripe:listen` |
| CLI shows `400` signature error | Wrong `STRIPE_WEBHOOK_SECRET` | Use `whsec` from CLI output |
| `webhook_events` empty but subscription row exists | Handler error before `markWebhookProcessed` | Check terminal for `[webhook] ... failed` |
| Subscribe fails before Checkout | Invalid `STRIPE_PRICE_*` | Run `npm run stripe:setup`, update `.env.local` |
