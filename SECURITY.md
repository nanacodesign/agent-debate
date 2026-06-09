# Security

## Supported Versions

Security fixes target the current `main` branch.

## Reporting a Vulnerability

Please open a GitHub security advisory or email the maintainer privately if a repository contact is listed. Do not include private API keys, shell tokens, or sensitive transcripts in public issues.

## Local Command Execution

Agent Debate is a local app that executes CLI commands configured by the user. Treat agent definitions like shell commands:

- Only run CLIs you trust.
- Review `agent-debate.config.json` before using a shared config.
- Keep the default host as `127.0.0.1` unless you intentionally want network access.
- Do not paste secrets into debate topics or context unless you are comfortable sending them to every enabled agent CLI.

The app does not store API keys and does not call provider SDKs directly.

The bundled default agent definitions run in read-only, plan-style modes (Codex `-s read-only`, Claude `--permission-mode plan`, Gemini `--approval-mode plan`) so a debate reasons about your project without editing files or running tools. If you customize agent arguments, you own those permissions.

## Network Exposure

Because agent definitions run as local shell commands, anyone who can reach the server and send requests can effectively run code on the host. The app reduces that risk in a few ways:

- It binds to `127.0.0.1` by default. Setting `AGENT_DEBATE_HOST` to `0.0.0.0` or a LAN address exposes an unauthenticated, code-executing endpoint to everyone on that network. Only do this on a network you fully trust.
- State-changing API requests are rejected unless their `Origin` matches the local UI, which blocks cross-site (CSRF) requests from web pages you happen to visit while the server is running.
- Requests that arrive with a non-IP `Host` header are rejected to mitigate DNS-rebinding attacks against the local server.
