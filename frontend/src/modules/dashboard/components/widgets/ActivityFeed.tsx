import { DashboardContext } from "./types";
import { ActivityItem } from "./types";

// الحل: تأكد من تعريف نوع المصفوفة في الـ Props
export const ActivityFeed: React.FC<DashboardContext> = ({ activity, loading }) => {
  if (loading.activity) return <div>Loading...</div>;

  return (
    <ul>
      {/* TypeScript سيعرف نوع 'a' أوتوماتيكياً كـ ActivityItem إذا كان نوع activity صحيحاً */}
      {activity.map((a: ActivityItem) => ( 
        <li key={a.id}>
          {a.action} - {a.createdAt}
        </li>
      ))}
    </ul>
  );
};