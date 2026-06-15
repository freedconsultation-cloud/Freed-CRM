export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  tags: string[];
  notes: string;
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
  notes: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  closedAt?: Date | string | null;
  contact?: Pick<Contact, "id" | "firstName" | "lastName" | "company"> | null;
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

export type DealStage = "Lead" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
export type ActivityType = "note" | "call" | "email" | "meeting";

export const DEAL_STAGES: DealStage[] = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

export const STAGE_COLORS: Record<DealStage, string> = {
  Lead: "#8b949e",
  Qualified: "#58a6ff",
  Proposal: "#d2a8ff",
  Negotiation: "#e3b341",
  Won: "#3fb950",
  Lost: "#f85149",
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  note: "📝",
  call: "📞",
  email: "✉️",
  meeting: "🤝",
};
