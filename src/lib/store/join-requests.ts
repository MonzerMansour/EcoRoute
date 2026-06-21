export interface JoinRequest {
  id: string;
  activityId: string;
  studentName: string;
  studentEmail?: string;
  status: "pending" | "approved" | "denied";
  createdAt: string;
  updatedAt: string;
}
