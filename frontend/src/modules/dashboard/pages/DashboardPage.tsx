// src/pages/DashboardPage.tsx

import { useEffect, useState } from "react";
import DashboardRenderer from "./DashboardRenderer";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/full")
      .then(res => res.json())
      .then(res => setDashboard(res.data));
  }, []);

  if (!dashboard) return <div>Loading...</div>;

  return (
    <DashboardRenderer
      layout={dashboard.layout}
      context={dashboard.data}
    />
  );
}