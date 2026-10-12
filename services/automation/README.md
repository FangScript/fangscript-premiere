# Automation service

Independently built and deployed. Owns its database and migrations. No imports from sibling services.

Run: npm install; npm run migrate; npm start. Tests: npm test. Configuration: DATABASE_URL, JWT_SECRET, INTERNAL_TOKEN, REDIS_URL, NATS_URL, PORT.

HTTP contract: /api/v1/automation; health: /health/live and /health/ready. Events: fangscript.automation.*.v1.

Records: workflows, runs. Update requests require the current version to prevent lost writes.
