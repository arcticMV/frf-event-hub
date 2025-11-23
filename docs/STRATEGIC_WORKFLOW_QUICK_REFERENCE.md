# Strategic Intelligence Workflow - Quick Reference

## Quick Decision Guide

### When to Use Each Workflow

**Use IMMEDIATE THREAT for:**
- Active conflicts, terrorist attacks, natural disasters
- Events requiring rapid response
- Time-sensitive incidents
- Events needing geolocation and impact zones
- Severity: Usually Critical or High

**Use STRATEGIC INTELLIGENCE for:**
- Elections, policy changes, diplomatic relations
- Long-term political developments
- Economic trends and trade agreements
- Technology policy and regulations
- Events building country context
- Severity: Usually Medium or Low

## Data Flow Summary

```
IMMEDIATE THREAT:
staging_events (approved) → processApprovedEvent → analysis_queue → verified_events

STRATEGIC INTELLIGENCE:
staging_events (approved_strategic) → processStrategicEvent →
  country_intelligence + analysis_queue → strategic_intelligence_verified
```

## Key Technical Details

### reviewStatus Values
- `'approved'` - Triggers immediate threat workflow
- `'approved_strategic'` - Triggers strategic intelligence workflow
- **NEVER use same value for both**

### Collections
- `country_intelligence/{countryCode}` - Aggregate country data (e.g., USA, FRA, CHN)
- `strategic_intelligence_verified/{eventId}` - Verified strategic events
- `verified_events/{eventId}` - Verified immediate threats (unchanged)

### Cloud Function
- **Name:** `processStrategicEvent`
- **Region:** europe-west4
- **Timeout:** 540 seconds (9 minutes)
- **Memory:** 1GiB
- **Model:** gemini-2.5-flash

### Country Intelligence Structure
```javascript
{
  countryCode: "USA",
  countryName: "United States",
  region: "North America",
  totalEvents: 45,
  timeline: {
    "Military & Armed Conflict": { eventCount: 12, events: [...] },
    "Political & Governance": { eventCount: 8, events: [...] }
    // ... 12 more categories
  },
  aiAnalysis: {
    overallRisk: { score: 7.5, trend: "increasing", confidence: 0.85 },
    categories: { ... },
    summary: "...",
    outlook: { shortTerm: "...", mediumTerm: "...", longTerm: "..." },
    recommendations: [...]
  }
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Event stuck in staging | Check Cloud Function logs, verify reviewStatus value |
| Shows immediate analysis | Wrong reviewStatus used, check for 'approved_strategic' |
| "Model not found" | Update to 'gemini-2.5-flash', redeploy function |
| Modal shows "not complete" | Wait 9 minutes, check country_intelligence exists |
| Filters not working | Check FilterValues type, verify optional property guards |

## Files Modified

**Backend:**
- `functions/src/strategicAnalysis.ts` (NEW - 501 lines)
- `functions/src/index.ts` (export added)
- `functions/package.json` (@google/generative-ai added)
- `firestore.indexes.json` (4 indexes added)
- `firestore.rules` (2 collections added)

**Frontend:**
- `src/app/dashboard/strategic/page.tsx` (NEW - 656 lines)
- `src/app/dashboard/staging/page.tsx` (workflow selection)
- `src/app/dashboard/analysis/page.tsx` (dual modal logic)
- `src/components/CountryIntelligenceModal.tsx` (NEW - 302 lines)
- `src/components/DashboardLayout.tsx` (navigation link)

## Testing Checklist

- [ ] Approve event as Immediate Threat → verify appears in verified_events
- [ ] Approve event as Strategic → verify appears in strategic_intelligence_verified
- [ ] Check country_intelligence document created/updated
- [ ] Open Country Intelligence Modal from analysis queue
- [ ] Navigate to Strategic Intelligence page
- [ ] Test country accordion view
- [ ] Test table view toggle
- [ ] Test all filters
- [ ] Verify context preservation (filters persist on reload)
- [ ] Check Cloud Function logs for errors

## Quick Commands

```bash
# Deploy Cloud Function
npm run deploy

# Build frontend
npm run build

# Check Cloud Function logs
firebase functions:log --only processStrategicEvent

# List deployed functions
firebase functions:list
```

## Important Constants

**14 Event Categories:**
1. Military & Armed Conflict
2. Political & Governance
3. Terrorism & Extremism
4. Economic & Trade
5. Technology & Cybersecurity
6. Diplomatic & International Relations
7. Social & Civil Unrest
8. Environmental & Climate
9. Health & Pandemic
10. Nuclear & WMD
11. Intelligence & Espionage
12. Maritime & Aviation Security
13. Energy & Resources
14. Migration & Refugees

**Processing Times:**
- Immediate threat: 1-3 minutes
- Strategic intelligence: 5-9 minutes (due to full country re-analysis)

**Cost Estimates:**
- ~$0.02 per country re-analysis (Gemini 2.5 Flash)
- High-activity country (50 events/month): ~$1/month

## Contact Points

**Cloud Function Logs:** Firebase Console → Functions → processStrategicEvent
**Firestore Data:** Firebase Console → Firestore Database
**Frontend Errors:** Browser DevTools Console
**Documentation:** `docs/STRATEGIC_INTELLIGENCE_WORKFLOW.md`

---

**Version:** 1.0
**Last Updated:** November 23, 2025
