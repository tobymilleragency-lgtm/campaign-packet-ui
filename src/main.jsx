import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { marked } from 'marked';
import './styles.css';

const API = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:45880/api'
  : '/api';
const tabs = [
  ['brief', 'Brief'],
  ['ad-copy', 'Ad Copy'],
  ['creative', 'Creative'],
  ['landing-page', 'Landing Page Export'],
  ['ghl-wiring', 'GHL Webhook Export'],
  ['launch-checklist', 'Launch Checklist'],
  ['results', 'Results']
];
const tabHelp = {
  brief: 'Source of truth for Relax Remodel Consulting campaign positioning.',
  'ad-copy': 'Angles, primary text, headlines, CTAs, and test priority.',
  creative: 'Image prompts, real-photo edit prompts, and policy/trust guardrails.',
  'landing-page': 'Generator/exporter only. Produces a landing-page spec for the normal site-build flow. It does not deploy.',
  'ghl-wiring': 'Generator/exporter only. Produces a webhook/workflow handoff spec for the browser/GHL agent. It does not wire GHL.',
  'launch-checklist': 'Approval guardrails before anything is called live.',
  results: 'Manual campaign performance notes. No ad API connection.'
};

function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState({ business: 'relax-remodel', campaign: 'bathroom-advisory-001' });
  const [packet, setPacket] = useState(null);
  const [active, setActive] = useState('brief');
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');

  async function refreshList() {
    const r = await fetch(`${API}/campaigns`);
    const data = await r.json();
    setCampaigns(data.campaigns || []);
  }
  async function load(sel = selected) {
    const r = await fetch(`${API}/campaigns/${sel.business}/${sel.campaign}`);
    if (!r.ok) throw new Error(await r.text());
    const data = await r.json();
    setPacket(data);
    setDraft(data.sections?.[active] || '');
  }
  useEffect(() => { refreshList().then(() => load()).catch(e => setNotice(e.message)); }, []);
  useEffect(() => { if (packet) setDraft(packet.sections?.[active] || ''); }, [active, packet]);

  async function save() {
    if (packet?.readonly) {
      setNotice('Deployed viewer is read-only. Edit packets locally, then commit/redeploy.');
      return;
    }
    const r = await fetch(`${API}/campaigns/${selected.business}/${selected.campaign}/${active}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: draft })
    });
    if (!r.ok) return setNotice('Save failed: ' + await r.text());
    setNotice(`Saved ${tabs.find(t => t[0] === active)?.[1]}`);
    setEdit(false);
    await load();
  }
  async function copy() {
    await navigator.clipboard.writeText(packet?.sections?.[active] || '');
    setNotice('Copied current tab to clipboard');
  }
  async function generate() {
    if (packet?.readonly || API === '/api') {
      setNotice('Deployed viewer is read-only. Edit packets locally, then commit/redeploy.');
      return;
    }
    await fetch(`${API}/campaigns/relax-remodel/bathroom-advisory-001/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    setNotice('Seed campaign verified');
    await refreshList();
    await load({ business: 'relax-remodel', campaign: 'bathroom-advisory-001' });
  }
  const html = useMemo(() => ({ __html: marked.parse(packet?.sections?.[active] || '') }), [packet, active]);
  const completion = useMemo(() => {
    if (!packet?.sections) return 0;
    const filled = tabs.filter(([k]) => (packet.sections[k] || '').trim().length > 80).length;
    return Math.round((filled / tabs.length) * 100);
  }, [packet]);

  return <main className="shell">
    <aside className="sidebar">
      <div className="brandblock">
        <p className="kicker">Internal tool</p>
        <h1>Campaign Packet Viewer</h1>
        <p>Local-first packet review for Relax Remodel Consulting campaigns.</p>
      </div>
      <button className="primary" onClick={generate}>New / Verify Seed Campaign</button>
      <div className="campaignList">
        <h2>Campaigns</h2>
        {campaigns.map(c => <button key={c.path} className={selected.campaign===c.campaign ? 'selected' : ''} onClick={async () => { const sel={business:c.business,campaign:c.campaign}; setSelected(sel); await load(sel); }}>
          <span>{c.campaign}</span><small>{c.businessName || c.business}</small>
        </button>)}
      </div>
      <div className="guardrail">
        <strong>Positioning guardrail</strong>
        <span>Relax Remodel is the homeowner advisor. Use “free project review / honest advice before you hire.” Do not drift into contractor-estimate language.</span>
      </div>
    </aside>

    <section className="workspace">
      <header className="topbar">
        <div>
          <p className="kicker">{packet?.meta?.businessName || 'Relax Remodel Consulting'}</p>
          <h2>{selected.campaign}</h2>
          <p>{packet?.path}{packet?.readonly ? ' · deployed read-only snapshot' : ''}</p>
        </div>
        <div className="meter"><span style={{ width: `${completion}%` }} /><b>{completion}% packet filled</b></div>
      </header>

      <nav className="tabs">{tabs.map(([id, label]) => <button key={id} className={active===id ? 'active' : ''} onClick={() => { setActive(id); setEdit(false); }}>{label}</button>)}</nav>

      <section className="panel">
        <div className="panelHead">
          <div><h3>{tabs.find(t => t[0] === active)?.[1]}</h3><p>{tabHelp[active]}</p></div>
          <div className="actions">
            <button onClick={copy}>Copy</button>
            <button onClick={() => setEdit(!edit)}>{edit ? 'Preview' : 'Edit'}</button>
            {edit && <button className="primary" onClick={save}>Save</button>}
          </div>
        </div>
        {notice && <div className="notice" onClick={() => setNotice('')}>{notice}</div>}
        {edit ? <textarea value={draft} onChange={e => setDraft(e.target.value)} /> : <article className="markdown" dangerouslySetInnerHTML={html} />}
      </section>
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
