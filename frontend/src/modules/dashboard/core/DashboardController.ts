export class DashboardController {
  constructor(private api: any) {}

  async getDashboardData(siteId: string) {
    const [stats, charts, activity] = await Promise.all([
      this.api.get(`/dashboard/stats?siteId=${siteId}`),
      this.api.get(`/dashboard/charts?siteId=${siteId}`),
      this.api.get(`/dashboard/activity?siteId=${siteId}`)
    ]);

    return {
      stats: stats.data,
      charts: charts.data,
      activity: activity.data
    };
  }
}