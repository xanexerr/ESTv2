#!/usr/bin/env node
/**
 * Local GitHub Webhook & Manual Deploy Server for ESTv2
 * - Listens on WEBHOOK_PORT (default 9000)
 * - POST /webhook : GitHub push webhook (triggers deploy when pushed/merged to DEPLOY_BRANCH)
 * - POST /deploy  : Manual HTTP deploy trigger
 * - GET  /health  : Server status
 */

import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

// Load .env if present
const envPath = path.join(repoRoot, ".env");
if (fs.existsSync(envPath)) {
  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const PORT = Number(process.env.WEBHOOK_PORT || 9000);
const BRANCH = process.env.DEPLOY_BRANCH || "main";
const SECRET = process.env.WEBHOOK_SECRET || "";
const PLACEHOLDER_SECRET = "change-me-to-a-strong-webhook-secret";

let isDeploying = false;
let pendingDeploy = false;
let lastDeployStatus = "idle";
let lastDeployAt = null;

function verifyGitHubSignature(rawBody, signatureHeader) {
  if (!SECRET || SECRET === PLACEHOLDER_SECRET) {
    return true;
  }
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }
  const expected =
    "sha256=" + crypto.createHmac("sha256", SECRET).update(rawBody).digest("hex");
  const actualBuf = Buffer.from(signatureHeader);
  const expectedBuf = Buffer.from(expected);
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

function triggerDeploy(force = false) {
  if (isDeploying) {
    pendingDeploy = true;
    console.log("[webhook] Deploy already running; queued one follow-up deploy.");
    return;
  }

  isDeploying = true;
  lastDeployStatus = "running";
  lastDeployAt = new Date().toISOString();

  const deployScript = path.join(__dirname, "deploy.ps1");
  const shell = process.platform === "win32" ? "pwsh" : "pwsh";
  const args = ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", deployScript, "-Branch", BRANCH];
  if (force) args.push("-Force");

  console.log(`[webhook] Launching deploy: ${shell} ${args.join(" ")}`);
  const child = spawn(shell, args, { cwd: repoRoot, stdio: "inherit" });

  child.on("close", (code) => {
    isDeploying = false;
    lastDeployStatus = code === 0 ? "success" : `failed (exit ${code})`;
    console.log(`[webhook] Deploy finished with status: ${lastDeployStatus}`);
    if (pendingDeploy) {
      pendingDeploy = false;
      triggerDeploy(false);
    }
  });

  child.on("error", (err) => {
    isDeploying = false;
    lastDeployStatus = `error: ${err.message}`;
    console.error("[webhook] Failed to spawn deploy script:", err);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 2 * 1024 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, {
      status: "ok",
      branch: BRANCH,
      isDeploying,
      lastDeployStatus,
      lastDeployAt,
    });
  }

  if (req.method === "POST" && url.pathname === "/webhook") {
    try {
      const rawBody = await readBody(req);
      const signature = req.headers["x-hub-signature-256"];
      if (!verifyGitHubSignature(rawBody, signature)) {
        return sendJson(res, 401, { ok: false, error: "Invalid webhook signature" });
      }

      const event = req.headers["x-github-event"] || "push";
      if (event === "ping") {
        return sendJson(res, 200, { ok: true, message: "pong" });
      }

      if (event !== "push") {
        return sendJson(res, 200, { ok: true, ignored: true, reason: `event=${event}` });
      }

      const payload = JSON.parse(rawBody.toString("utf8") || "{}");
      const targetRef = `refs/heads/${BRANCH}`;
      if (payload.ref !== targetRef) {
        return sendJson(res, 200, {
          ok: true,
          ignored: true,
          reason: `ref=${payload.ref} !== ${targetRef}`,
        });
      }

      triggerDeploy(false);
      return sendJson(res, 202, { ok: true, message: `Deploy triggered for ${BRANCH}` });
    } catch (err) {
      return sendJson(res, 400, { ok: false, error: err.message });
    }
  }

  if (req.method === "POST" && url.pathname === "/deploy") {
    const provided = req.headers["x-deploy-secret"] || "";
    if (SECRET && SECRET !== PLACEHOLDER_SECRET && provided !== SECRET) {
      return sendJson(res, 401, { ok: false, error: "Invalid X-Deploy-Secret header" });
    }
    triggerDeploy(true);
    return sendJson(res, 202, { ok: true, message: `Manual force deploy triggered for ${BRANCH}` });
  }

  return sendJson(res, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[webhook] ESTv2 Auto-Deploy Webhook listening on http://0.0.0.0:${PORT}`);
  console.log(`[webhook] Target branch: ${BRANCH}`);
  if (!SECRET || SECRET === PLACEHOLDER_SECRET) {
    console.log("[webhook] WARNING: WEBHOOK_SECRET is not customized; signature verification is relaxed.");
  }
});
