#!/usr/bin/env node
/**
 * gh-api.js — Thin GitHub API wrapper.
 * All credentials are passed via environment variables, never as CLI arguments.
 *
 * Usage:
 *   node gh-api.js <METHOD> <URL> [<JSON_BODY>]
 *
 * Environment variables:
 *   GH_PAT    — PAT used in the "Authorization: Bearer <token>" header.
 *               If empty/unset, no Authorization header is sent
 *               (suitable for unauthenticated calls to public repos on github.com).
 *   GH_ACCEPT — Optional. Overrides the Accept header.
 *               Default: application/vnd.github.v3+json
 *
 * Exit codes:
 *   0  — HTTP response body printed to stdout (may be an error JSON from GitHub)
 *   1  — Usage error or network-level failure
 *
 * Examples:
 *   GH_PAT="$TARGET_PAT" node gh-api.js GET  https://api.github.com/repos/org/repo
 *   GH_PAT="$TARGET_PAT" node gh-api.js POST https://api.github.com/repos/org/repo/pulls '{"title":"…"}'
 *   node gh-api.js GET https://api.github.com/repos/org/repo    # public, no PAT needed
 */

'use strict';

const https = require('https');
const http = require('http');
const { URL } = require('url');
const [,, method, rawUrl, body] = process.argv;

if (!method || !rawUrl) {
  process.stderr.write('Usage: node gh-api.js <METHOD> <URL> [<JSON_BODY>]\n');
  process.exit(1);
}

const pat = process.env.GH_PAT || '';
const accept = process.env.GH_ACCEPT || 'application/vnd.github.v3+json';

let parsed;
try {
  parsed = new URL(rawUrl);
} catch {
  process.stderr.write(`gh-api.js: invalid URL: ${rawUrl}\n`);
  process.exit(1);
}

const headers = {
  'Accept': accept,
  'User-Agent': 'bob-gh-sync/1.0',
};

if (pat) {
  headers['Authorization'] = `Bearer ${pat}`;
}

let bodyBytes;
if (body) {
  bodyBytes = Buffer.from(body, 'utf8');
  headers['Content-Type'] = 'application/json';
  headers['Content-Length'] = bodyBytes.length;
}

const options = {
  hostname: parsed.hostname,
  port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
  path: parsed.pathname + (parsed.search || ''),
  method: method.toUpperCase(),
  headers,
};

const transport = parsed.protocol === 'https:' ? https : http;

const req = transport.request(options, (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    process.stdout.write(Buffer.concat(chunks));
    // Print a trailing newline only if the response doesn't end with one
    const last = chunks[chunks.length - 1];
    if (last && last[last.length - 1] !== 0x0a) {
      process.stdout.write('\n');
    }
    // Exit 0 regardless of HTTP status — caller inspects the JSON body
    process.exit(0);
  });
});

req.on('error', (err) => {
  process.stderr.write(`gh-api.js: request failed: ${err.message}\n`);
  process.exit(1);
});

if (bodyBytes) {
  req.write(bodyBytes);
}

req.end();
