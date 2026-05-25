# Stripe subscription lifecycle

This project supports:

- New subscriptions via Stripe Checkout
- **Upgrades** (immediate, prorated)
- **Downgrades** (scheduled for next billing period)
- **Cancel at period end** and **reactivate**
- **Expiry / renewal notifications** (webhooks + daily cron)
- **Automatic cancel** when Stripe ends the subscription (`customer.subscription.deleted`)

## Setup

### 1. Supabase migration

Run `supabase/subscription-lifecycle.sql` in the Supabase SQL editor.

### 2. Stripe Prices

```bash
# With STRIPE_SECRET_KEY in .env.local
npm run stripe:setup
````

Copy the printed `STRIPE_PRICE_*` values into `.env.local`.

### 3. Environment variables

See `.env.example` for the full list. Required:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_CARE_BASIC`
- `STRIPE_PRICE_CARE_PLUS`
- `STRIPE_PRICE_CARE_PREMIUM`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET` (for `/api/cron/subscription-reminders`)

### 4. Stripe webhooks

**Tables empty?** Webhooks only fill `webhook_events` and `subscription_notifications` when Stripe calls your app. For local dev you must run Stripe CLI (Dashboard webhooks alone are not enough on localhost).

Local:

```bash
stripe listen --forward-to localhost:3000/api/webhooks
```

Copy the CLI `whsec_...` secret into `STRIPE_WEBHOOK_SECRET` in `.env.local`, then restart `npm run dev`.

Health check (after dev server is running):

```bash
curl http://localhost:3000/api/webhooks/health
```

### Pricing table not visible?

1. Restart dev server after changing `.env.local`.
2. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID` must be from the **same** Stripe account (Developers → API keys + Pricing tables).
3. Visit `/plans` while logged out — the table should render for guests.

Enable events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.upcoming`
- `invoice.paid`
- `invoice.payment_failed`

### 5. Stripe Customer Portal (optional)

In Stripe Dashboard → Settings → Billing → Customer portal, enable subscription cancellation and payment method updates.

### 6. Cron reminders

On Vercel, `vercel.json` runs daily at 09:00 UTC.

Manual test:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/subscription-reminders
```

## Plan management (upgrade / downgrade / cancel)

After a subscription is active, users manage it from **Account** or **Plans**:

| Action | Behavior |
|--------|----------|
| **Upgrade** (e.g. Basic → Premium) | Immediate; prorated charge |
| **Downgrade** (e.g. Premium → Basic) | Scheduled for next billing date |
| **Cancel** | Ends at current period end; **Reactivate** undoes cancel before then |

Works for subscriptions started via:

- Custom plan cards (`/api/subscribe`)
- Stripe Pricing Table (linked with `client-reference-id` = Supabase user id)

**Requirements:** User must be logged in; `STRIPE_PRICE_CARE_*` must match the prices in your Stripe Dashboard / pricing table.

## API routes

| Route | Description |
|-------|-------------|
| `POST /api/subscribe` | New subscription (Checkout) |
| `POST /api/subscription/change-plan` | Upgrade or schedule downgrade |
| `POST /api/subscription/cancel` | Cancel at period end |
| `POST /api/subscription/reactivate` | Undo cancel before period end |
| `POST /api/billing-portal` | Stripe Customer Portal |
| `POST /api/webhooks` | Stripe lifecycle sync |
| `GET /api/cron/subscription-reminders` | Daily expiry reminders |
