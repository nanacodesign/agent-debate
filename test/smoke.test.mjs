// Smoke + security tests. Spawns the real server on a test port and exercises
// the HTTP surface, including the CSRF (Origin) and DNS-rebinding (Host) guards.
// No mutating request is allowed to succeed, so the local agent config is never
// written. Run with: npm test
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const serverPath = join(here, "..", "server.js");
const HOST = "127.0.0.1";
const PORT = 4191;
let child;

function request(path, { method = "GET", headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: HOST, port: PORT, path, method, headers }, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    req.end(method === "POST" ? "{}" : undefined);
  });
}

async function waitForServer(timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await request("/api/status");
      if (res.status === 200) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error("server did not start in time");
}

before(async () => {
  child = spawn(process.execPath, [serverPath], {
    cwd: join(here, ".."),
    env: {
      ...process.env,
      AGENT_DEBATE_HOST: HOST,
      AGENT_DEBATE_PORT: String(PORT),
      NANAOS_DESIGN_SYSTEM_PATH: "/tmp/agent-debate-nonexistent-ds",
      BROWSER: "none",
    },
    stdio: "ignore",
  });
  await waitForServer();
});

after(() => {
  if (child) child.kill("SIGKILL");
});

test("GET /api/status returns the agent list", async () => {
  const res = await request("/api/status");
  assert.equal(res.status, 200);
  const data = JSON.parse(res.body);
  assert.ok(Array.isArray(data.agents), "agents should be an array");
});

test("cross-origin POST is rejected (CSRF guard)", async () => {
  const res = await request("/api/agents", {
    method: "POST",
    headers: { Origin: "http://evil.example", "Content-Type": "text/plain" },
  });
  assert.equal(res.status, 403);
});

test("foreign Host header is rejected (DNS-rebinding guard)", async () => {
  const res = await request("/", { headers: { Host: "attacker.example" } });
  assert.equal(res.status, 403);
});

test("same-origin POST passes the guard", async () => {
  // /api/project only validates a path; it performs no writes.
  const res = await request("/api/project", {
    method: "POST",
    headers: { Origin: `http://${HOST}:${PORT}`, "Content-Type": "application/json" },
  });
  assert.notEqual(res.status, 403);
});

test("the built-in theme is served (self-contained UI)", async () => {
  const res = await request("/theme.css");
  assert.equal(res.status, 200);
});
