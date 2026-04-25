export interface Location {
  id: string;
  name: string;
  category: "food" | "washroom" | "gate" | "seating" | "help";
  status: "Low" | "Medium" | "High";
  zone: "North" | "South" | "East" | "West" | "Pavilion" | "Concourse";
  count: number;
  imageUrl?: string;
  notes?: string;
  updatedAt: number;
}

export type Category = Location["category"];
export type Status = Location["status"];

export interface Incident {
  id: string;
  type: "security" | "housekeeping" | "crowd" | "help" | "suspicious" | "accessibility";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "assigned" | "en_route" | "on_scene" | "in_progress" | "resolved" | "escalated_to_police";
  assignedTo?: string;
  assignedDept?: string;
  locationId?: string; // Reference to a Location.id
  customLocation?: string; 
  zone?: string;
  stand?: string;
  description?: string;
  imageUrl?: string;
  reporterRole: "attendee" | "volunteer" | "staff";
  isDanger?: boolean;
  aiSummary?: string;
  createdAt: number;
  updatedAt: number;
}
