// src/modules/dashboard/components/widgets/SeoWidget.tsx
import { DashboardContext } from "./types";

export const SeoWidget: React.FC<DashboardContext> = ({ plugins, loading }) => {
  if (loading.global) return <div>Loading SEO...</div>;

  const seo = plugins?.seo;
  if (!seo) return null;

  return (
    <div>
      <h3>SEO</h3>
      <p>Title: {seo.title}</p>
      <p>Description: {seo.description}</p>
    </div>
  );
};