// frontend/src/pages/dashboard/hooks/useDashboardLayout.ts

import { useGetDashboardFullQuery } from "../../../redux/services/dashboard.api";


export const useDashboardLayout = () => {
  const { data: dashboard, isLoading, error } = useGetDashboardFullQuery();

  return {
    stats: dashboard?.stats,
    activity: dashboard?.activity,
    layout: dashboard?.layout,
    plugins: dashboard?.plugins,
    loading: isLoading,
    error: error ? 'Failed to fetch dashboard' : null
  };
};