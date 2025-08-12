# Runbook – Marketplace Rate Limits

## Symptoms
- 429/Too Many Requests; rising latency; backoff headers present

## Immediate Actions
1. Activate per-MP circuit breaker → freeze non-critical updates
2. Reduce concurrency; honor backoff headers
3. Switch to batch updates where available

## Diagnosis
- Check request rates vs MP quotas; identify noisy jobs/SKUs
- Review recent code changes/deploys; correlate with spikes

## Remediation
- Tune global/local rate-limits; add jitter and backoff
- Schedule heavy jobs off-peak; shard queues
- Coordinate with MP if repeated

## Rollback
- One-click freeze of publishing; keep proposals only

## Verification
- Error rate <0.5%, latency normal, backlog draining

## Owner & Escalation
- Integrations Lead; escalate to Founder if >1h impact