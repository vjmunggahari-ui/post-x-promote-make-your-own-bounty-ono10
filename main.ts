// post-x-promote-make-your-own-bounty-01 entry (Node 22, standard library only).
// The entry is the X post itself: one post quoting make.fun's make-your-own-bounty
// post (https://x.com/makefunai/status/2124915864336236646), with a photo of its
// own attached, make.fun / @makefunai and the play code in its text.
// POST.json names the post; this program copies it to /output/POST.json, where
// the gate reads it. Nothing this program writes about the post is scored.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand
// in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const src = join(BOT_DIR, 'POST.json');
const raw = readFileSync(src, 'utf8');
let post: unknown;
try {
  post = JSON.parse(raw);
} catch {
  console.error('POST.json does not parse as JSON');
  process.exit(1);
}
const url = (post as { url?: unknown }).url;
if (typeof url !== 'string' || url.length === 0) {
  console.error('POST.json has no url string');
  process.exit(1);
}
// The placeholder is expected until the post goes up: copy it through with a
// warning, and refuse any other malformed address.
const POST_URL_RE = /^https:\/\/(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/\d+$/;
const PLACEHOLDER = 'https://x.com/Munggahari7/status/PLACEHOLDER';
if (url !== PLACEHOLDER && !POST_URL_RE.test(url)) {
  console.error('POST.json url is not an X post address (https://x.com/<handle>/status/<id>)');
  process.exit(1);
}
if (url === PLACEHOLDER) {
  console.error('WARNING: POST.json still holds the placeholder — replace it with the real post address before submit');
}

mkdirSync(OUTPUT_DIR, { recursive: true });
const dest = join(OUTPUT_DIR, 'POST.json');
copyFileSync(src, dest);

// Read-back: the copy must be byte-identical to the source.
const back = readFileSync(dest, 'utf8');
if (back !== raw) {
  console.error('POST.json read-back differs from the source');
  process.exit(1);
}
console.log(`POST.json OK: ${url} -> ${dest}`);
