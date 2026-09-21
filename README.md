# Zembag Malta Webshop

Standalone multilingual webshop for Zembag products sold in Malta. This repository is intentionally independent from the legacy Malta Blinds project.

## Scope
- Customer storefront, cart and checkout
- Czech, English and Maltese language switching
- Server-authoritative pricing
- Product, variant, stock, translation and order management
- Admin product editing
- Audit trail and role-based administration

## Initial architecture proposal
- Next.js + TypeScript frontend/backend
- PostgreSQL + Prisma
- Server-side price calculation
- Locale-prefixed routes: `/cs`, `/en`, `/mt`

## Status
Discovery and foundation. Product facts, prices, payment provider, delivery rules and legal content require verification before production.
