# Two-Week Execution Checklist

## Strategy & Partners
- [ ] Fix ICP and primary marketplace (WB or Ozon)
- [ ] Sign NDA/DPA with 2–3 design partners
- [ ] Agree data scope and export schedules

## Product Docs
- [ ] PR-FAQ (this repo)
- [ ] PRD one-pager
- [ ] SoW for pilot signed by partners

## Tech – ml-service
- [ ] /forecast endpoint (baseline: Darts/Prophet)
- [ ] /price/proposal with guardrails (margin floor, delta, frequency)
- [ ] Unit tests and drift monitor stub

## Tech – core-api
- [ ] Entities: PriceRule, PriceProposal, PriceChange, AuditLog
- [ ] Approve/publish endpoints; BullMQ jobs; idempotency
- [ ] Metrics & alerts: publication success, latency, backlog

## Tech – web-app
- [ ] Pricing Proposals screen (list → diff → approve → publish)
- [ ] Uplift dashboard (weekly, by cohort/SKU)

## Security & Ops
- [ ] RBAC, secret vaulting, token scopes per MP
- [ ] Structured logs, dashboards, alert policies
- [ ] Runbooks for rate-limit, publication failures, model degradation

## Go/No-Go
- [ ] Shadow mode dry-run 1 week
- [ ] Pilot start with 20–30% SKU coverage