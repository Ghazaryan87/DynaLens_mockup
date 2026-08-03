# DynaLens FAQ

Everything platform teams and partners ask when evaluating DynaLens, general, FinOps, and Assist, in one place.

## General

### 1. What is DynaLens?
A suite of apps that extends Dynatrace with what teams otherwise build by hand: FinOps for DPS cost attribution, forecasting, and optimisation; Assist for plain-English operations backed by an on-prem LLM; and, on the roadmap, Signal, Flow, and Map for incident comms, ITSM automation, and business-service views. Built by YourCompass, a Dynatrace Premier Partner.

### 2. How does DynaLens reduce Dynatrace costs?
FinOps attributes DPS consumption by capability, account, and environment, forecasts spend against your annual commitment with confidence bands, and proposes optimisation actions scored by savings, impact, and effort, several applicable back into your tenant with one click. You see the overrun months before the invoice, and you know exactly which change fixes it.

### 3. Does DynaLens work with Dynatrace SaaS and Dynatrace Managed?
Yes, different apps target different estates. FinOps manages Dynatrace Platform Subscription (DPS) consumption for SaaS tenants; Assist is built for Dynatrace Managed and fully on-prem environments, including air-gapped deployments with a locally hosted LLM.

### 4. We're a Dynatrace partner, can we manage multiple customers?
That's a core design goal. FinOps is multi-tenant from the ground up: customer and environment management, per-account credentials, role-based access, and consolidated forecasting digests across every customer you operate.

### 5. Does our data leave our environment?
Dynatrace access is read-only by default, isolated per customer, and revocable at any time. On-premises deployment offers full feature parity, Assist runs its LLM entirely on your own infrastructure, so nothing reaches external AI services. Data residency options are available to meet regional compliance requirements.

### 6. How is DynaLens licensed?
Each app is licensed as a subscription, with free trial and demo tiers so you can evaluate before committing. Enterprise and partner arrangements, multi-tenant, volume, or bespoke terms, are handled directly with our team.

### 7. How do we get started?
Start a free trial and connect your Dynatrace tenant in minutes, or book a demo and we'll walk through your estate together, whichever suits how your team evaluates.

## FinOps

### 8. How is FinOps priced?
Free trial and demo tiers are available so you can evaluate the product before committing. Beyond that, pricing is arranged per engagement, talk to us for a quote based on your tenant count and DPS spend.

### 9. How long does setup take?
FinOps installs as a native Dynatrace Platform App. A guided onboarding flow authenticates your Dynatrace connection, validates it, and automatically queues the initial data sync, most customers are seeing data within the same day.

### 10. What data access does FinOps need?
Authentication is OAuth2 client-credentials, scoped per account. FinOps reads subscription, cost, and usage data by default; write-back is limited to the specific configuration changes behind an applied "Fix" action, and is gated by permission and safety checks (e.g. confirming a host is offline before switching its monitoring mode).

### 11. Can FinOps manage multiple Dynatrace tenants?
Yes. FinOps is built for teams and partners managing many customers at once, full CRUD customer management, per-account OAuth credentials, and role-based access so each user only sees what they're permitted to.

### 12. What deployment options are available?
FinOps ships as a native Dynatrace Platform App on the frontend, backed by a service you can run via Docker Compose or deploy to Kubernetes, including on-premises and air-gapped environments for regulated customers.

## Assist

### 13. Does any of our data leave our environment?
No. Assist is designed for on-prem deployment: the LLM runs locally on your infrastructure, all persistence is in your own PostgreSQL, and Dynatrace access is read-only. Air-gapped environments are fully supported.

### 14. Teams, web, or both?
Three modes: Microsoft Teams (Entra ID identity), an on-prem web UI (LDAP identity), or hybrid running both at once. Same capabilities behind every surface.

### 15. How is access controlled?
Three roles, viewer, SRE, and admin, assigned from your directory groups (Entra ID or LDAP). Sensitive capabilities like RCA, model switching, and administration are gated per role, and every action is rate-limited and audit-logged.

### 16. How does it deploy?
Docker Compose for a fast on-prem start, with a Helm chart for Kubernetes. Secrets live in HashiCorp Vault, and health, metrics, and OpenTelemetry endpoints are built in for your own monitoring.
