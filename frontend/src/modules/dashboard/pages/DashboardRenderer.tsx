// src/dashboard/DashboardRenderer.tsx
import { DashboardContext, DashboardLayout } from "../components/widgets/types";
import { pluginRegistry } from "../plugins/registry";

interface Props {
  layout: DashboardLayout;
  context: DashboardContext; // نبعثو الـ Context كامل هنا
}

export default function DashboardRenderer({ layout, context }: Props) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {layout.blocks.map((block) => {
        const Component = pluginRegistry[block.type];

        if (!Component) return null;

        return (
          <div key={block.id || block.type} className={`col-span-${block.col}`}>
            <Component {...context} />
          </div>
        );
      })}
    </div>
  );
}