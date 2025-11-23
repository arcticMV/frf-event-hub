import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Admin SDK
initializeApp();
const db = getFirestore();

// Define secret reference
const genkitApiKey = defineSecret('genkit');

// Country code mapping (ISO 3166-1 alpha-3)
const COUNTRY_CODE_MAP: { [key: string]: string } = {
  'United States': 'USA',
  'Ukraine': 'UKR',
  'France': 'FRA',
  'Germany': 'DEU',
  'United Kingdom': 'GBR',
  'China': 'CHN',
  'Russia': 'RUS',
  'Israel': 'ISR',
  'Iran': 'IRN',
  'India': 'IND',
  'Pakistan': 'PAK',
  'Syria': 'SYR',
  'Iraq': 'IRQ',
  'Afghanistan': 'AFG',
  'Turkey': 'TUR',
  'Saudi Arabia': 'SAU',
  'Egypt': 'EGY',
  'Sudan': 'SDN',
  'South Sudan': 'SSD',
  'Yemen': 'YEM',
  'Lebanon': 'LBN',
  'Jordan': 'JOR',
  'Japan': 'JPN',
  'South Korea': 'KOR',
  'North Korea': 'PRK',
  'Taiwan': 'TWN',
  'Myanmar': 'MMR',
  'Thailand': 'THA',
  'Philippines': 'PHL',
  'Indonesia': 'IDN',
  'Malaysia': 'MYS',
  'Singapore': 'SGP',
  'Vietnam': 'VNM',
  'Australia': 'AUS',
  'New Zealand': 'NZL',
  'Mexico': 'MEX',
  'Canada': 'CAN',
  'Brazil': 'BRA',
  'Argentina': 'ARG',
  'Chile': 'CHL',
  'Colombia': 'COL',
  'Venezuela': 'VEN',
  'Peru': 'PER',
  'Ecuador': 'ECU',
  'Bolivia': 'BOL',
  'Paraguay': 'PRY',
  'Uruguay': 'URY',
  'South Africa': 'ZAF',
  'Nigeria': 'NGA',
  'Ethiopia': 'ETH',
  'Kenya': 'KEN',
  'Somalia': 'SOM',
  'Libya': 'LBY',
  'Algeria': 'DZA',
  'Morocco': 'MAR',
  'Tunisia': 'TUN',
  'Ghana': 'GHA',
  'Ivory Coast': 'CIV',
  'Senegal': 'SEN',
  'Mali': 'MLI',
  'Niger': 'NER',
  'Chad': 'TCD',
  'Burkina Faso': 'BFA',
  'Cameroon': 'CMR',
  'Democratic Republic of Congo': 'COD',
  'Republic of Congo': 'COG',
  'Central African Republic': 'CAF',
  'Spain': 'ESP',
  'Italy': 'ITA',
  'Poland': 'POL',
  'Romania': 'ROU',
  'Netherlands': 'NLD',
  'Belgium': 'BEL',
  'Greece': 'GRC',
  'Portugal': 'PRT',
  'Sweden': 'SWE',
  'Norway': 'NOR',
  'Denmark': 'DNK',
  'Finland': 'FIN',
  'Austria': 'AUT',
  'Switzerland': 'CHE',
  'Czech Republic': 'CZE',
  'Hungary': 'HUN',
  'Serbia': 'SRB',
  'Croatia': 'HRV',
  'Bosnia and Herzegovina': 'BIH',
  'Albania': 'ALB',
  'Moldova': 'MDA',
  'Belarus': 'BLR',
  'Lithuania': 'LTU',
  'Latvia': 'LVA',
  'Estonia': 'EST',
  'Georgia': 'GEO',
  'Armenia': 'ARM',
  'Azerbaijan': 'AZE',
  'Kazakhstan': 'KAZ',
  'Uzbekistan': 'UZB',
  'Turkmenistan': 'TKM',
  'Kyrgyzstan': 'KGZ',
  'Tajikistan': 'TJK',
  'Mongolia': 'MNG',
  'Nepal': 'NPL',
  'Bangladesh': 'BGD',
  'Sri Lanka': 'LKA',
  'Palestine': 'PSE',
  'Qatar': 'QAT',
  'United Arab Emirates': 'ARE',
  'Kuwait': 'KWT',
  'Bahrain': 'BHR',
  'Oman': 'OMN',
};

/**
 * Triggered when staging_event is updated to approved with workflowType: 'strategic'
 * Adds event to country timeline and re-analyzes with Gemini
 */
export const processStrategicEvent = onDocumentUpdated(
  {
    region: 'europe-west4',
    document: 'staging_events/{eventId}',
    secrets: [genkitApiKey],
    timeoutSeconds: 540,
    memory: '1GiB',
  },
  async (event) => {
    try {
      const beforeData = event.data?.before.data();
      const afterData = event.data?.after.data();

      if (!afterData) {
        console.log('No event data found');
        return;
      }

      // Only process strategic events
      if (afterData.workflowType !== 'strategic') {
        console.log('Not a strategic event, skipping');
        return;
      }

      // Only process when reviewStatus changes to 'approved_strategic'
      // This prevents race condition with immediate threat workflow (which uses 'approved')
      if (beforeData?.reviewStatus === 'approved_strategic' || afterData.reviewStatus !== 'approved_strategic') {
        console.log('Event not newly approved as strategic, skipping');
        return;
      }

      console.log(`Processing strategic event approval: ${event.params.eventId}`);
      const eventData = afterData;

      console.log(`Processing strategic event: ${event.params.eventId}`);

      // 1. Extract country information
      const countryName = eventData.event.location.country.eng;
      const countryCode = COUNTRY_CODE_MAP[countryName] ||
                         countryName.substring(0, 3).toUpperCase();

      console.log(`Country: ${countryName} (${countryCode})`);

      // 2. Get or create country intelligence document
      const countryRef = db.collection('country_intelligence').doc(countryCode);
      const countryDoc = await countryRef.get();

      let countryData: any;
      if (countryDoc.exists) {
        countryData = countryDoc.data();
      } else {
        // Create new country document
        countryData = {
          countryCode: countryCode,
          countryName: countryName,
          region: getRegion(countryName),
          lastUpdated: FieldValue.serverTimestamp(),
          totalEvents: 0,
          timeline: {},
          aiAnalysis: null,
        };
      }

      // 3. Add event to category timeline
      const category = eventData.event.category;
      if (!countryData.timeline[category]) {
        countryData.timeline[category] = {
          events: [],
          eventCount: 0,
        };
      }

      // Note: Cannot use FieldValue.serverTimestamp() inside arrays
      // Use Timestamp.now() instead
      countryData.timeline[category].events.push({
        eventId: event.params.eventId,
        title: eventData.event.title,
        summary: eventData.event.summary,
        dateTime: eventData.event.dateTime,
        severity: eventData.event.severity,
        addedAt: Timestamp.now(),
      });

      countryData.timeline[category].eventCount =
        countryData.timeline[category].events.length;

      // Update total count
      countryData.totalEvents = Object.values(countryData.timeline)
        .reduce((sum: number, cat: any) => sum + cat.eventCount, 0);

      // 4. Re-analyze entire country with Gemini
      console.log('Analyzing with Gemini...');
      const aiAnalysis = await analyzeCountryWithGemini(
        countryCode,
        countryName,
        countryData.timeline,
        genkitApiKey.value()
      );

      countryData.aiAnalysis = aiAnalysis;
      countryData.lastUpdated = FieldValue.serverTimestamp();

      // 5. Save country document
      await countryRef.set(countryData, { merge: true });
      console.log(`Country document updated: ${countryCode}`);

      // 6. Create analysis_queue entry
      await db.collection('analysis_queue').doc(event.params.eventId).set({
        ...eventData,
        workflowType: 'strategic',
        countryIntelligence: {
          countryCode: countryCode,
          analysisVersion: aiAnalysis.analysisVersion,
          addedAt: FieldValue.serverTimestamp(), // OK: This is at document level, not in array
        },
        analysisStatus: 'completed',
        movedToAnalysisAt: FieldValue.serverTimestamp(), // OK: This is at document level
        verificationStatus: 'pending',
      });

      console.log(`Strategic event processed successfully: ${event.params.eventId}`);
    } catch (error) {
      console.error('Error processing strategic event:', error);
      throw error; // Will trigger retry
    }
  }
);

/**
 * Analyze country intelligence with Gemini
 */
async function analyzeCountryWithGemini(
  countryCode: string,
  countryName: string,
  timeline: any,
  apiKey: string
): Promise<any> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });

  // Format events for prompt
  let eventsText = '';
  for (const [category, data] of Object.entries(timeline)) {
    const categoryData = data as any;
    if (categoryData.eventCount > 0) {
      eventsText += `\n## ${category} (${categoryData.eventCount} events):\n`;
      categoryData.events.forEach((evt: any, idx: number) => {
        const date = evt.dateTime.toDate ?
          evt.dateTime.toDate().toISOString().split('T')[0] :
          'Unknown date';
        eventsText += `${idx + 1}. [${date}] ${evt.title}\n   Summary: ${evt.summary}\n   Severity: ${evt.severity}\n\n`;
      });
    }
  }

  const totalEvents = Object.values(timeline).reduce((sum: number, cat: any) => sum + cat.eventCount, 0);

  const prompt = `
You are a strategic intelligence analyst creating a comprehensive country risk assessment.

**COUNTRY:** ${countryName} (${countryCode})
**TOTAL EVENTS:** ${totalEvents}

**EVENTS BY CATEGORY:**
${eventsText}

**TASK:**
Analyze all events and provide a comprehensive strategic intelligence report in JSON format.

**OUTPUT FORMAT (strict JSON, no markdown):**
{
  "analysisVersion": 1,
  "overallRisk": {
    "score": 7.5,
    "trend": "increasing",
    "confidence": 0.85
  },
  "categories": {
    "CategoryName": {
      "eventCount": 5,
      "riskLevel": "high",
      "trend": "worsening",
      "summary": "Brief assessment of this category",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  },
  "summary": "3-4 paragraph executive summary of overall country situation",
  "keyThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "criticalDevelopments": ["Development 1", "Development 2"],
  "outlook": {
    "shortTerm": "1-4 week outlook and key events to watch",
    "mediumTerm": "1-6 month strategic trajectory and scenarios",
    "longTerm": "6-12 month projections and potential outcomes"
  },
  "recommendations": [
    "Strategic recommendation 1",
    "Action item 2",
    "Mitigation strategy 3"
  ]
}

**ANALYSIS GUIDELINES:**
- Provide risk scores 0-10 (10 = critical)
- Focus on strategic implications and patterns
- Identify connections across categories
- Consider temporal evolution
- Provide actionable insights
- Assess both immediate and long-term impacts
- Be objective and evidence-based

Return ONLY the JSON object, no additional text.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Parse JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid AI response format');
  }

  const analysis = JSON.parse(jsonMatch[0]);

  return {
    ...analysis,
    model: 'gemini-2.5-flash',
    modelRegion: 'europe-west4',
    processedAt: FieldValue.serverTimestamp(),
  };
}

/**
 * Map country to region
 */
function getRegion(countryName: string): string {
  const regionMap: { [key: string]: string } = {
    // North America
    'United States': 'North America',
    'Canada': 'North America',
    'Mexico': 'North America',

    // Europe
    'Ukraine': 'Europe',
    'Russia': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'United Kingdom': 'Europe',
    'Spain': 'Europe',
    'Italy': 'Europe',
    'Poland': 'Europe',
    'Romania': 'Europe',
    'Netherlands': 'Europe',
    'Belgium': 'Europe',
    'Greece': 'Europe',
    'Portugal': 'Europe',
    'Sweden': 'Europe',
    'Norway': 'Europe',
    'Denmark': 'Europe',
    'Finland': 'Europe',
    'Austria': 'Europe',
    'Switzerland': 'Europe',
    'Czech Republic': 'Europe',
    'Hungary': 'Europe',
    'Serbia': 'Europe',
    'Croatia': 'Europe',
    'Bosnia and Herzegovina': 'Europe',
    'Albania': 'Europe',
    'Moldova': 'Europe',
    'Belarus': 'Europe',
    'Lithuania': 'Europe',
    'Latvia': 'Europe',
    'Estonia': 'Europe',

    // Middle East
    'Israel': 'Middle East',
    'Iran': 'Middle East',
    'Iraq': 'Middle East',
    'Syria': 'Middle East',
    'Lebanon': 'Middle East',
    'Jordan': 'Middle East',
    'Yemen': 'Middle East',
    'Saudi Arabia': 'Middle East',
    'United Arab Emirates': 'Middle East',
    'Qatar': 'Middle East',
    'Kuwait': 'Middle East',
    'Bahrain': 'Middle East',
    'Oman': 'Middle East',
    'Turkey': 'Middle East',
    'Palestine': 'Middle East',

    // Asia
    'China': 'Asia',
    'India': 'Asia',
    'Pakistan': 'Asia',
    'Afghanistan': 'Asia',
    'Japan': 'Asia',
    'South Korea': 'Asia',
    'North Korea': 'Asia',
    'Taiwan': 'Asia',
    'Myanmar': 'Asia',
    'Thailand': 'Asia',
    'Philippines': 'Asia',
    'Indonesia': 'Asia',
    'Malaysia': 'Asia',
    'Singapore': 'Asia',
    'Vietnam': 'Asia',
    'Bangladesh': 'Asia',
    'Sri Lanka': 'Asia',
    'Nepal': 'Asia',
    'Mongolia': 'Asia',
    'Kazakhstan': 'Asia',
    'Uzbekistan': 'Asia',
    'Turkmenistan': 'Asia',
    'Kyrgyzstan': 'Asia',
    'Tajikistan': 'Asia',
    'Georgia': 'Asia',
    'Armenia': 'Asia',
    'Azerbaijan': 'Asia',

    // Oceania
    'Australia': 'Oceania',
    'New Zealand': 'Oceania',

    // South America
    'Brazil': 'South America',
    'Argentina': 'South America',
    'Chile': 'South America',
    'Colombia': 'South America',
    'Venezuela': 'South America',
    'Peru': 'South America',
    'Ecuador': 'South America',
    'Bolivia': 'South America',
    'Paraguay': 'South America',
    'Uruguay': 'South America',

    // Africa
    'Egypt': 'Africa',
    'Sudan': 'Africa',
    'South Sudan': 'Africa',
    'Libya': 'Africa',
    'Algeria': 'Africa',
    'Morocco': 'Africa',
    'Tunisia': 'Africa',
    'South Africa': 'Africa',
    'Nigeria': 'Africa',
    'Ethiopia': 'Africa',
    'Kenya': 'Africa',
    'Somalia': 'Africa',
    'Ghana': 'Africa',
    'Ivory Coast': 'Africa',
    'Senegal': 'Africa',
    'Mali': 'Africa',
    'Niger': 'Africa',
    'Chad': 'Africa',
    'Burkina Faso': 'Africa',
    'Cameroon': 'Africa',
    'Democratic Republic of Congo': 'Africa',
    'Republic of Congo': 'Africa',
    'Central African Republic': 'Africa',
  };
  return regionMap[countryName] || 'Unknown';
}
