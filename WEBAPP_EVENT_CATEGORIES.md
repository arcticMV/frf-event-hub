# FRF Event Hub - Event Categories Reference
## Web Application Integration Guide

**Version:** 2.0
**Last Updated:** January 2025
**For:** Web Application Development Team

---

## Overview

This document provides a comprehensive reference for all event categories used in the FRF Event Hub system. These categories are used throughout the platform for event classification, filtering, search, and analytics.

The FRF Event Hub tracks global risk and security events across 14 distinct categories. Each event must be assigned exactly one primary category based on its most prominent characteristic.

---

## Complete Category List

The system supports **14 event categories**:

1. Cyber security
2. Physical threats & violence
3. Armed Conflict
4. Terrorism
5. Natural disasters
6. Infrastructure & utilities
7. Civil unrest & demonstrations
8. Health & disease
9. Transportation
10. Environmental & industrial
11. Maritime Security
12. Organized Crime
13. Political
14. Economic

---

## Detailed Category Definitions

### 1. Cyber security

**Definition:** Digital threats, cyber attacks, data breaches, and information security incidents.

**Scope:**
- Ransomware attacks
- Data breaches and leaks
- DDoS attacks
- State-sponsored cyber operations
- Critical infrastructure cyber attacks
- Malware campaigns
- Website defacements
- Supply chain cyber attacks

**Examples:**
- Colonial Pipeline ransomware attack (2021)
- SolarWinds supply chain breach
- Healthcare system ransomware incidents
- Government database breaches
- Financial institution cyber attacks

**Excludes:**
- Physical damage to IT infrastructure (use Infrastructure & utilities)
- Cyber-enabled theft/fraud (use Organized Crime)

---

### 2. Physical threats & violence

**Definition:** Acts of physical violence not classified as armed conflict, terrorism, or organized crime.

**Scope:**
- Assault and battery
- Shootings (non-terrorism)
- Stabbings and violent attacks
- Workplace violence
- Domestic incidents with public impact
- Active shooter situations (non-ideological)
- Muggings and street violence

**Examples:**
- Workplace shooting incidents
- Public assault incidents
- Mass shootings without political/ideological motive
- Street violence affecting operations
- Violence at public venues

**Excludes:**
- War/combat operations (use Armed Conflict)
- Ideologically motivated violence (use Terrorism)
- Gang/cartel violence (use Organized Crime)
- Civil unrest violence (use Civil unrest & demonstrations)

---

### 3. Armed Conflict

**Definition:** State-level military operations, wars, armed insurgencies, and organized military combat.

**Scope:**
- Interstate wars
- Civil wars
- Military operations and campaigns
- Armed insurgencies and rebellions
- Military coups and takeovers
- Border conflicts and skirmishes
- Peacekeeping operations under fire
- Drone strikes and airstrikes

**Examples:**
- Russia-Ukraine conflict
- Syrian civil war
- Israel-Hamas conflict
- Sudan civil war
- Border clashes (India-China, Armenia-Azerbaijan)
- Military coups (Myanmar, Niger)

**Excludes:**
- Terrorist attacks by non-state groups (use Terrorism)
- Gang warfare (use Organized Crime)
- Violent protests (use Civil unrest & demonstrations)

---

### 4. Terrorism

**Definition:** Ideologically or politically motivated violence targeting civilians to instill fear or coerce governments.

**Scope:**
- Terrorist bombings and attacks
- Hostage situations by terrorist groups
- Vehicle ramming attacks
- Suicide bombings
- Coordinated terrorist operations
- Lone-wolf attacks with ideological motive
- Bio-terrorism threats
- Assassination by terrorist organizations

**Examples:**
- ISIS attacks
- Al-Qaeda operations
- Lone-wolf ideologically motivated attacks
- Airport/transport hub attacks
- Religious extremist attacks
- Political assassination attempts

**Excludes:**
- Military combat (use Armed Conflict)
- Kidnapping for ransom by criminals (use Organized Crime)
- Non-ideological mass violence (use Physical threats & violence)

---

### 5. Natural disasters

**Definition:** Natural phenomena causing significant damage, disruption, or threat to human life and infrastructure.

**Scope:**
- Earthquakes and seismic activity
- Hurricanes, typhoons, cyclones
- Floods and flash floods
- Tornadoes
- Wildfires (naturally caused)
- Tsunamis
- Volcanic eruptions
- Landslides and avalanches
- Extreme weather (heat waves, cold snaps, blizzards)
- Droughts

**Examples:**
- Turkey-Syria earthquake (2023)
- Hurricane Katrina
- Japan tsunami (2011)
- California wildfires (lightning-caused)
- Pakistan floods
- Icelandic volcanic eruptions

**Excludes:**
- Human-caused environmental disasters (use Environmental & industrial)
- Wildfires caused by arson (use appropriate crime category)

---

### 6. Infrastructure & utilities

**Definition:** Failures, damage, or disruptions to critical infrastructure and utility services.

**Scope:**
- Power grid failures and blackouts
- Water supply disruptions
- Telecommunications outages
- Bridge/building collapses
- Dam failures
- Pipeline ruptures (non-environmental impact)
- Critical infrastructure sabotage
- Construction site accidents affecting public
- Internet/network outages (non-cyber)

**Examples:**
- Texas power grid failure (2021)
- Building collapses (Champlain Towers)
- Major power outages affecting cities
- Water contamination requiring boil notices
- Bridge collapses affecting transportation
- Pipeline explosions

**Excludes:**
- Cyber attacks on infrastructure (use Cyber security)
- Environmental contamination (use Environmental & industrial)
- Transportation-specific incidents (use Transportation)

---

### 7. Civil unrest & demonstrations

**Definition:** Large-scale public protests, riots, civil disturbances, and social unrest.

**Scope:**
- Protests and demonstrations
- Riots and looting
- Strikes and labor actions
- Occupy movements
- Social justice protests
- Political demonstrations
- Street blockades
- Violent clashes with police
- Civil disobedience campaigns

**Examples:**
- Black Lives Matter protests
- Hong Kong democracy protests
- French Yellow Vest movement
- Farmer protests in India
- Anti-government demonstrations
- Labor strikes affecting operations

**Excludes:**
- Military coups (use Armed Conflict)
- Organized insurgencies (use Armed Conflict)
- Terrorist attacks at protests (use Terrorism)

---

### 8. Health & disease

**Definition:** Disease outbreaks, pandemics, public health emergencies, and healthcare system events.

**Scope:**
- Pandemics and epidemics
- Disease outbreaks (Ebola, cholera, etc.)
- Food poisoning incidents affecting large groups
- Healthcare system failures
- Medical supply shortages
- Vaccine-related events
- Hospital emergencies
- Public health advisories
- Antimicrobial resistance threats

**Examples:**
- COVID-19 pandemic
- Ebola outbreaks
- Zika virus outbreak
- Avian flu cases
- Hospital capacity crises
- Contaminated medication recalls
- Measles outbreaks

**Excludes:**
- Bioterrorism (use Terrorism)
- Industrial chemical exposure (use Environmental & industrial)

---

### 9. Transportation

**Definition:** Major transportation accidents, disruptions, and infrastructure incidents affecting travel and logistics.

**Scope:**
- Aviation accidents and incidents
- Train derailments and collisions
- Bus accidents
- Ferry/boat accidents (non-maritime security)
- Major highway incidents
- Airport closures
- Port disruptions (non-security)
- Mass transit system failures
- Traffic incidents with significant impact

**Examples:**
- Plane crashes
- Train derailments
- Major highway pile-ups
- Airport evacuations (non-security)
- Ferry disasters
- Metro/subway incidents
- Cargo train accidents

**Excludes:**
- Maritime piracy (use Maritime Security)
- Cyber attacks on transport (use Cyber security)
- Terrorism involving transport (use Terrorism)
- Environmental spills from transport (use Environmental & industrial)

---

### 10. Environmental & industrial

**Definition:** Environmental disasters, industrial accidents, pollution events, and ecological threats caused by human activity.

**Scope:**
- Oil spills
- Chemical plant explosions/leaks
- Industrial fires
- Toxic contamination
- Nuclear incidents
- Illegal dumping
- Air pollution events
- Factory accidents affecting public
- Mining disasters
- Deforestation events with impact
- Climate-related human-caused events

**Examples:**
- Deepwater Horizon oil spill
- Bhopal gas tragedy
- Fukushima nuclear disaster
- Chemical plant explosions
- Factory fires releasing toxic fumes
- Industrial waste contamination

**Excludes:**
- Natural disasters (use Natural disasters)
- Cyber attacks on plants (use Cyber security)
- Terrorism at facilities (use Terrorism)
- Transportation-related spills (use Transportation)

---

### 11. Maritime Security

**Definition:** Security threats, piracy, and incidents in maritime environments and international waters.

**Scope:**
- Piracy and hijacking at sea
- Naval incidents and confrontations
- Port security breaches
- Illegal fishing and resource exploitation
- Maritime border disputes
- Ship attacks and seizures
- Smuggling via sea routes
- Naval mine incidents
- Suspicious vessel activity

**Examples:**
- Somali piracy incidents
- Houthi attacks on Red Sea shipping
- Iranian vessel seizures in Gulf
- Port security incidents
- Illegal fishing by foreign vessels
- Maritime border violations
- Ship hijackings

**Excludes:**
- Ferry/boat accidents (use Transportation)
- Navy combat operations (use Armed Conflict)
- Oil spills from ships (use Environmental & industrial)

---

### 12. Organized Crime

**Definition:** Activities by criminal organizations including cartels, gangs, mafias, and transnational crime networks.

**Scope:**
- Cartel violence and operations
- Gang warfare and turf conflicts
- Kidnapping for ransom
- Human trafficking
- Drug trafficking
- Arms smuggling
- Extortion and protection rackets
- Money laundering operations
- Organized theft rings
- Mafia/cartel assassinations

**Examples:**
- Mexican cartel conflicts
- Kidnapping incidents in high-risk areas
- Gang violence in Central America
- Human trafficking rings busted
- Major drug seizures
- Organized retail theft
- Mafia operations

**Excludes:**
- Terrorism (use Terrorism)
- Cyber crime (use Cyber security)
- General violence (use Physical threats & violence)
- Individual crimes (unless part of organized operation)

---

### 13. Political

**Definition:** Political events, government actions, elections, and governance-related developments affecting security and operations.

**Scope:**
- Elections and electoral processes
- Political transitions and inaugurations
- Government policy changes affecting security
- Political corruption scandals
- Diplomatic incidents
- Sanctions and embargoes
- Legislative developments
- Political arrests and detentions
- Government collapses
- Political assassination (non-terrorism)

**Examples:**
- National elections
- Impeachment proceedings
- Government shutdown events
- Diplomatic expulsions
- New sanctions announcements
- Constitutional crises
- Political party conflicts

**Excludes:**
- Military coups (use Armed Conflict)
- Violent protests (use Civil unrest & demonstrations)
- Terrorism against politicians (use Terrorism)

---

### 14. Economic

**Definition:** Economic events, financial crises, market disruptions, and business-related security concerns.

**Scope:**
- Financial market crashes
- Banking crises
- Currency devaluations
- Hyperinflation events
- Major corporate bankruptcies
- Trade disputes
- Supply chain disruptions (economic causes)
- Economic sanctions impact
- Debt defaults
- Major layoffs/unemployment events

**Examples:**
- Stock market crashes
- Banking sector collapses
- National debt crises
- Currency crashes (Turkish Lira, Argentine Peso)
- Major company bankruptcies
- Trade war developments
- Economic blockades

**Excludes:**
- Cyber attacks on financial systems (use Cyber security)
- Physical attacks on banks (use appropriate violence category)
- Organized financial crime (use Organized Crime)

---

## Data Models

### Event Structure

```typescript
interface EventData {
  title: string;
  summary: string;
  dateTime: Timestamp;
  location: {
    text: { eng: string };
    country: { eng: string };
    needsGeocoding: boolean;
  };
  category: string;  // One of the 14 categories listed above
  severity: string;  // 'critical' | 'high' | 'medium' | 'low'
}

interface StagingEvent {
  id: string;
  eventId: string;
  collectedAt: Timestamp;
  event: EventData;
  metadata: {
    articleCount: number;
    newsApiUri: string;
    isDuplicate: boolean;
    relatedEvents: string[];
  };
  reviewStatus: string;  // 'pending' | 'approved' | 'rejected'
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  reviewNotes?: string;
}
```

### Category Field Specification

```typescript
// Category type
type EventCategory =
  | 'Cyber security'
  | 'Physical threats & violence'
  | 'Armed Conflict'
  | 'Terrorism'
  | 'Natural disasters'
  | 'Infrastructure & utilities'
  | 'Civil unrest & demonstrations'
  | 'Health & disease'
  | 'Transportation'
  | 'Environmental & industrial'
  | 'Maritime Security'
  | 'Organized Crime'
  | 'Political'
  | 'Economic';
```

---

## Filtering & Search Implementation

### Multi-Category Filter

```typescript
// Example filter implementation
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

const filteredEvents = events.filter(event => {
  if (selectedCategories.length === 0) return true;
  return selectedCategories.includes(event.event.category);
});
```

### Category Dropdown

```tsx
<FormControl fullWidth>
  <InputLabel>Category</InputLabel>
  <Select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    label="Category"
  >
    {CATEGORIES.map(cat => (
      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
    ))}
  </Select>
</FormControl>
```

### Category Chip Display

```tsx
<Chip
  label={event.category}
  size="small"
  variant="outlined"
  color="primary"
/>
```

---

## API Integration

### Event Creation

When creating events via API, ensure the `category` field contains one of the 14 valid category strings (case-sensitive, exact match):

```json
{
  "eventId": "eng-12345678",
  "event": {
    "title": "Example Event",
    "summary": "Event description...",
    "dateTime": "2025-01-21T10:00:00Z",
    "location": {
      "text": { "eng": "City, Region" },
      "country": { "eng": "Country Name" },
      "needsGeocoding": true
    },
    "category": "Armed Conflict",
    "severity": "high"
  }
}
```

### Validation

- **Required:** Category field must be present
- **Format:** String type, case-sensitive
- **Values:** Must match one of the 14 categories exactly
- **Cardinality:** Exactly one category per event (not an array)

---

## Best Practices

### Category Selection Guidelines

1. **Primary Characteristic Rule:** Choose the category that best represents the event's primary nature, not secondary effects.

   Example: A terrorist attack causing a power outage → **Terrorism** (not Infrastructure)

2. **Hierarchy for Overlapping Events:**
   - If violence is ideologically motivated → **Terrorism**
   - If violence is state-level military → **Armed Conflict**
   - If violence is organized crime-related → **Organized Crime**
   - Otherwise → **Physical threats & violence**

3. **Maritime vs. Transportation:**
   - Security/piracy/military → **Maritime Security**
   - Accidents/mechanical failures → **Transportation**

4. **Environmental vs. Natural:**
   - Human-caused → **Environmental & industrial**
   - Natural causes → **Natural disasters**

5. **Infrastructure vs. Cyber:**
   - Physical infrastructure failure → **Infrastructure & utilities**
   - Digital/cyber attack → **Cyber security**

### Avoiding Common Mistakes

| **Don't** | **Do** |
|-----------|--------|
| Terrorism attack at airport → Transportation | Terrorism attack at airport → **Terrorism** |
| Industrial chemical leak → Natural disasters | Industrial chemical leak → **Environmental & industrial** |
| Military cyber attack → Cyber security | Military cyber attack → **Armed Conflict** (if part of war) or **Cyber security** (if standalone) |
| Pirate hijacking → Organized Crime | Pirate hijacking → **Maritime Security** |
| Protest turning violent → Political | Protest turning violent → **Civil unrest & demonstrations** |

### Data Quality

- **Consistency:** Use exact category names (case-sensitive)
- **Single Category:** Assign only one category per event
- **Specificity:** Use the most specific category available
- **Documentation:** Add notes in summary if event has multi-category aspects

---

## Category Usage Statistics

Based on typical global threat landscape:

- **Armed Conflict:** 15-20% of events
- **Terrorism:** 10-15% of events
- **Natural disasters:** 12-18% of events
- **Political:** 8-12% of events
- **Civil unrest & demonstrations:** 8-12% of events
- **Cyber security:** 5-10% of events
- **Health & disease:** 5-8% of events
- **Infrastructure & utilities:** 5-8% of events
- **Physical threats & violence:** 5-8% of events
- **Organized Crime:** 4-7% of events
- **Environmental & industrial:** 3-6% of events
- **Economic:** 3-5% of events
- **Transportation:** 3-5% of events
- **Maritime Security:** 2-4% of events

*Note: Percentages vary based on global events and regional focus.*

---

## Change History

### Version 2.0 (January 2025)
- **Added 4 new categories:**
  - Armed Conflict
  - Terrorism
  - Maritime Security
  - Organized Crime
- Updated category definitions for clarity
- Added detailed examples and exclusions
- Expanded documentation for web app integration

### Version 1.0 (Previous)
- Initial 10 categories:
  - Cyber security
  - Physical threats & violence
  - Natural disasters
  - Infrastructure & utilities
  - Civil unrest & demonstrations
  - Health & disease
  - Transportation
  - Environmental & industrial
  - Political
  - Economic

---

## Support & Questions

For questions about category selection or integration:
- Refer to detailed definitions above
- Check examples and exclusions
- Review "Best Practices" section
- Contact the Event Hub development team for edge cases

---

**Document Owner:** FRF Event Hub Development Team
**Review Cycle:** Quarterly
**Next Review:** April 2025
