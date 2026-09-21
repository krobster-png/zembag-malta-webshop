# Requirements baseline

## Facts
- The new webshop must be a separate project and repository from Malta Blinds.
- The target market is Malta.
- Required storefront languages: Czech (`cs`), English (`en`), Maltese (`mt`).
- Products should correspond to the Zembag product range, subject to authorization and source verification.
- Admin must support product editing.

## Proposals
- Use PostgreSQL and Prisma.
- Use locale-prefixed URLs and a translation table rather than hard-coded language branches.
- Keep prices and totals authoritative on the server; the browser only displays estimates.
- Model products, variants, localized content, prices, inventory, orders and audit events separately.

## Acceptance criteria for foundation
- Repository has no dependency on the Malta Blinds working tree.
- A product can have localized name/description in all three locales.
- Admin can create/edit/deactivate a product and variant.
- Cart totals are recalculated server-side.
- Unknown locales are rejected or redirected to English.
- Product edits are recorded in an audit log.

## Open decisions
- GitHub repository visibility and exact name.
- Payment provider and currency/tax policy.
- Malta delivery zones, rates and estimated delivery times.
- Product catalogue, media rights, prices and stock source.
- Admin authentication provider and roles.
