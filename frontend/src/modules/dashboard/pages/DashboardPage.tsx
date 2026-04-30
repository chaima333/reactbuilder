import React, { useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import { useDashboardData } from "../hooks/useDashboard";
import { mapStatsCards } from "../core/mappers/stats.mapper";

// 1️⃣ استورد المكونات اللي عندك (ثبت في المسارات/Paths)
import { SectionBlock } from "../../pageBuilder/components/blocks/SectionBlock"; 
import { StatsCards } from "../components/widgets/StatsCards";
import { MonthlyChart } from "../components/widgets/MonthlyChart";
import { ActivityFeed } from "../components/widgets/ActivityFeed";

// 2️⃣ اصنع الـ Registry هوني توّاً باش ما يقلقكش
const unifiedRegistry: any = {
  "layout.section": { component: SectionBlock },
  "dashboard.stats": { component: StatsCards },
  "dashboard.chart": { component: MonthlyChart },
  "dashboard.activity": { component: ActivityFeed },
};

export const DashboardPage = () => {
  const { stats, activity, loading } = useDashboardData();

  // 3️⃣ الـ Layout متاع الـ Dashboard (بنيناه بنظام الـ Blocks)
  const [dashboardLayout, setDashboardLayout] = useState({
    id: "dash_root",
    type: "layout.section",
    props: {
      children: [
        {
          id: "col_1",
          width: 70, // العمود الأول فيه الـ Stats والـ Chart
          blocks: [
            { id: "b1", type: "dashboard.stats", data: {} },
            { id: "b2", type: "dashboard.chart", data: {} }
          ]
        },
        {
          id: "col_2",
          width: 30, // العمود الثاني فيه الـ Activity
          blocks: [
            { id: "b3", type: "dashboard.activity", data: {} }
          ]
        }
      ]
    }
  });

  const context = {
    stats,
    cards: mapStatsCards(stats, { totalSites: "Sites", totalPages: "Pages" }),
    activity,
    isLoading: loading.global,
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight="800" mb={4}>Dashboard Engine 🚀</Typography>
      
      {/* 4️⃣ نعيطو للـ SectionBlock ونعطوه الـ Registry اللي صنعناه الفوق */}
      <SectionBlock 
        data={dashboardLayout}
        registry={unifiedRegistry} // مرّرنا الـ Registry هوني
        device="desktop"
        preview={false} // باش الـ Resize يخدم
        onUpdate={(newData: any) => setDashboardLayout(newData)}
        {...context} // نبعثوا الداتا للـ Widgets (stats, activity...)
      />
    </Container>
  );
};