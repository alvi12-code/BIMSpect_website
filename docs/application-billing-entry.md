# Marketing-first purchase entry

Primary new customer journey:

`/pricing → Get started / Buy Project → app /purchase/individual or /purchase/project
→ existing signup/sign-in + activation/MFA → organisation → Django → Stripe
→ signed webhook + Celery → internal billing state → app purchase status → app`.

The website owns acquisition, pricing and campaign/contact intent. React owns the
minimal authentication/organisation continuation, read-only activation status and
billing management. Django alone owns Stripe clients, server-selected Prices,
authorization and entitlements. Accounting remains downstream and OFF.

Set PAYMENT_PROVIDER=bimspect, CHECKOUT_ENABLED=true and BIMSPECT_APP_ORIGIN to the
exact trusted HTTPS app origin for a configured application entry. Disabled or
unsafe configuration preserves existing contact/mock behaviour. No Stripe IDs,
amounts, paid states, arbitrary success URLs or secrets travel in the CTA. Enterprise
always says Contact sales and stays in the existing contact flow. Individual is
€59/month; Project is €1,490/project and no longer requires a project before purchase.

Local Docker explicitly permits loopback HTTP with BIMSPECT_LOCAL_SANDBOX=true.
Use the existing isolated local helper with the three public configuration values:

```bash
CHECKOUT_ENABLED=true PAYMENT_PROVIDER=bimspect \
BIMSPECT_APP_ORIGIN=http://localhost:5173 npm run docker:local:up
```

Visit http://localhost:3000/pricing. Production compose and production configuration
are unchanged. The backend has an independent checkout gate, and public marketing
links never activate access. Public signup is currently DEBUG + Stripe TEST only.
The app origin owns its existing session cookies, CSRF and MFA; marketing does not
share cookies or introduce authentication. Signed payment must be reconciled before
Continue to BIMSpect becomes available. Return routes stay at the app origin for
safe authenticated status lookup without cross-site security exceptions.

Existing customers retain /billing for current plan, subscription/paid-through,
assigned/unassigned Project licences, Manage billing and additional purchases.
Portal appears only after an organisation Stripe Customer exists. Project licence
assignment occurs in /project-licences and never adds project membership.

Sandbox exclusive tax behaviour is not production VAT approval. The selected
sandbox still needs an operator-selected tax category before real payment E2E.
Commercial duration, quotas, seats, geography and refund policy require their
separate approvals; no production enablement or deployment is part of this work.
Rollback local marketing links with CHECKOUT_ENABLED=false and rebuild locally.
