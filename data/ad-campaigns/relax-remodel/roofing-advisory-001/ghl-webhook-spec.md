# GHL webhook spec — export only

This tab produces the webhook/workflow handoff for the browser/GHL agent. It does not create or wire GHL itself.

## Receiver
Relax Remodel GHL sub-account inbound webhook. The GHL agent generates the URL using the same pattern as Alpha Marketing.

## POST payload
```json
{
  "first_name": "",
  "last_name": "",
  "name": "",
  "email": "",
  "phone": "",
  "project_type": "roof_repair | roof_replacement | not_sure | other",
  "message": "",
  "source": "relax-roofing-meta | relax-roofing-google",
  "page_url": "",
  "consent": true
}
```

## Field rules
- phone should be sent in E.164 format when possible.
- source must preserve the campaign identifier.
- page_url must preserve the landing-page URL.

## GHL workflow logic for the GHL agent
- Trigger: inbound webhook from the form. Keep separate from Grace's call path.
- Create or update contact.
- Tag: homeowner-roofing-ad.
- Set source from the payload.
- Create opportunity in the Homeowner Pipeline.
- Notify Toby and Brian by email now. SMS to them only after A2P is verified.
- Confirmation to homeowner by email now. SMS only once A2P is live.
- Leave workflow in Draft until A2P plus testing is complete.

## Grace call path
Tap-to-call leads are handled by Grace's existing flow at 620-448-8604.

## Self-booking workflow handoff
The GHL agent should build the shared consultation calendar and booking link:
- Shared calendar for Toby and Brian.
- 8:30 to 4:30 auto-booking.
- After 4:30 manual only.
- Confirmation, reminders, and nurture by email now; SMS only after A2P.

## Notification routing rule
Route internal notifications to Toby and Brian, not to the contact. This preserves the Alpha Marketing lesson.
