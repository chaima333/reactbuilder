// src/modules/dashboard/hooks/useDashboardData.ts
import {
  useGetDashboardStatsQuery,
  useGetRecentActivityQuery
} from "../../../redux/services/dashboard.api";

export const useDashboardData = () => {
  const statsQuery = useGetDashboardStatsQuery();
  const activityQuery = useGetRecentActivityQuery();

  return {
    // 📊 الداتا
    stats: statsQuery.data?.data ?? null,
    activity: activityQuery.data?.data ?? [],

    // ⏳ حالات التحميل
    loading: {
      stats: statsQuery.isLoading,
      activity: activityQuery.isLoading,
      global: statsQuery.isLoading || activityQuery.isLoading,
    },

    // ❌ الأخطاء
    error: {
      stats: statsQuery.error,
      activity: activityQuery.error,
    },

    // 🔄 تحديث الداتا يدويًا
    refetch: {
      all: () => {
        statsQuery.refetch();
        activityQuery.refetch();
      },
      stats: statsQuery.refetch,
      activity: activityQuery.refetch,
    },
  };
};