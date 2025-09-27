# FRF Event Hub - Project Documentation

## Overview

FRF Event Hub is a comprehensive event intelligence platform built with Next.js 15 and Firebase. It provides a three-stage pipeline for collecting, analyzing, and verifying global events from third-party sources, with human-in-the-loop review at each critical stage.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15.5.4, React 19, TypeScript
- **UI Framework**: Material-UI (MUI) v6
- **Backend**: Firebase (Firestore, Authentication, Storage, Functions)
- **Hosting**: Firebase App Hosting (europe-west4)
- **State Management**: React Context API
- **Authentication**: Firebase Auth with email/password

### Project Structure
```
frf-event-hub/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── dashboard/        # Dashboard pages
│   │   │   ├── staging/      # Staging events management
│   │   │   ├── analysis/     # Analysis queue management
│   │   │   ├── verified/     # Verified events view
│   │   │   └── ...          # Other dashboard pages
│   │   ├── login/           # Authentication pages
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   └── DashboardLayout.tsx
│   ├── contexts/           # Context providers
│   │   └── AuthContext.tsx
│   └── lib/                # Utilities and configs
│       └── firebase/       # Firebase configuration
├── firebase.json           # Firebase configuration
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore indexes
└── apphosting.yaml        # App Hosting configuration
```

## Event Processing Pipeline

### Three-Stage Architecture

#### 1. **Staging Events** (`staging_events` collection)
- Raw events collected from third-party sources
- Requires human review before processing
- Features:
  - View event details (title, summary, location, metadata)
  - Edit event information
  - Approve → moves to Analysis Queue
  - Reject → marks as rejected
  - Delete → removes from system

#### 2. **Analysis Queue** (`analysis_queue` collection)
- Approved events with AI analysis
- Contains comprehensive AI-generated insights:
  - Risk classification (confidence, primary/secondary categories)
  - Severity score (0-10)
  - Advisory (key takeaways, recommendations, related risks)
  - Geocoding (coordinates, affected regions)
  - Impact assessment (radius, affected sectors)
  - Temporal data (duration, ongoing status)
- Requires verification before finalization
- Features:
  - Review AI analysis
  - Edit risk scores and confidence
  - Verify → moves to Verified Events
  - Mark as failed → requires re-analysis

#### 3. **Verified Events** (`verified_events` collection)
- Fully processed and verified events
- Final repository of confirmed intelligence
- Features:
  - Card-based view with risk visualization
  - Detailed intelligence reports
  - Export capabilities (future enhancement)
  - Historical archive

## Features Implemented

### Authentication System
- Firebase Authentication with email/password
- Protected routes with middleware
- Session persistence
- Password reset functionality
- User profile management

### Real-time Notifications
- Live count of pending staging events in navigation bar
- Real-time updates using Firestore onSnapshot listeners
- Click-to-navigate from notification badge to staging page
- Automatic refresh when events are added/approved/rejected

### Dashboard Pages

#### Main Dashboard (`/dashboard`)
- Overview statistics for all three collections
- Pipeline status cards showing:
  - Total events in each stage
  - Pending items requiring action
  - Critical events count
- Recent events from staging and verified collections
- Quick navigation to management pages

#### Staging Events Management (`/dashboard/staging`)
- DataGrid table with responsive columns
- Features:
  - Search and filter capabilities
  - Inline editing of event details
  - Bulk selection
  - Quick approve/reject actions
  - Detailed view dialog
  - Edit dialog with all fields
- Columns: Event ID, Title, Category, Severity, Location, Articles, Status, Collected Date, Actions

#### Analysis Queue Management (`/dashboard/analysis`)
- DataGrid table with AI analysis data
- Features:
  - Risk score visualization (0-10 scale with color coding)
  - Confidence percentage display
  - Detailed analysis view showing:
    - Key takeaways
    - Recommendations
    - Related risks
    - Impact assessment
    - Location details
  - Verification dialog for reviewing and editing AI analysis
- Columns: Event ID, Title, Severity, Risk Score, Confidence, Verification Status, Analyzed Date, Actions

#### Verified Events (`/dashboard/verified`)
- Card-based layout for verified intelligence
- Features:
  - High priority events section
  - Risk-based color coding
  - Detailed intelligence reports
  - Category breakdown
  - Statistics overview (total, critical, average risk)
- Visual design with gradient cards and risk indicators

### Data Models

#### Staging Event Structure
```typescript
{
  eventId: string
  event: {
    title: string
    summary: string
    dateTime: Timestamp
    location: {
      text: { eng: string }
      country: { eng: string }
    }
    category: string
    severity: string
  }
  metadata: {
    articleCount: number
    isDuplicate: boolean
    newsApiUri: string
  }
  reviewStatus: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: Timestamp
  reviewNotes?: string
}
```

#### AI Analysis Structure
```typescript
{
  aiAnalysis: {
    severity: number (0-10)
    riskClassification: {
      confidence: number (0-1)
      primary: string
      secondary: string[]
    }
    advisory: {
      keyTakeaways: string[]
      recommendations: string[]
      relatedRisks: string[]
    }
    geocoding: {
      coordinates: { lat, lng }
      affectedRegions: string[]
      confidence: number
    }
    impactAssessment: {
      radiusKm: number
      radiusCategory: string
      sectors: string[]
    }
  }
}
```

### Security Implementation

#### Firestore Security Rules
- Authentication required for all operations
- Role-based access control
- Audit trail requirements
- Field-level validation
- Status transition controls

Key rules:
- Any authenticated user can read/create/update staging events
- Review status changes must track reviewer email
- Verified events have restricted write access
- Audit logs are write-only for users

#### Indexes
Optimized queries with composite indexes:
- `staging_events`: collectedAt (DESC) for latest events first
- `analysis_queue`: analyzedAt/reviewedAt (DESC) for workflow order
- `verified_events`: verifiedAt (DESC) for recent verifications

### UI/UX Improvements

#### Responsive Design
- Mobile-first approach
- Flexible DataGrid columns using `flex` property
- Responsive card layouts
- Adaptive spacing and padding

#### Table Optimizations
- Flexible column widths with `flex` property
- Minimum widths to prevent crushing
- Ellipsis text overflow handling
- Reduced fixed widths for better space utilization
- Proper container wrapping to prevent horizontal scroll

#### Layout Improvements
- Reduced sidebar gap from 24px to 16px
- Maximum content width of 1600px
- Centered content on wide screens
- Responsive padding adjustments

## Technical Decisions

### Why Firebase?
- Serverless architecture reduces operational overhead
- Real-time database capabilities for live updates
- Built-in authentication system
- Integrated hosting with App Hosting
- Automatic scaling

### Why Next.js 15?
- App Router for better performance
- Server Components support
- Built-in TypeScript support
- Optimized production builds
- Excellent developer experience

### Why MUI?
- Comprehensive component library
- DataGrid for complex tables
- Consistent design system
- Accessibility built-in
- Theming capabilities

## Environment Configuration

### Required Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Firebase App Hosting Secrets
- `FIREBASE_API_KEY`
- `FIREBASE_APP_ID`

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

### Deployment
```bash
# Deploy to Firebase App Hosting
firebase apphosting:backends:list
firebase deploy
```

## Issues Resolved

### 1. Grid Component Compatibility
- **Problem**: MUI Grid components using deprecated 'item' prop
- **Solution**: Replaced with Box components using flexbox

### 2. Data Field Mapping
- **Problem**: Analysis data stored as `aiAnalysis` but code expected `analysis`
- **Solution**: Updated interfaces and field references throughout

### 3. Runtime TypeError
- **Problem**: Destructuring undefined parameters in valueGetter
- **Solution**: Changed to safe parameter access pattern

### 4. Table Responsiveness
- **Problem**: Fixed widths causing horizontal scroll
- **Solution**: Implemented flex columns and responsive widths

### 5. Excessive Layout Spacing
- **Problem**: 7cm gap between sidebar and content
- **Solution**: Reduced padding and optimized layout spacing

## Future Enhancements

### Planned Features
1. ~~Real-time updates using Firestore listeners~~ ✅ Implemented
2. Advanced filtering and search
3. Export to CSV/PDF functionality
4. Email notifications for critical events
5. Multi-language support
6. Advanced analytics dashboard
7. API integration for automated event collection
8. Machine learning model integration
9. Geographic visualization (maps)
10. User role management (admin/reviewer/viewer)

### Technical Improvements
1. Implement React Query for data fetching
2. Add comprehensive error boundaries
3. Implement proper logging system
4. Add E2E testing with Cypress
5. Performance monitoring with Web Vitals
6. Progressive Web App (PWA) features
7. Offline support with service workers

## Testing

### Current Test Coverage
- TypeScript type checking: ✅ (No errors)
- ESLint code quality: ✅ (No warnings or errors)
- Build testing: ✅ (Successfully builds for production)
- Manual testing: ✅ (All features verified)
- Real-time features: ✅ (Notification badge updates live)

### Recommended Testing Strategy
1. Unit tests with Jest and React Testing Library
2. Integration tests for Firebase operations
3. E2E tests for critical user flows
4. Performance testing with Lighthouse
5. Security testing with Firebase Security Rules simulator

## Maintenance Notes

### Regular Tasks
1. Monitor Firebase usage and quotas
2. Review and update security rules
3. Check for dependency updates
4. Monitor error logs in Firebase Console
5. Regular backups of Firestore data

### Performance Optimization
- Firestore queries are indexed for optimal performance
- DataGrid uses pagination to handle large datasets
- Images and assets optimized with Next.js Image component
- Code splitting implemented automatically by Next.js

## Contact & Support

### Development Team
- Frontend Development: Completed initial implementation
- Firebase Integration: Fully configured
- UI/UX Design: Material Design implementation

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [MUI Documentation](https://mui.com/material-ui/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## License
Private - All rights reserved

---

*Last Updated: December 27, 2024*
*Version: 1.1.0*

## Recent Updates (December 27, 2024)

### Version 1.1.0
- ✅ Implemented real-time notification system for pending staging events
- ✅ Added click-to-navigate functionality from notification badge
- ✅ Fixed Button import error in DashboardLayout
- ✅ Completed all ESLint, TypeScript, and build tests
- ✅ Updated documentation with latest features