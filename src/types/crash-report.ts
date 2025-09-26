// Structured crash report types for AI analysis

export interface CrashTrigger {
  type: 'physical' | 'cognitive' | 'emotional' | 'environmental' | 'other';
  description: string;
  intensity?: number; // 1-10 scale
  timing?: string; // when it occurred relative to crash
}

export interface CrashSymptom {
  name: string;
  severity: number; // 1-10 scale
  duration?: string; // how long it lasted
  onset?: string; // when it started
}

export interface CrashTimeline {
  onset: string; // when symptoms started
  duration: string; // how long the crash lasted
  recoveryTime: string; // how long to recover
  phases?: {
    phase: string;
    duration: string;
    symptoms: string[];
  }[];
}

export interface CrashActivity {
  activity: string;
  timing: string; // when relative to crash
  intensity?: number;
  duration?: string;
}

export interface RecoveryStrategy {
  strategy: string;
  effectiveness: number; // 1-10 scale
  notes?: string;
}

export interface EnvironmentalFactor {
  factor: string;
  value?: string;
  impact?: 'positive' | 'negative' | 'neutral';
}

export interface StructuredCrashReport {
  severity: number;
  triggers: CrashTrigger[];
  symptoms: CrashSymptom[];
  timeline: CrashTimeline;
  activities: CrashActivity[];
  recoveryStrategies?: RecoveryStrategy[];
  environmentalFactors?: EnvironmentalFactor[];
  aiSummary: string;
  conversationId?: string;
}

// Example of how your crash report would be structured:
export const exampleCrashReport: StructuredCrashReport = {
  severity: 7,
  triggers: [
    {
      type: 'physical',
      description: 'Climbing three flights of stairs at unfamiliar subway station',
      intensity: 8,
      timing: 'immediately before crash'
    },
    {
      type: 'emotional',
      description: 'Rushing for the subway',
      intensity: 6,
      timing: 'immediately before crash'
    }
  ],
  symptoms: [
    {
      name: 'malaise',
      severity: 7,
      duration: '1.5 days',
      onset: 'within 30 minutes'
    },
    {
      name: 'difficulty concentrating',
      severity: 6,
      duration: '1.5 days',
      onset: 'within 30 minutes'
    }
  ],
  timeline: {
    onset: 'within 30 minutes of climbing stairs',
    duration: 'rest of the day and into the next day',
    recoveryTime: 'about a day and a half'
  },
  activities: [
    {
      activity: 'climbing stairs',
      timing: 'immediately before',
      intensity: 8,
      duration: 'few minutes'
    }
  ],
  recoveryStrategies: [
    {
      strategy: 'improve time management',
      effectiveness: 8,
      notes: 'account for unexpected events like spills'
    },
    {
      strategy: 'build in buffer time',
      effectiveness: 8,
      notes: 'for unforeseen circumstances'
    }
  ],
  aiSummary: "Crash Report\n\n**Severity:** 7/10\n\n**Trigger:** Climbing stairs (specifically, three flights at an unfamiliar subway station)\n\n**Timeline:**\n- **Onset:** Effects started within 30 minutes of climbing stairs\n- **Duration:** Lasted the rest of the day and into the next day (approximately a day and a half)\n\n**Symptoms Experienced:**\n- Malaise\n- Difficulty concentrating\n\n**Recovery Time:** About a day and a half to start feeling better\n\n**Additional Triggers Noted:** \n- Rushing for the subway\n\n**Strategies Discussed:**\n- Improve time management to account for unexpected events (e.g., spills)\n- Consider building in buffer time for unforeseen circumstances"
};
