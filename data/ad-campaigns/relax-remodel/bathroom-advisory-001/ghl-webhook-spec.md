# GHL Webhook Spec — Export Only

This tab produces the webhook/workflow handoff for the browser/GHL agent. It does not create or wire GHL itself.

## Destination
GHL webhook URL: [paste after browser/GHL agent creates it]

## Method
POST JSON from the landing page form.

## Payload draft
```json
{
  "source": "relax-remodel-bathroom-advisory-001",
  "business": "Relax Remodel Consulting",
  "positioning": "homeowner_advisor_not_contractor",
  "offer": "free_project_review_honest_advice_before_you_hire",
  "firstName": "",
  "lastName": "",
  "phone": "",
  "email": "",
  "cityZip": "",
  "projectType": "bathroom_advisory",
  "projectNotes": "",
  "hasContractorBid": "unknown",
  "bestTimeToContact": "",
  "consent": true,
  "a2pGuardrail": "SMS/CRM/AI follow-up only marked live after A2P is verified — no instant text claims before then."
}
```

## GHL workflow notes for handoff
- Create or verify Relax Remodel pipeline/stage for project review requests.
- Tag lead: relax-remodel, bathroom-advisory, project-review-request.
- Store campaign source exactly: relax-remodel-bathroom-advisory-001.
- Do not enable SMS automation or claim instant texting until A2P is verified.
- If SMS is not verified, use manual task, email, or non-SMS follow-up path only.

## Test requirements
- Submit test lead from landing page.
- Confirm contact appears in GHL.
- Confirm campaign source and tags are preserved.
- Confirm no SMS claim/automation is marked live before A2P verification.
