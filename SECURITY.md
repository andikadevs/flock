# Security Policy

## Supported versions

Only the latest release receives security fixes.

| Version | Supported |
| ------- | --------- |
| 0.x     | Yes       |

## Reporting a vulnerability

Do not report security problems in public issues, discussions, or pull requests.

Report them privately in one of these ways:

- GitHub [private vulnerability reporting](https://github.com/andikadevs/flock/security/advisories/new)
- Email [hello@andikadevs.space](mailto:hello@andikadevs.space)

Include:

- The affected version or commit.
- Steps to reproduce, or a proof of concept.
- The impact you expect, for example a leaked bot token or an authentication bypass.

You can expect an acknowledgement within 3 working days. We will keep you updated while we
work on a fix and credit you in the release notes unless you ask us not to.

## Scope

In scope:

- This repository's code, Docker image, and default configuration.
- Leaks of bot tokens, `TOKEN_ENCRYPTION_KEY`, `OIDC_CLIENT_SECRET`, or session cookies.
- Bypasses of sign-in or the admin allowlist (`ADMIN_EMAILS`, `ADMIN_SUBJECTS`).
- Forged webhook deliveries to `/tg/:botId`.

Out of scope:

- Telegram itself and your identity provider. Report those to their owners.
- Behaviour of custom bot handlers you wrote.
- Findings that need a compromised host or a malicious operator.

## Operator checklist

When you deploy Flock:

- Serve it over HTTPS and set `APP_URL` (and `PUBLIC_URL` for webhooks) to the HTTPS URL.
- Generate `TOKEN_ENCRYPTION_KEY` with `openssl rand -hex 32` and keep it out of version
  control. Losing it makes every stored token unreadable.
- Keep the allowlist small, and prefer `ADMIN_SUBJECTS` with providers that do not send
  `email_verified`.
- Back up `data/flock.sqlite` and protect it like a secret store.
