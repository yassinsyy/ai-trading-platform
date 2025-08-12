# Risk Register

| ID | Risk | Likelihood | Impact | Owner | Mitigation | Status |
|---|---|---|---|---|---|---|
| R1 | Marketplace rate-limit/ban during price updates | Medium | High | Integrations Lead | Global/local rate-limits, backoff, shadow mode, dry-runs, ToS review | Open |
| R2 | Data quality gaps (missing/late sales/stock) | Medium | High | Data Lead | Ingestion validation, Great Expectations checks, alerts, fail-closed | Open |
| R3 | Model drift reduces uplift | Medium | Medium | ML Lead | Drift monitors, weekly retrain, safe mode (freeze/delta cap), AB guardrails | Open |
| R4 | Margin erosion due to incorrect constraints | Low | High | Product | Margin floor, per-SKU rules, approval threshold, rollback | Open |
| R5 | Security incident (token leak) | Low | High | Security | Secret vaulting, least privilege, rotation, audit, access reviews | Open |
| R6 | Legal/ToS violation | Low | High | Legal | ToS audit, rate-limit compliance, feature flags by MP/region | Open |
| R7 | Single design partner dependency | Medium | Medium | Founder | 2–3 partners in parallel, explicit SoW, data escrow | Open |
| R8 | Publication job backlog/latency | Medium | Medium | Backend Lead | Queue autoscaling, SLOs, alerts, idempotency, retries | Open |
| R9 | Mis-measured uplift | Medium | Medium | Analytics | Pre-registered AB design, CUPED/CAA, counter-metrics | Open |

Notes: Update weekly; link incidents and post-mortems to affected risks.