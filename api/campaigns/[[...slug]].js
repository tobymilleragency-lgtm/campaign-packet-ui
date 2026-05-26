import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_ROOT = process.env.CAMPAIGN_PACKET_DATA_ROOT || path.join(process.cwd(), 'data', 'ad-campaigns');
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
async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}
async function readText(p, fallback = '') {
  try { return await fs.readFile(p, 'utf8'); } catch { return fallback; }
}
async function listCampaigns() {
  const out = [];
  if (!(await exists(DATA_ROOT))) return { campaigns: out, dataRoot: DATA_ROOT, readonly: true };
  const businesses = await fs.readdir(DATA_ROOT, { withFileTypes: true });
  for (const b of businesses.filter(d => d.isDirectory())) {
    const bdir = path.join(DATA_ROOT, b.name);
    const campaigns = await fs.readdir(bdir, { withFileTypes: true }).catch(() => []);
    for (const c of campaigns.filter(d => d.isDirectory())) {
      const dir = path.join(bdir, c.name);
      const meta = JSON.parse(await readText(path.join(dir, 'campaign.json'), '{}') || '{}');
      out.push({ business: b.name, campaign: c.name, path: `data/ad-campaigns/${b.name}/${c.name}`, ...meta });
    }
  }
  out.sort((a, b) => String(a.campaign).localeCompare(String(b.campaign)));
  return { campaigns: out, dataRoot: 'data/ad-campaigns', readonly: true };
}
async function getCampaign(business, campaign) {
  const b = safeSegment(business);
  const c = safeSegment(campaign);
  const dir = path.join(DATA_ROOT, b, c);
  const meta = JSON.parse(await readText(path.join(dir, 'campaign.json'), '{}') || '{}');
  const sections = {};
  for (const key of SECTIONS) sections[key] = await readText(path.join(dir, FILES[key]));
  return { business: b, campaign: c, path: `data/ad-campaigns/${b}/${c}`, meta, sections, files: FILES, readonly: true };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Deployed packet viewer is read-only. Edit packets locally.' });
  try {
    const slug = Array.isArray(req.query.slug) ? req.query.slug : [];
    if (slug.length === 0) return res.status(200).json(await listCampaigns());
    if (slug.length === 2) return res.status(200).json(await getCampaign(slug[0], slug[1]));
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
