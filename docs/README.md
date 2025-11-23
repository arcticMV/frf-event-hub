# FRF Event Hub Documentation

This directory contains comprehensive documentation for the FRF Event Hub application.

## Available Documentation

### Strategic Intelligence Workflow

1. **[STRATEGIC_INTELLIGENCE_WORKFLOW.md](./STRATEGIC_INTELLIGENCE_WORKFLOW.md)** (Comprehensive - 1,000+ lines)
   - Complete implementation documentation
   - Architecture decisions with reasoning
   - Technical details and data models
   - File-by-file breakdown
   - Testing guide
   - Troubleshooting section
   - Future considerations

   **Read this for:**
   - Understanding why decisions were made
   - Complete technical reference
   - Onboarding new developers
   - Architecture review
   - Maintenance and debugging

2. **[STRATEGIC_WORKFLOW_QUICK_REFERENCE.md](./STRATEGIC_WORKFLOW_QUICK_REFERENCE.md)** (Quick Reference)
   - One-page summary
   - Quick decision guide
   - Common troubleshooting
   - Key technical details
   - Testing checklist

   **Read this for:**
   - Day-to-day operations
   - Quick troubleshooting
   - Analyst training
   - Deployment checklists

## Documentation Structure

```
docs/
├── README.md (this file)
├── STRATEGIC_INTELLIGENCE_WORKFLOW.md
└── STRATEGIC_WORKFLOW_QUICK_REFERENCE.md
```

## Key Concepts

### Dual Workflow System

The FRF Event Hub processes events through two independent workflows:

1. **Immediate Threat Workflow** (Existing)
   - For real-time incidents requiring rapid response
   - Individual event analysis
   - Geocoding and impact assessment
   - Collection: `verified_events`

2. **Strategic Intelligence Workflow** (New)
   - For long-term political/intelligence developments
   - Country-level aggregation
   - Historical context analysis
   - Collection: `strategic_intelligence_verified`

### Critical Implementation Detail

**Workflows are separated using different `reviewStatus` values:**
- Immediate: `'approved'` → triggers `processApprovedEvent`
- Strategic: `'approved_strategic'` → triggers `processStrategicEvent`

This prevents race conditions where both functions would trigger on the same event.

## Quick Start for New Developers

1. **Read the Quick Reference** to understand workflow basics
2. **Test both workflows** using the testing checklist
3. **Review the comprehensive documentation** for deep understanding
4. **Check Cloud Function logs** to see processing in action
5. **Explore Firestore collections** to understand data structure

## Common Tasks

### Deploy Cloud Functions
```bash
cd functions
npm run deploy
```

### Build Frontend
```bash
npm run build
```

### Check Logs
```bash
firebase functions:log --only processStrategicEvent
```

### View Strategic Intelligence
Navigate to: Dashboard → Strategic Intelligence (sidebar)

## Related Files

### Backend
- `functions/src/strategicAnalysis.ts` - Strategic event processing
- `functions/src/index.ts` - Function exports
- `firestore.indexes.json` - Database indexes
- `firestore.rules` - Security rules

### Frontend
- `src/app/dashboard/strategic/page.tsx` - Strategic Intelligence page
- `src/components/CountryIntelligenceModal.tsx` - Country intelligence display
- `src/app/dashboard/staging/page.tsx` - Workflow selection
- `src/components/DashboardLayout.tsx` - Navigation

## Support

**For issues with strategic intelligence:**
1. Check the troubleshooting section in comprehensive documentation
2. Review Cloud Function logs in Firebase Console
3. Verify Firestore data structure matches documentation
4. Check browser console for frontend errors

## Version History

- **v1.0** (November 23, 2025) - Initial implementation of Strategic Intelligence workflow
  - Dual workflow system
  - Country-level aggregation
  - Gemini 2.5 Flash integration
  - Dedicated Strategic Intelligence page
  - Race condition prevention

## Future Documentation Needs

As the system evolves, consider documenting:
- [ ] Analyst user guide with screenshots
- [ ] API documentation for external integrations
- [ ] Database schema migration guides
- [ ] Performance optimization techniques
- [ ] Cost monitoring and budgeting
- [ ] Backup and disaster recovery procedures
- [ ] Analytics and reporting capabilities

---

**Documentation Maintained By:** Development Team
**Last Updated:** November 23, 2025
**Status:** Complete and Current
