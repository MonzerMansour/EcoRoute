/** Student/parent domain types — extend as the interface grows. */

export type CommuteMode = "solo_car" | "carpool" | "bus" | "walk" | "bike";

export interface NeighborhoodEntry {
  id: string;
  studentName: string;
  neighborhood: string;
  lat: number;
  lng: number;
  commuteMode: CommuteMode;
}

export interface CarpoolClusterView {
  clusterId: string;
  memberCount: number;
  neighborhoods: string[];
  estimatedCo2SavingsKg: number;
}

export interface CommuteSavingsSummary {
  baselineCo2Kg: number;
  optimizedCo2Kg: number;
  savingsKg: number;
  adoptionRate: number;
}
