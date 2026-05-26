# Campaign Packet Viewer

Internal local-first UI for reviewing campaign packets.

Scope:
- No login
- No database
- No Meta Ads API
- No GHL API
- Landing Page and GHL tabs are exporters/spec handoffs only

Data root:
`/home/toby/ad-campaigns/`

Seed campaign:
`/home/toby/ad-campaigns/relax-remodel/bathroom-advisory-001/`

Run:
```bash
cd /home/toby/campaign-packet-ui
npm install
npm run dev
```

Open:
`http://127.0.0.1:5178`

API:
`http://127.0.0.1:45880`
