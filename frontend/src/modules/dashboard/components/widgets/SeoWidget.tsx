// src/modules/dashboard/components/widgets/SeoWidget.tsx

type SeoWidgetProps = {
  data: {
    seoScore: number;
    optimizedPages: number;
  };
};

export const SeoWidget: React.FC<SeoWidgetProps> = ({ data }) => {

  if (!data) {
    return <div>No SEO Data</div>;
  }

  return (
    <div>
      <h3>SEO</h3>

      <p>SEO Score: {data.seoScore}</p>

      <p>Optimized Pages: {data.optimizedPages}</p>
    </div>
  );
};