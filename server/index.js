import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.CAMPAIGN_PACKET_PORT || 45880);
const DATA_ROOT = process.env.CAMPAIGN_PACKET_DATA_ROOT || '/home/toby/ad-campaigns';
const APP_ROOT = path.resolve(__dirname, '..');
const DIST = path.join(APP_ROOT, 'dist');

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const SECTIONS = ['brief','ad-copy','creative','landing-page','ghl-wiring','launch-checklist','results'];
const FILES = {
  'brief': 'brief.md',
  'ad-copy': 'ad-copy.md',
  'creative': 'creative.md',
  'landing-page': 'landing-page-spec.md',
  'ghl-wiring': 'ghl-webhook-spec.md',
  'launch-checklist': 'launch-checklist.md',
  'results': 'results.md'
};

function safeSegment(s) {
  if (!s || !/^[a-zA-Z0-9._-]+$/.test(s) || s.includes('..')) throw new Error('Invalid path segment');
  return s;
}
function campaignDir(business, campaign) {
  return path.join(DATA_ROOT, safeSegment(business), safeSegment(campaign));
}
async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}
async function readText(p, fallback='') {
  try { return await fs.readFile(p, 'utf8'); } catch { return fallback; }
}
async function writeText(p, value) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, value ?? '', 'utf8');
}

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, dataRoot: DATA_ROOT, port: PORT });
});

app.get('/api/campaigns', async (_req, res) => {
  const out = [];
  if (!(await exists(DATA_ROOT))) return res.json({ campaigns: out, dataRoot: DATA_ROOT });
  const businesses = await fs.readdir(DATA_ROOT, { withFileTypes: true });
  for (const b of businesses.filter(d => d.isDirectory())) {
    const bdir = path.join(DATA_ROOT, b.name);
    const campaigns = await fs.readdir(bdir, { withFileTypes: true }).catch(() => []);
    for (const c of campaigns.filter(d => d.isDirectory())) {
      const dir = path.join(bdir, c.name);
      const metaPath = path.join(dir, 'campaign.json');
      const meta = JSON.parse(await readText(metaPath, '{}') || '{}');
      out.push({ business: b.name, campaign: c.name, path: dir, ...meta });
    }
  }
  out.sort((a,b) => String(a.campaign).localeCompare(String(b.campaign)));
  res.json({ campaigns: out, dataRoot: DATA_ROOT });
});

app.get('/api/campaigns/:business/:campaign', async (req, res) => {
  try {
    const dir = campaignDir(req.params.business, req.params.campaign);
    const meta = JSON.parse(await readText(path.join(dir, 'campaign.json'), '{}') || '{}');
    const sections = {};
    for (const key of SECTIONS) sections[key] = await readText(path.join(dir, FILES[key]));
    res.json({ business: req.params.business, campaign: req.params.campaign, path: dir, meta, sections, files: FILES });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/campaigns/:business/:campaign/:section', async (req, res) => {
  try {
    const section = req.params.section;
    if (!SECTIONS.includes(section)) throw new Error('Unknown section');
    const dir = campaignDir(req.params.business, req.params.campaign);
    await writeText(path.join(dir, FILES[section]), req.body.content ?? '');
    res.json({ ok: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/campaigns/:business/:campaign/generate', async (req, res) => {
  try {
    const dir = campaignDir(req.params.business, req.params.campaign);
    await fs.mkdir(dir, { recursive: true });
    const meta = req.body.meta || {};
    await writeText(path.join(dir, 'campaign.json'), JSON.stringify({
      businessName: meta.businessName || 'Relax Remodel Consulting',
      positioning: 'Homeowner advisor — not a contractor',
      service: meta.service || 'Bathroom project advisory',
      offer: meta.offer || 'Free project review / honest advice before you hire',
      market: meta.market || 'Southeast Kansas / Northeast Oklahoma',
      status: meta.status || 'draft',
      updatedAt: new Date().toISOString()
    }, null, 2));
    for (const key of SECTIONS) {
      const p = path.join(dir, FILES[key]);
      if (!(await exists(p))) await writeText(p, `# ${key.replaceAll('-', ' ')}\n\nDraft section.\n`);
    }
    res.json({ ok: true, path: dir });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.use(express.static(DIST));
app.use(async (_req, res) => {
  const index = path.join(DIST, 'index.html');
  if (await exists(index)) return res.sendFile(index);
  res.status(404).send('Build missing. Run npm run build or npm run dev.');
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Campaign Packet API listening on http://127.0.0.1:${PORT}`);
  console.log(`Data root: ${DATA_ROOT}`);
});
