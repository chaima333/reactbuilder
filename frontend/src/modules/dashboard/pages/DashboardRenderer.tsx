import { pluginRegistry } from '../plugins/registry';

export default function DashboardRenderer({ layout, context }: any) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: "20px"
      }}
    >
      {layout?.blocks?.map((block: any) => {

        const Component = pluginRegistry[block.type];

        if (!Component) {
          return (
            <div key={block.id}>
              Unknown widget: {block.type}
            </div>
          );
        }

        // 🔥 نلقاو data الخاصة بالplugin
        const plugin = context.plugins?.find(
          (p: any) => p.name === block.id
        );

         const buildWidgetProps = (
  block: any,
  plugin: any,
  context: any
) => {

  switch (block.type) {

    case "stats":
      return {
        stats: context.stats
      };

    case "activity":
      return {
        signals: context.signals
      };

    default:
      return {
        data: plugin?.data
      };
  }
}; 

        return (
          <div
            key={block.id}
            style={{
              gridColumn: `span ${block.col || 12}`
            }}
          >
               <Component
               {...buildWidgetProps(block, plugin, context)}
               />
          </div>
        );
      })}
    </div>
  );
}