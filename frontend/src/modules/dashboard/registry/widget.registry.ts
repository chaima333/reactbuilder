const WIDGET_MAP: Record<
  string,
  () => Promise<any>
> = {

  stats:
    () =>
      import("../components/widgets/StatsCards"),

  chart:
    () =>
      import("../components/widgets/MonthlyChart"),

  activity:
    () =>
      import("../components/widgets/ActivityFeed"),

  "widget.seo.score":
    () =>
      import("../components/widgets/SeoWidget"),

  media:
    () =>
      import("../components/widgets/MediaWidget"),

  "widget.version.summary":
    () =>
      import("../components/widgets/VersionWidget")

};


export const loadPlugin =
async (type: string) => {

  const loader =
    WIDGET_MAP[type];

  if (!loader) {
    return null;
  }

  try {

    const module =
      await loader();

    const componentName =
      Object.keys(module).find(
        key => key !== "default"
      );

    return componentName
      ? module[componentName]
      : module.default;

  } catch (error) {

    console.error(
      `Failed to load plugin: ${type}`,
      error
    );

    return null;

  }

};