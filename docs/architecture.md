# Architecture

The application is a standalone monolith initially: Next.js handles the web UI and HTTP endpoints, Prisma handles persistence, and PostgreSQL is the production database. Domain services will calculate prices and validate orders on the server.

## Main bounded areas
- Catalog: products, variants, translations, media, active state
- Pricing: price lists, currency, VAT/tax rules, effective dates
- Cart/order: snapshots of product names and prices at order time
- Admin: authentication, permissions, product editing, audit events
- Content: localized legal and marketing pages
