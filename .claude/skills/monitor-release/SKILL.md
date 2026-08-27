---
name: monitor-release
description: Monitor production systems after a release deployment. Use PROACTIVELY whenever the user says they just pushed, merged, deployed, or released code. Also use when the user asks to "monitor production," "check if the release is healthy," "watch the deploy," or anything related to post-deployment verification. Even casual mentions like "just shipped it" or "it's live" should trigger this skill.
---

# Post-Release Production Monitor

Watch a deploy through to health confirmation. Fast, sequential, backend-focused. No parallel agents, no long waits.

## Thinking Budget

**Keep thinking light.** Do NOT ultrathink. Do NOT do deep multi-step analysis unless a real failure appears. This skill is about tight polling loops and reporting, not investigation. Only spend thinking tokens when a workflow actually fails or a Sentry issue actually fires — then think hard about that specific problem.

## Scope — What We Actually Care About

**Only these services matter:**
- `Build, Migrate & Deploy Django` — the main Django backend
- `Build & Deploy WebhookReceiver` — Go webhook receiver
- `Build & Deploy BolProcessStatus` — Go bol process status service
- Any other Go microservice workflow under `services/`

**Explicitly ignore:**
- Frontend workflows (`Build & Deploy Frontend`, Nuxt, apps/frontend)
- Docs workflows (apps/docs, apps/www)
- WordPress plugin workflows
- Marketing site workflows

If the user just pushed and one of these ignored workflows is running, do not wait for it and do not report on it.

## Execution Flow — Sequential, Not Parallel

Do NOT dispatch parallel subagents. Do NOT run all phases at once. The whole point is to react the moment the backend is live, so the flow is strictly sequential:

1. **Poll GH Actions** until the relevant backend/Go workflows finish.
2. **The instant the Django workflow completes successfully**, immediately start checking Sentry. Do not wait. Do not batch with other workflows.
3. **Report incrementally** — one line when a workflow finishes, one line when Sentry is checked, one line on completion.

### Phase 1: Watch GH Actions (tight poll)

```bash
rtk gh run list --repo digitxbv/Floynk --limit 15
```

Identify the in-progress runs for the workflows in scope above. For each, note the run ID.

**Polling cadence:** every 15-20 seconds. Not 3 minutes. Not 5 minutes. A deploy finishing is the trigger for Sentry checks — you cannot afford to miss it by minutes.

```bash
rtk gh run view <run-id> --repo digitxbv/Floynk
```

Use `--json status,conclusion` if you want to parse it:

```bash
rtk gh run view <run-id> --repo digitxbv/Floynk --json status,conclusion
```

**The moment Django completes successfully → jump to Phase 2 immediately.** Do not wait for the Go services to also finish. Kick off Sentry checks for the backend right away, then come back and watch the Go workflows.

**If any in-scope workflow fails:** stop polling, pull `gh run view <run-id> --log-failed`, and report the real error. Use thinking here — this is where analysis matters.

### Phase 2: Sentry (triggered immediately when Django is done)

As soon as the Django workflow conclusion is `success`:

- Use the SENTRY CLI. **Snapshot a baseline first, then diff — do not rely on `firstSeen` alone.**

**Why not `firstSeen`:** `firstSeen:-Nm` only catches brand-new issue *groups*. A deploy regression very often re-increments an issue Sentry has seen before (old `firstSeen`), so a `firstSeen` filter misses it completely. And a short window (`firstSeen:-2m`) on a slower poll drops issues that land in the gap between polls. Both bit a real incident (a `ShopifyGraphQLError` on the order path fired 6 events and was reported "clean").

**Baseline-diff method (do this):**
1. At deploy-complete, snapshot the project's current unresolved issues as `shortId -> count`:
   ```bash
   sentry issue list floynk --query "is:unresolved" --json --fields shortId,count,title -n 100 > /tmp/sentry_baseline.json
   ```
2. On each check, re-list the same and flag any issue where **shortId is new** OR **count increased** vs the baseline. This catches new groups AND regressions/spikes on existing groups, with no time-window boundary to fall through.
3. Also enumerate anything active recently as a backstop: `--query "is:unresolved lastSeen:-15m"` (a wide, overlapping window — never a 2-minute one).

Report per flagged issue: shortId, title, delta (new / +N events), culprit, URL. Flag anything hitting order/stock/repricer flows as urgent.

Repeat the same pass the moment each Go microservice workflow finishes — focused on its own project in Sentry.

### Phase 3: (optional) Loki spot check

Only if the user specifically asks for logs, or if Sentry shows something that needs log correlation. Do NOT run Loki queries by default — Sentry already surfaces production errors and Loki queries are slow.

If needed, use the `gcx` CLI (not an MCP server; `rtk`-prefixed like every other shell command):

```bash
rtk gcx logs query --expr '{environment="production"} |~ "ERROR|Traceback|Exception"' --since 10m --limit 30 -o table
```

Group similar lines, don't dump raw stack traces. See the `loki-usage` skill for the full query reference.

## Continuous Monitoring Window

After the initial deploy-complete + Sentry check:

- Keep watching Sentry for another **10 minutes**, re-running the baseline-diff from Phase 2 every ~2 minutes (new shortId OR count increased vs the deploy-time baseline). Never use `firstSeen:-2m` — it misses regressions on existing issues and drops issues in the poll gap.
- Stay silent if nothing new appears. Do not re-emit "all clear" reports.
- Speak up immediately on: new issue, spiking existing issue (count up vs baseline), a late-arriving workflow failure.
- After 10 clean minutes, emit one final line: `Production stable after 10 minutes. Stopping monitor.` and stop.

Do NOT use `/loop 3m /monitor-release` — that re-runs the whole skill from scratch every 3 minutes and wastes context. Just keep the current session polling directly.

## Reporting Style

Terse. Incremental. One line per event. No tables, no headings for an all-clear.

Examples of good reports:

```
Django deploy running (run 12345678)... polling every 20s
Django deploy succeeded (2m14s). Checking Sentry now.
Sentry: 0 new issues, 0 spiking. Backend clean.
Repricer deploy succeeded. Sentry for repricer project: clean.
WebhookReceiver deploy succeeded. Sentry: clean.
Production stable after 10 minutes. Stopping monitor.
```

Examples of bad reports:

```
## Release Health Check
### GitHub Actions: OK
- Workflow X: success
- Workflow Y: success
...
```

Only use a structured report if something is actually wrong and the user needs to see a breakdown.

## When Something Fails

This is the only place to spend real thinking budget:

1. **Workflow failure** — `gh run view <id> --log-failed`, read the actual error, distinguish flaky/transient from real code problems. Reference the commit that was just deployed.
2. **New Sentry issue** — check if the stack trace points into code from the deployed commit. If yes, this is a release regression — flag as urgent.
3. **Spiking existing issue** — note it but don't panic unless it's on order/stock/repricer paths.

Never say "it's fine" if you haven't actually verified. Never say "it's broken" without pulling the real error.
