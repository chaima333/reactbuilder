// frontend/src/pages/Dashboard/hooks/useDashboardData.ts

import {
  useGetDashboardStatsQuery,
  useGetActivityLogQuery,
  useGetSitesQuery,
} from '../../../redux/api/apiSlice';

export const useDashboardData = () => {
  const { data: statsData, isLoading: statsLoading, error: statsError } = useGetDashboardStatsQuery(undefined);
  const { data: activityData } = useGetActivityLogQuery({ limit: 10 });
  const { data: sitesData, isLoading: sitesLoading } = useGetSitesQuery(undefined);

  return {
    stats: statsData?.data,
    activities: activityData?.data?.activities || [],
    sites: sitesData?.data || [],
    isLoading: statsLoading || sitesLoading,
    error: statsError,
  };
};