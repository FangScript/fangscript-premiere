# CRM service

Independently built and deployed. Owns its database and migrations. No imports from sibling services.

Run: npm install; npm run migrate; npm start. Tests: npm test. Configuration: DATABASE_URL, JWT_SECRET, INTERNAL_TOKEN, REDIS_URL, NATS_URL, PORT.

HTTP contract: /api/v1/crm; health: /health/live and /health/ready. Events: fangscript.crm.*.v1.

Records: contacts, companies, deals, activities. Update requests require the current version to prevent lost writes.
