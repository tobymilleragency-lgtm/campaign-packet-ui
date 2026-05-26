import { listCampaigns, setApiHeaders } from './_campaignData.js';

export default async function handler(req, res) {
  setApiHeaders(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Deployed packet viewer is read-only. Edit packets locally.' });
  try {
    return res.status(200).json(await listCampaigns());
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
