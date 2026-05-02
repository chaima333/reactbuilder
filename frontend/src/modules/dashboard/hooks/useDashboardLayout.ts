// frontend/src/pages/dashboard/hooks/useDashboardLayout.ts

import { useGetDashboardFullQuery } from "../../../redux/services/dashboard.api";


export const useDashboardLayout = () => {
  const { data: dashboard, isLoading, error } = useGetDashboardFullQuery();

  return {
    // نضمنوا إنو حتى لو الـ API رجع null، الـ UI ما يطيحش
    stats: dashboard?.stats || null,
    activity: dashboard?.activity || [],
    layout: dashboard?.layout || { blocks: [] },
    plugins: dashboard?.plugins || {},
    loading: isLoading,
    error: error ? 'Failed to fetch dashboard' : null
  };
};