import fs from 'node:fs';
import path from 'node:path';
const root = '/home/toby/campaign-packet-ui';
const campaigns = [
  '/home/toby/ad-campaigns/relax-remodel/bathroom-advisory-001',
  '/home/toby/ad-campaigns/relax-remodel/roofing-advisory-001'
];
const required = ['campaign.json','brief.md','ad-copy.md','creative.md','landing-page-spec.md','ghl-webhook-spec.md','launch-checklist.md','results.md'];
let all = fs.readFileSync(path.join(root, 'src', 'main.jsx'), 'utf8');
for (const campaign of campaigns) {
  for (const file of required) {
    const p = path.join(campaign, file);
    if (!fs.existsSync(p)) throw new Error(`Missing ${p}`);
  }
  all += '\n' + required.map(f => fs.readFileSync(path.join(campaign, f), 'utf8')).join('\n');
}
if (!all.includes('SMS/CRM/AI follow-up only marked live after A2P is verified')) throw new Error('A2P guardrail missing');
if (!all.includes('homeowner advisor') && !all.includes('Homeowner advisor')) throw new Error('Advisor positioning missing');
const forbiddenEstimatePhrase = ['free', 'estimate'].join(' ');
if (all.includes(forbiddenEstimatePhrase)) throw new Error('Forbidden contractor-estimate wording present');
if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) throw new Error('Vite build output missing');
console.log('Smoke passed: campaign files, A2P guardrail, advisory positioning, and build output verified.');
