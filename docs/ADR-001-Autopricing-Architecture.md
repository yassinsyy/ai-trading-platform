# ADR-001 – Autopricing Architecture Split (ml-service vs core-api)

## Context
We need a safe, explainable autopricing loop. Our stack includes `ml-service` (FastAPI, Python TS/ML) and `core-api` (NestJS, Prisma, queues, integrations). Marketplaces impose rate limits and strict ToS; we need auditability and quick rollback.

## Decision
- Keep forecasting/optimization in `ml-service` (Python): demand forecasts, elasticity estimation (later), price optimization with guardrails (OR-Tools), rationale generation.
- Keep orchestration/integrations in `core-api` (TypeScript): rules storage, approvals, publication workers (BullMQ), audit logs, RBAC, secrets, rate-limiting.
- FE (`web-app`) consumes `core-api` only; `core-api` calls `ml-service`.

## Rationale
- Python ecosystem fits TS/ML; Node fits integrations, queues, RBAC, and our FE team.
- Separation lets us scale compute-heavy inference independently and keep credentials in one place (core-api).
- Improves blast radius: model issues won’t compromise audit/integrations; vice versa.

## Consequences
- Two deployables and contracts to maintain; add OpenAPI specs and versioning.
- Extra network hop between services; mitigate with caching and batch endpoints.
- Clearer ownership and on-call routing: ML vs Integrations.

## Status
Accepted. Revisit after first 2 pilots.

## Follow-ups
- Publish OpenAPI for `/forecast` and `/price/proposal`.
- Define queue schemas and idempotency keys for publication jobs.
- Add drift monitoring and safe-mode circuit breaker.