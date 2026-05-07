// src/modules/dashboard/components/widgets/SeoWidget.tsx

import { DashboardCard }
from "../layout/DashboardCard";


type SeoWidgetProps = {
  payload: {
    seoScore: number;
    optimizedPages: number;
  };
};

export const SeoWidget:
React.FC<SeoWidgetProps> = ({
  payload
}) => {

  if (!payload) {

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
        {payload.seoScore}
      </p>

      <p>
        Optimized Pages:
        {" "}
        {payload.optimizedPages}
      </p>

    </DashboardCard>

  );
};