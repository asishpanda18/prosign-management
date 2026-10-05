# SignStock Pro — Signage Workshop Stock Management

A pro-level offline-first inventory MVP designed specifically for signage / LED / digital-printing workshops.

## Core modules
- Item master with SKU, category, unit, rack/bin, reorder level and cost
- Stock ledger: IN, OUT, RETURN and ADJUSTMENT
- Job cards with planned / issued / returned / wastage quantities
- Wastage & scrap register tied to job cards and reasons
- Purchases / GRN with weighted average cost
- Suppliers
- Dashboard, stock health and reports
- CSV export
- Full JSON backup/restore
- Local browser storage

## Important
This version is intentionally standalone and uses browser localStorage. For multi-user production use, move the database/authentication to Supabase/PostgreSQL and add role-based access.

## Publish
Upload the four files to a GitHub repository and deploy the repository on Vercel as a static site. No build command is required.
