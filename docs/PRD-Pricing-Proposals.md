# PRD – Pricing Proposals MVP

## Goal
Ship a safe, auditable pricing loop that delivers measurable gross profit uplift on WB/Ozon sellers within 8–12 weeks.

## Success Metrics
- Primary: Added gross profit vs control cohort (+8–15% target) on covered SKUs
- Secondary: Coverage of SKUs under proposals (>40% by week 6), publication success rate (>99%), proposal approval turnaround (<24h)
- Counter-metrics: complaints, return rate, stockouts triggered by price changes

## Scope (In)
- Data ingestion (orders, prices/discounts, stock, promo, competitor prices)
- Demand forecast baseline (Darts or Prophet)
- Price proposal service with guardrails (margin floor, delta cap, frequency cap)
- Approve/publish workflow and full audit trail
- Uplift measurement dashboard

## Scope (Out)
- Advanced elasticity and causal inference (phase 2)
- Automated purchase orders (phase 2)
- Cross-marketplace arbitrage (phase 2)

## Users & Stories
- Pricing Manager: “See proposals, compare to current, approve or reject, batch apply.”
- Ops Lead: “See audit trail and publication health; freeze or rollback quickly.”
- Owner: “View weekly uplift report and ROI by cohort and SKU.”

## Flows
1) Ingest → Forecast → Proposal → Approve → Publish → Measure → Iterate
2) Incident flow: Detect anomaly → Auto-freeze or alert → Rollback → Root cause → Fix

## API Contracts (draft)
- ml-service
  - POST /v1/forecast: { skuId, series[], horizon } → { forecast[] }
  - POST /v1/price/proposal: { skuId, forecast[], constraints } → { proposedPrice, rationale }
- core-api
  - POST /v1/pricing/proposals: create batch from ml output
  - POST /v1/pricing/proposals/:id/approve | /publish | /reject
  - GET /v1/pricing/audit?skuId=…

## Data Model (core-api, draft)
- Sku(id, mp, identifiers, brand, cost, minMargin)
- PriceRule(id, scope, minMargin, maxDelta, maxFreq, stopList)
- PriceProposal(id, skuId, proposedPrice, source, status, createdBy, metadata)
- PriceChange(id, skuId, oldPrice, newPrice, publishedAt, jobId, result)
- AuditLog(id, actor, action, entity, diff, timestamp)

## Non-Functional
- SLOs: publish job success >99%, p95 latency < 3s; proposal API p95 < 500ms (cached), queues drained < 2m
- Security: RBAC, secrets vaulting, audit; rate-limits per MP
- Observability: structured logs, metrics, alerts on failures/drift

## Risks & Mitigations
- API limits/bans → rate-limiters, backoff, shadow mode
- Data quality gaps → validation, fail-closed, alerts
- Model drift → drift monitors, safe mode freeze, weekly recalibration

## Milestones
- W2: ingestion + baseline forecast
- W3–4: proposals + guardrails + FE approve screen
- W5: publish + audit + uplift calc
- W6–8: stabilize, increase coverage, first case study