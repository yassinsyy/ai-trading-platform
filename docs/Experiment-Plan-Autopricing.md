# Experiment Plan – Autopricing (A/B by SKU)

## Hypothesis
Safe Autopricing increases gross profit per SKU without harming customer experience metrics.

## Design
- Randomize SKUs into Control and Treatment (balanced by category/price/velocity)
- Horizon: 6–8 weeks; min 2 seasonality cycles if applicable
- Guardrails in Treatment: margin floor, max delta, max frequency, stock-aware
- Control: current pricing process, no automated changes

## Metrics
- Primary: Added gross profit per SKU (G = Revenue × GrossMargin%)
- Secondary: revenue, units, contribution margin after fees
- Counters: returns, cancelations, publication failures, price volatility, stockouts

## Statistical Plan
- Pre-register metrics and stop rules; use CUPED/CAA to reduce variance
- Power analysis for detectable effect size (back-of-envelope by historical variance)
- Weekly interim looks; do not peek repeatedly without correction

## Execution
- Shadow mode for 1 week to validate proposals without publishing
- Start with 20–30% SKU coverage; ramp to 40–60%
- Manual approve first; then partial autopublish under flags

## Stop/Freeze Conditions
- Publication failure rate >2% for 15 min → freeze & rollback
- Negative uplift beyond threshold for 2 consecutive weeks → pause & review

## Reporting
- Weekly report with cohort breakdown, confidence intervals, and root causes of deltas