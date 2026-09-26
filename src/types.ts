export type ScreenId = 
  | 'analyze-contract'
  | 'clause-checker'
  | 'sample-agreements'
  | 'legal-rights-101'
  | 'help-and-guidance';

export type ClauseSeverity = 'high' | 'warning' | 'fair';

export interface ClauseItem {
  id: number;
  clauseNumber: string;
  title: string;
  subject: string;
  severity: ClauseSeverity;
  severityLabel: string;
  originalText: string;
  plainMeaning: string;
  statutoryContext: string;
  statutoryLaw?: string;
  suggestedFix?: string;
  counterRequestCopy?: string;
}

export interface ContractTemplate {
  id: string;
  title: string;
  category: string;
  categoryKey: 'rental' | 'employment' | 'freelance' | 'nda' | 'other';
  fairnessScore: number;
  totalClauses: number;
  highConcern: number;
  worthNoting: number;
  standardFair: number;
  primaryActionRequired: string;
  contractText: string;
  clauses: ClauseItem[];
  emailSubject: string;
  emailBody: string;
}

export interface BenchmarkTabItem {
  key: 'rent' | 'noncompete' | 'ip';
  label: string;
  predatoryTitle: string;
  predatoryText: string;
  predatoryRisk1: string;
  predatoryRisk2: string;
  fairTitle: string;
  fairText: string;
  fairBenefit1: string;
  fairBenefit2: string;
}

export interface MythItem {
  id: string;
  category: string;
  myth: string;
  fact: string;
}
