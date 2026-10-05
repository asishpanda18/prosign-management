# SignCRM Pro — Complete Signage Sales CRM

Standalone CRM for signage / branding / printing businesses.

## Modules
- Dashboard and sales KPIs
- Lead management
- Sales pipeline / Kanban
- Customers
- Activities & follow-ups
- Calls, WhatsApp, meetings, site visits, email and payment follow-ups
- Quotations register
- Won / Lost history
- Lead source tracking
- Priority and deal value
- Sales reports and win rate
- JSON backup / restore
- Offline-first local storage

## Explicit separation from Stock
This CRM is intentionally NOT linked to SignStock Pro. It has its own localStorage key and no stock, inventory, purchase, material issue, wastage, job-card or inventory-cost data.

For production multi-user deployment, use a separate Supabase database/project and separate authentication for CRM.
## Publish
Upload index.html, style.css and app.js to a separate GitHub repository, then deploy that repository as a static site on Vercel. No build command is required.
