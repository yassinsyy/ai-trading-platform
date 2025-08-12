# Runbook – Price Publication Failures

## Symptoms
- Publish job failures >1%, persistent retries, inconsistent prices

## Immediate Actions
1. Enable safe mode: freeze risky SKUs; cap delta
2. Retry with idempotency keys; ensure latest state fetched before update
3. Validate auth tokens and scopes

## Diagnosis
- Diff local vs MP price; check conflicts with manual updates
- Inspect payload schema changes, currency/vat mismatches
- Review MP error codes; check change-frequency limits

## Remediation
- Fix mapping, currency normalization, rounding
- Add preflight checks and optimistic concurrency
- Strengthen idempotency and reconciliation jobs

## Rollback
- Revert to last known stable prices (snapshot)

## Verification
- Success rate >99%, audit trail consistent

## Owner & Escalation
- Backend Lead; escalate to Founder if >2h impact