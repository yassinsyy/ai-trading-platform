# Runbook – Model Degradation / Drift

## Symptoms
- Uplift drops, forecast error spikes, alerts on drift metrics

## Immediate Actions
1. Switch to baseline model or freeze autopublish
2. Narrow coverage to top-performing cohorts
3. Increase manual approvals temporarily

## Diagnosis
- Inspect data freshness/completeness; schema changes
- Check seasonal effects/promo shifts; feature drift
- Compare recent forecasts vs baseline/backtests

## Remediation
- Retrain with recent windows; recalibrate guardrails
- Add/new features (promo, competitor signals), regularization
- Re-run model selection; A/B new candidate under flags

## Rollback
- Use last stable model checkpoint; reduce delta caps

## Verification
- Uplift back within CI; forecast error normalized

## Owner & Escalation
- ML Lead; escalate to Founder if >1 week unresolved