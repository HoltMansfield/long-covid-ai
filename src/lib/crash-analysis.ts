import { openai } from './openai';
import { CrashReport } from '@/db/schema';
import { StructuredCrashReport } from '@/types/crash-report';

export interface CrashAnalysis {
  patterns: {
    commonTriggers: Array<{ trigger: string; frequency: number; avgSeverity: number }>;
    symptomClusters: Array<{ symptoms: string[]; frequency: number }>;
    recoveryPatterns: Array<{ strategy: string; effectiveness: number; frequency: number }>;
  };
  insights: string[];
  recommendations: string[];
  riskFactors: Array<{ factor: string; risk: 'high' | 'medium' | 'low'; description: string }>;
  trends: {
    severityTrend: 'improving' | 'stable' | 'worsening';
    frequencyTrend: 'decreasing' | 'stable' | 'increasing';
    recoveryTrend: 'faster' | 'stable' | 'slower';
  };
}

export async function analyzeCrashReports(reports: CrashReport[]): Promise<CrashAnalysis> {
  if (reports.length === 0) {
    return {
      patterns: { commonTriggers: [], symptomClusters: [], recoveryPatterns: [] },
      insights: ['No crash reports available for analysis yet.'],
      recommendations: ['Continue tracking crashes to build analysis patterns.'],
      riskFactors: [],
      trends: { severityTrend: 'stable', frequencyTrend: 'stable', recoveryTrend: 'stable' }
    };
  }

  const analysisPrompt = `
You are a Long COVID specialist analyzing crash report patterns. Analyze the following crash reports and provide insights:

CRASH REPORTS:
${reports.map((report, i) => `
Report ${i + 1} (${report.createdAt}):
- Severity: ${report.severity}/10
- Triggers: ${JSON.stringify(report.triggers)}
- Symptoms: ${JSON.stringify(report.symptoms)}
- Timeline: ${JSON.stringify(report.timeline)}
- Activities: ${JSON.stringify(report.activities)}
- Recovery Strategies: ${JSON.stringify(report.recoveryStrategies)}
- AI Summary: ${report.aiSummary}
`).join('\n')}

Please analyze these reports and return a JSON object with the following structure:
{
  "patterns": {
    "commonTriggers": [{"trigger": "string", "frequency": number, "avgSeverity": number}],
    "symptomClusters": [{"symptoms": ["string"], "frequency": number}],
    "recoveryPatterns": [{"strategy": "string", "effectiveness": number, "frequency": number}]
  },
  "insights": ["string"],
  "recommendations": ["string"],
  "riskFactors": [{"factor": "string", "risk": "high|medium|low", "description": "string"}],
  "trends": {
    "severityTrend": "improving|stable|worsening",
    "frequencyTrend": "decreasing|stable|increasing", 
    "recoveryTrend": "faster|stable|slower"
  }
}

Focus on:
1. Identifying patterns in triggers and their relationship to severity
2. Common symptom combinations
3. What recovery strategies are most effective
4. Risk factors that predict worse crashes
5. Trends over time (if multiple reports)
6. Actionable recommendations for prevention
7. Recognition that brief/minimal communication often indicates severe crashes
8. Understanding that the most severely affected patients may provide the least detailed reports

Special considerations for severely ill patients:
- Short responses may indicate cognitive impairment and high crash severity
- Inability to elaborate often correlates with worse symptoms
- Communication struggles are themselves important data points
- Every piece of information matters, especially from those most affected

Be specific and evidence-based in your analysis, while being inclusive of all severity levels.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a Long COVID specialist providing data-driven analysis of crash patterns.' },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 2000
    });

    const analysisText = response.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Parse the JSON response
    const analysis: CrashAnalysis = JSON.parse(analysisText);
    return analysis;

  } catch (error) {
    console.error('Error analyzing crash reports:', error);
    
    // Fallback analysis if AI fails
    return generateFallbackAnalysis(reports);
  }
}

function generateFallbackAnalysis(reports: CrashReport[]): CrashAnalysis {
  // Simple statistical analysis as fallback
  const totalReports = reports.length;
  const avgSeverity = reports.reduce((sum, r) => sum + r.severity, 0) / totalReports;
  
  return {
    patterns: {
      commonTriggers: [],
      symptomClusters: [],
      recoveryPatterns: []
    },
    insights: [
      `You have ${totalReports} crash report${totalReports > 1 ? 's' : ''} recorded.`,
      `Average severity: ${avgSeverity.toFixed(1)}/10`,
      'Detailed AI analysis temporarily unavailable - showing basic statistics.'
    ],
    recommendations: [
      'Continue tracking crashes to identify patterns',
      'Note specific triggers and their intensity',
      'Track recovery strategies and their effectiveness'
    ],
    riskFactors: [],
    trends: {
      severityTrend: 'stable',
      frequencyTrend: 'stable', 
      recoveryTrend: 'stable'
    }
  };
}

// Function to extract structured data from AI conversation
export async function extractCrashReportFromConversation(
  messages: Array<{ role: string; content: string }>
): Promise<StructuredCrashReport | null> {
  const extractionPrompt = `
Analyze this conversation and extract a structured crash report. The conversation is between a user and an AI assistant discussing a Long COVID crash.

CONVERSATION:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}

Extract the following information and return as JSON:
{
  "severity": number (1-10),
  "triggers": [{"type": "physical|cognitive|emotional|environmental|other", "description": "string", "intensity": number, "timing": "string"}],
  "symptoms": [{"name": "string", "severity": number, "duration": "string", "onset": "string"}],
  "timeline": {"onset": "string", "duration": "string", "recoveryTime": "string"},
  "activities": [{"activity": "string", "timing": "string", "intensity": number}],
  "recoveryStrategies": [{"strategy": "string", "effectiveness": number, "notes": "string"}],
  "environmentalFactors": [{"factor": "string", "value": "string", "impact": "positive|negative|neutral"}],
  "aiSummary": "string - a formatted summary of the crash report"
}

IMPORTANT: Pay special attention to implied severity indicators:
- Very brief responses often indicate severe cognitive impairment (severity 7-10)
- Phrases like "can't think," "too tired," "bad crash" suggest high severity
- Inability to provide details may correlate with crash severity
- Communication struggles themselves are symptoms worth noting
- If someone can only manage short responses, infer higher severity

Only include information that was explicitly mentioned or can be reasonably inferred from the conversation context. Use null for missing values.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a medical data extraction specialist. Extract structured crash report data from conversations.' },
        { role: 'user', content: extractionPrompt }
      ],
      temperature: 0.1, // Very low temperature for consistent extraction
      max_tokens: 1500
    });

    const extractedText = response.choices[0]?.message?.content;
    if (!extractedText) {
      return null;
    }

    const structuredReport: StructuredCrashReport = JSON.parse(extractedText);
    return structuredReport;

  } catch (error) {
    console.error('Error extracting crash report from conversation:', error);
    return null;
  }
}
