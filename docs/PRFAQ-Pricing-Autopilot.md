# Press Release – Safe Autopricing for Marketplace Sellers

Date: 2025-08-01

Today, AI Trading announces Safe Autopricing — an AI-driven pricing copilot for marketplace sellers (WB/Ozon/Amazon/eBay) that increases gross margin with strict guardrails. Safe Autopricing continuously forecasts demand, proposes price updates with margin floors and change limits, and lets managers approve or auto-publish with full audit. Early design partners achieved +8–15% gross profit in 8–12 weeks.

Customer quote (draft): “We finally got measurable profit uplift without risking our margins or getting rate-limited by the marketplace. The approve workflow and audit trail gave us confidence to go autopilot on 40% of our SKUs.”

Call to action: Join our design partner program to unlock safe profit growth with your existing catalog and tools.

---

## FAQ

- What problem does it solve?
  - Sellers miss profit by under/overpricing and reacting late to market changes. Manual pricing doesn’t scale across thousands of SKUs and marketplaces.

- What is the product?
  - A pricing copilot that: ingests sales/stock/competitor data → forecasts demand → proposes price updates with guardrails → optional human approve → publishes and measures uplift.

- Why now?
  - Marketplaces expose richer APIs, sellers face tighter margins, and modern TS/ML models (Darts/NeuralForecast/EconML) enable reliable demand and elasticity estimates.

- Who is it for (ICP)?
  - Sellers with 200–3,000 SKUs on WB/Ozon (phase 1), gross margin 15–40%, at least basic data exports or API access.

- What outcomes do customers get?
  - Target +8–15% gross profit uplift within 8–12 weeks on covered SKUs, with strict safety rails and auditability.

- What are the guardrails?
  - Margin floor per SKU/brand, max price change per update, max frequency per SKU/MP, stock-aware logic, promo/holiday awareness, stop-lists, manual overrides, one-click rollback.

- How is uplift measured?
  - A/B by SKU cohorts; primary metric: added gross profit vs control; counter-metrics: cancelations/returns, price volatility, publication failures, complaint rate.

- What does integration look like?
  - Read-only ingestion first (orders, prices/discounts, stock, promo, competitor prices). Then propose-only with human approve. Then autopublish under flags. All actions logged.

- Security & compliance?
  - Least-privilege tokens, secret vaulting, audit logs, PII minimization/retention policy, GDPR/CCPA DSAR procedures, marketplace ToS compliance.

- How do we charge?
  - Option A: 2–5% of added gross profit (success fee). Option B: base fee + success bonus. Pilot discounts for design partners.

- What might go wrong and how do we mitigate?
  - API limits/bans → rate-limiters, backoff, shadow mode. Model drift → drift monitors, safe mode (freeze/limit deltas). Data gaps → validation and fail-closed behavior.

- Timeline for MVP?
  - 8–12 weeks to productionize the basic loop on 2–3 design partners: ingestion → forecast → proposal → approve → publish → audit → uplift report.