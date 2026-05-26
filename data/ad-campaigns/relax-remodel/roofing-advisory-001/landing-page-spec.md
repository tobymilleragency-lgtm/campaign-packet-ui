# Landing page spec — export only

This tab produces the landing-page handoff spec. It does not deploy a site. The actual site build goes through the normal site-build flow.

## Build direction
Use Hallmark / Claude-design standards: anti-slop, mobile-first, conversion-focused. One focused page. No nav clutter. Use the brand default with a blue accent. Never use orange.

## Page goal
Convert roofing homeowners into either a form lead or a tap-to-call lead with Grace at 620-448-8604.

## Structure
### Hero
Headline: Roof damage? Get honest advice before you hire.
Subhead: Veteran-owned homeowner advisor. Not a contractor. Free roofing project review before you hire.
Primary actions side by side:
- Request a free project review
- Tap to call Grace: 620-448-8604

### Trust strip
Veteran-owned. Local to Southeast Kansas. We are advisors. We do not do the construction, so the advice stays honest.

### How it works
1. Tell us about your roof.
2. We review it and give you a straight answer plus a cost range.
3. We connect you with a vetted local contractor when you are ready.

### Vetted contractor boundary
We verify license and insurance and do our homework. We do not guarantee the contractor's work. Your contract is directly with the contractor.

### Secondary CTA
Repeat the form and tap-to-call options.

### Footer
Relax Remodel Consulting. Service area: Southeast Kansas, Northeast Oklahoma, Southwest Missouri. Phone: 620-448-8604.

## Form fields
- First name
- Last name
- Phone
- Email
- Project type: Roof repair / Roof replacement / Not sure / Other
- Tell us about your roof
- Consent line for contact and SMS when allowed

## Submit behavior
After submit, show same-page thank-you:
"Thanks. Toby will reach out to review your roofing project. Talk soon."

Optional link to the main Relax Remodel site.

## Guardrails
- No false instant-text claims until A2P is live.
- Tracking slots must exist for GHL tracking script, GA4, and Meta Pixel.
- Tap-to-call leads go through Grace's existing flow.
