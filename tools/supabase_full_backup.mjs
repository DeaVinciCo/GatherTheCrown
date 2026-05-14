#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const out = {
    root: process.cwd(),
    bucket: 'GTC_FULL_BACKUP',
    prefix: `SNAPSHOT_${new Date().toISOString().replace(/[:.]/g, '-')}`,
    uppercase: true,
    includeEverything: false,
    dryRun: false,
    concurrency: 4,
    maxFiles: 0,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--root' && next) out.root = path.resolve(next);
    if (arg === '--bucket' && next) out.bucket = next;
    if (arg === '--prefix' && next) out.prefix = next;
    if (arg === '--uppercase' && next) out.uppercase = next !== 'false';
    if (arg === '--include-everything' && next) out.includeEverything = next === 'true';
    if (arg === '--dry-run' && next) out.dryRun = next === 'true';
    if (arg === '--concurrency' && next) out.concurrency = Math.max(1, Number(next) || 4);
    if (arg === '--max-files' && next) out.maxFiles = Math.max(0, Number(next) || 0);
  }

  return out;
}

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

function readableBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function sanitizeSegment(segment, uppercase) {
  const safe = segment
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  return uppercase ? safe.toUpperCase() : safe;
}

function normalizeRemotePath(prefix, relPath, uppercase) {
  const parts = toPosix(relPath)
    .split('/')
    .filter(Boolean)
    .map((part) => sanitizeSegment(part, uppercase));
  const pfx = sanitizeSegment(prefix, uppercase);
  return [pfx, ...parts].join('/');
}

async function walkFiles(root, includeEverything) {
  const ignoreDirs = includeEverything
    ? new Set(['.git'])
    : new Set([
        '.git',
        'node_modules',
        'dist',
        'build',
        '.next',
        '.turbo',
        '.cache',
        'coverage',
        '.pnpm-store',
      ]);

  const ignoreFileNames = new Set(['Thumbs.db', '.DS_Store']);

  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(currentDir, entry.name);
      const rel = toPosix(path.relative(root, abs));

      if (entry.isDirectory()) {
        if (ignoreDirs.has(entry.name)) continue;
        await walk(abs);
        continue;
      }

      if (!entry.isFile()) continue;
      if (ignoreFileNames.has(entry.name)) continue;

      const stat = await fs.stat(abs);
      files.push({ abs, rel, size: stat.size });
    }
  }

  await walk(root);
  return files;
}

async function ensureBucket(baseUrl, serviceRoleKey, bucket) {
  const endpoint = `${baseUrl}/storage/v1/bucket`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: false,
    }),
  });

  if (res.ok) return;

  const body = await res.text();
  const alreadyExists = res.status === 400 && body.toLowerCase().includes('already');
  if (alreadyExists) return;

  throw new Error(`Failed to ensure bucket ${bucket}. Status ${res.status}. ${body}`);
}

function encodeObjectPath(objectPath) {
  return objectPath
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

async function uploadObject(baseUrl, serviceRoleKey, bucket, objectPath, bytes) {
  const endpoint = `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeObjectPath(objectPath)}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: bytes,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Upload failed for ${objectPath}. Status ${res.status}. ${body}`);
  }
}

async function runPool(items, concurrency, worker) {
  let index = 0;
  const running = new Array(Math.max(1, concurrency)).fill(0).map(async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      await worker(items[current], current);
    }
  });
  await Promise.all(running);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const started = Date.now();
  const files = await walkFiles(args.root, args.includeEverything);
  const selected = args.maxFiles > 0 ? files.slice(0, args.maxFiles) : files;
  const totalBytes = selected.reduce((sum, f) => sum + f.size, 0);

  console.log('--- GTC SUPABASE BACKUP ---');
  console.log(`ROOT: ${args.root}`);
  console.log(`BUCKET: ${args.bucket}`);
  console.log(`PREFIX: ${args.prefix}`);
  console.log(`UPPERCASE REMOTE PATHS: ${args.uppercase}`);
  console.log(`INCLUDE EVERYTHING: ${args.includeEverything}`);
  console.log(`FILES: ${selected.length}`);
  console.log(`TOTAL SIZE: ${readableBytes(totalBytes)}`);

  // Rough time estimate using a conservative 6 MB/s effective throughput.
  const estimatedSeconds = totalBytes / (6 * 1024 * 1024);
  console.log(`EST. UPLOAD TIME: ${Math.max(1, Math.round(estimatedSeconds / 60))} minute(s) + API overhead`);

  const manifest = {
    createdAt: new Date().toISOString(),
    root: args.root,
    bucket: args.bucket,
    prefix: args.prefix,
    uppercaseRemotePaths: args.uppercase,
    includeEverything: args.includeEverything,
    fileCount: selected.length,
    totalBytes,
    files: selected.map((f) => ({
      path: f.rel,
      size: f.size,
      remoteObjectPath: normalizeRemotePath(args.prefix, f.rel, args.uppercase),
    })),
  };

  if (args.dryRun) {
    console.log('DRY RUN COMPLETE (NO UPLOAD PERFORMED).');
    return;
  }

  const localManifestPath = path.join(args.root, `SUPABASE_BACKUP_MANIFEST_${Date.now()}.json`);
  try {
    await fs.writeFile(localManifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`LOCAL MANIFEST: ${localManifestPath}`);
  } catch (error) {
    console.warn('LOCAL MANIFEST WRITE SKIPPED (LIKELY LOW DISK SPACE).');
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for upload.');
  }

  await ensureBucket(supabaseUrl, serviceRoleKey, args.bucket);

  const manifestRemotePath = normalizeRemotePath(args.prefix, path.basename(localManifestPath), args.uppercase);
  await uploadObject(supabaseUrl, serviceRoleKey, args.bucket, manifestRemotePath, Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'));

  let uploaded = 0;
  await runPool(selected, args.concurrency, async (file, idx) => {
    const remotePath = normalizeRemotePath(args.prefix, file.rel, args.uppercase);
    const bytes = await fs.readFile(file.abs);
    await uploadObject(supabaseUrl, serviceRoleKey, args.bucket, remotePath, bytes);
    uploaded += 1;

    if (uploaded % 50 === 0 || idx === selected.length - 1) {
      console.log(`UPLOADED ${uploaded}/${selected.length}`);
    }
  });

  const finished = Date.now();
  console.log(`DONE IN ${Math.round((finished - started) / 1000)}s`);
}

main().catch((error) => {
  console.error('BACKUP FAILED');
  console.error(error?.message || error);
  process.exit(1);
});
