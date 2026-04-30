export interface DashboardWidget {
  id: string;
  type: "stats" | "chart" | "activity";
  col: number; // Grid size
}