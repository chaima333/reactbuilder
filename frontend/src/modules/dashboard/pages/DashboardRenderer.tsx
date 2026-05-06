// src/modules/dashboard/pages/DashboardRenderer.tsx

import { pluginRegistry }
from "../plugins/registry";

const buildWidgetProps = (
  block: any,
  plugin: any,
  context: any
) => {

  switch (block.type) {

    case "stats":
    case "chart":

      return {
        stats: context?.stats
      };

    case "activity":

      return {
        signals: context?.signals
      };

    default:

      return {
        data: plugin?.data
      };
  }
};

export default function DashboardRenderer({

  layout,

  context

}: any) {

  const plugins =
    context?.plugins || {};

  return (

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(12, 1fr)",
        gap: "20px"
      }}
    >

      {layout?.blocks?.map(
        (block: any) => {

          const Component =
            pluginRegistry[
              block.type
            ];

          if (!Component) {

            return (
              <div key={block.id}>
                Unknown widget:
                {" "}
                {block.type}
              </div>
            );
          }

          // 🔥 direct access
          const plugin =
            plugins?.[block.id];

          return (

            <div
              key={block.id}
              style={{
                gridColumn:
                  `span ${block.col || 12}`
              }}
            >

              <Component
                {...buildWidgetProps(
                  block,
                  plugin,
                  context
                )}
              />

            </div>
          );
        }
      )}

    </div>
  );
}