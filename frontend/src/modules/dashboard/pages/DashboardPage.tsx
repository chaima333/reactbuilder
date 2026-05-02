// src/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // 🔥 استعمل هذي
import DashboardRenderer from "./DashboardRenderer";

export default function DashboardPage() {
  const { siteId } = useParams<{ siteId: string }>(); // يقرأ الـ ID من الرابط
  const [dashboard, setDashboard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // نطلبوا الـ API باستعمال الـ siteId اللي في الرابط
    fetch(`/api/sites/${siteId}/dashboard/full`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Forbidden or Not Found");
        return res.json();
      })
      .then(res => setDashboard(res.data))
      .catch(err => setError(err.message));
  }, [siteId]); // كل ما يتبدل الـ siteId في الرابط، الـ Dashboard يتبدل

  if (error) return <div className="text-red-500">Error: {error} (Check your membership)</div>;
  if (!dashboard) return <div>Loading Dashboard for Site {siteId}...</div>;

  return (
    <DashboardRenderer
      layout={dashboard.layout}
      context={dashboard.data}
    />
  );
}