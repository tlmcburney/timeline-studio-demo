export interface Event {
  coupleName: string;
  date: string;
  venue: string;
  guestCounts: { label: string; count: number }[];
  attire: { occasion: string; dress: string }[];
  parties: Party[];
  days: Day[];
}

export interface Party {
  initials: string;
  name: string;
  role: string;
  category: "PLANNING_TEAM" | "CLIENT" | "VENDOR" | "VENUE";
  contact?: string;
  phone?: string;
  email?: string;
  scope: {
    preEvent: boolean;
    duringEvent: boolean;
    postEvent: boolean;
  };
}

export interface Day {
  label: string;
  sections: Section[];
}

export interface Section {
  title?: string;
  items: TimelineItem[];
}

export interface TimelineItem {
  id: string;
  time: string;
  initials: string[];
  description: string;
  subNote?: string;
  isBold?: boolean;
}
