# Data Specification – Ingestion & Validation

## Datasets & Required Fields
- Orders: orderId, skuId, mp, datetime, price, quantity, fees, discount, promoFlag, status, returnFlag
- Prices: skuId, mp, datetime, price, discount, currency
- Stock: skuId, mp, datetime, onHand, reserved, inboundEta
- Catalog: skuId, brand, category, cost, vat, dimensions, barcodes
- Competitor Prices: skuId (mapped), mp, competitorId, datetime, price, availability
- Promotions/Calendar: holiday flags, promo windows

## Schedules
- Pull frequency: hourly for prices/stock; daily for orders and competitors (phase 1)
- Backfill: 12–24 months history

## Validation Rules (examples)
- Monotonic datetime; no future timestamps >5 min
- Currency normalization; VAT/cost present for pricing SKUs
- Stock non-negative; inboundEta sane
- Deduplicate by (skuId, mp, datetime)

## Storage & Access
- Raw zone (immutable), validated zone, feature tables
- Access via service account; PII minimized; retention 180 days unless contract says otherwise

## Quality KPIs & Alerts
- Freshness SLAs: prices/stock <15 min lag, orders <24h
- Completeness >99%; alert on gaps >1% or spikes in nulls

## Mapping & IDs
- SKU mapping table (aliases across MP), unit conversions, variant handling

## Notes
- Start read-only; escalate privileges only for publishing stage under RBAC.