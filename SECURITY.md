# Security Policy

## Supported version

Security fixes are applied to the latest code on `main`, which is the version intended for deployment.

## Reporting a vulnerability

Please do not disclose a suspected vulnerability in a public issue with exploit details, credentials, personal data, or other sensitive information.

Use GitHub's **Report a vulnerability** flow in the repository Security tab when it is available. If private vulnerability reporting is not available, open a public issue titled `Security contact request` **without technical exploit details** so a private contact channel can be established.

A useful report includes:

- the affected route, component, or feature;
- the security impact and realistic attack scenario;
- minimal, non-destructive reproduction steps;
- the environment or commit where the issue was observed;
- suggested remediation, when known.

Do not test against third-party data or accounts you do not own, perform denial-of-service testing, or retain data obtained while validating a report.

## Secrets

No production credentials or secrets should be committed to this repository. Local configuration belongs in ignored `.env` files; `.env.example` files must contain placeholders only.
