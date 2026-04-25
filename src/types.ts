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
