export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  tags: string[];
  notes: string;
  source?: string;
  smPlan?: string;
  smUsers?: string;
  smIntegrations?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: { deals: number; activities: number };
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  contactId?: string | null;
  packageId?: string | null;
  notes: string;
  closeReason?: string;
  stageChangedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  closedAt?: Date | string | null;
  contact?: Pick<Contact, "id" | "firstName" | "lastName" | "company"> | null;
  package?: { id: string; name: string; price: number; type: string } | null;
}

export interface Activity {
  id: string;
  type: ActivityType;
  content: string;
  contactId?: string | null;
  dealId?: string | null;
  createdAt: Date | string;
  contact?: Pick<Contact, "id" | "firstName" | "lastName"> | null;
  deal?: Pick<Deal, "id" | "title"> | null;
}

export interface Task {
  id: string;
  title: string;
  dueDate?: Date | string | null;
  completed: boolean;
  completedAt?: Date | string | null;
  contactId?: string | null;
  dealId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  contact?: Pick<Contact, "id" | "firstName" | "lastName"> | null;
  deal?: Pick<Deal, "id" | "title"> | null;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type DealStage = "Lead" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
export type ActivityType = "note" | "call" | "email" | "meeting" | "stage_change";

export const DEAL_STAGES: DealStage[] = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

export const STAGE_COLORS: Record<DealStage, string> = {
  Lead: "#8b949e",
  Qualified: "#58a6ff",
  Proposal: "#d2a8ff",
  Negotiation: "#e3b341",
  Won: "#3fb950",
  Lost: "#f85149",
};

export const STAGE_PROBABILITY: Record<DealStage, number> = {
  Lead: 0.10,
  Qualified: 0.25,
  Proposal: 0.50,
  Negotiation: 0.75,
  Won: 1.0,
  Lost: 0,
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  note: "📝",
  call: "📞",
  email: "✉️",
  meeting: "🤝",
  stage_change: "🔄",
};

export const LEAD_SOURCES = [
  "Website", "LinkedIn", "Referral", "Cold Outreach", "Intake Form", "Conference/Event", "Other"
];

export const SM_PLANS = ["Free", "Pro", "Business", "Enterprise", "Unknown"];
export const SM_USERS = ["1–10", "11–50", "51–200", "200+", "Unknown"];
export const SM_INTEGRATIONS = [
  "Salesforce", "Jira", "ServiceNow", "Microsoft Teams", "Slack",
  "Tableau", "Power BI", "DocuSign", "Other"
];
