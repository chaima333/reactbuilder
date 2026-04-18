// frontend/src/pages/Dashboard/hooks/useDashboardData.ts

import {
  useGetSitesQuery,
} from '../../../redux/services/sites.api';
import { 
  useGetDashboardStatsQuery, 
  useGetActivityLogQuery 
} from '../../../redux/services/dashboard.api';

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