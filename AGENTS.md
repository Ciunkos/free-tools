

# Cloud spending policy (2026-10-24)

Indie tools must remain cheap under normal traffic, abuse, errors and abandoned callers.

- Default ceiling: USD 5 per tool per UTC day. Shared account: USD 10/day. Keep stricter product/cycle limits.
- USD 50/day or USD 50/billing cycle is a latched emergency shutdown requiring manual recovery.
- Reserve an upper bound atomically through hamulec's private Budget service before paid work. Unknown prices or unavailable accounting deny paid work. Rate limits are not spending limits.
- Include startup, shutdown, retries, calibration, failed/abandoned requests, models, browsers, storage and background work. Never release uncertain usage. No production bypass flags.
- Return localized 429 + Retry-After + renewal time for budget exhaustion, preserving existing reports, static pages and local features. A skipped scheduled job remains due.
- Containers: hard lifetime <=240 seconds, independent process exit, persistent watchdog, finally destroy and verify stopped. Browser sessions <=60 seconds, explicitly close; do not leave keep-alive sessions.
- Bound input bytes, output tokens, tool/search calls, concurrency, retries, CPU time, persistent writes, retention and logging. Prefer static/local/cached work. Avoid per-request timers keeping Durable Objects alive.
- All cloud providers follow this rule, including external AI APIs. Use provider-enforced quotas or prepaid credit without automatic top-up when available; application gates and delayed billing alerts are not an exact provider invoice guarantee.
- Every deployed service and preview belongs in src/registry.mjs with dependencies, price ceilings and shutdown steps. Deployment must verify the emergency latch and registration.
- Do not deploy unregistered paid work. Raising limits requires an explicit owner instruction. Never clear a fault/emergency latch merely by deploying or at midnight.
- Subscriptions and retained data are reported separately. Do not delete user data or cancel subscriptions during a compute stop-loss.

Incident: two standard-4 containers left running cost approximately USD 5.43/day in provisioned memory/disk. The old hourly cycle-only brake removed routes/crons but did not stop containers. The old runner lacked an independent process lifetime. SDK issue 242 is plausible, not proven. Cloudflare billing emails are informational.

Sources: https://developers.cloudflare.com/containers/platform/pricing/ ; https://developers.cloudflare.com/billing/manage/budget-alerts/ ; https://github.com/cloudflare/containers/issues/242
