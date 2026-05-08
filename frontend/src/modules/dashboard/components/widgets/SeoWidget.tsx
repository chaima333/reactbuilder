// src/modules/dashboard/components/widgets/SeoWidget.tsx

import { DashboardCard }
from "../layout/DashboardCard";


type SeoWidgetProps = {
  data: {
    seoScore: number;
    optimizedPages: number;
  };
};

export const SeoWidget:
React.FC<SeoWidgetProps> = ({
  data
}) => {

  if (!data) {

    return (
      <DashboardCard title="SEO">
        <div>No SEO Data</div>
      </DashboardCard>
    );
  }

  return (

    <DashboardCard title="SEO">

      <p>
        SEO Score:
        {" "}
        {data.seoScore}
      </p>

      <p>
        Optimized Pages:
        {" "}
        {data.optimizedPages}
      </p>

    </DashboardCard>

  );
};