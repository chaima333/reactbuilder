import { useGetDashboardFullQuery } from "../../../redux/services/dashboard.api";

import { useEffect, useState } from "react";

export const useDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/full")
      .then((res) => res.json())
      .then((res) => {
        setData(res.data);
        setLoading(false);
      });
  }, []);

  return { data, loading };
};