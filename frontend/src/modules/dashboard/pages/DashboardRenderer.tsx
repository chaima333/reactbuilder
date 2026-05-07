// src/modules/dashboard/pages/DashboardRenderer.tsx

import React, {
  useEffect,
  useState
} from "react";
import { loadPlugin } from "../registry/widget.registry";


/**
 * =====================================================
 * TYPES
 * =====================================================
 */

type Props = {
  layout: any;
  context: any;
};

/**
 * =====================================================
 * BUILD PROPS
 * =====================================================
 */

const buildWidgetProps = (
  block: any,
  widget: any,
  context: any
) => {

  switch (block.type) {

    /**
     * ===============================================
     * CORE WIDGETS
     * ===============================================
     */

    case "stats":

      return {
        stats: context?.stats
      };

    case "chart":

      return {
        stats: context?.stats
      };

    case "activity":

      return {
        signals: context?.signals
      };

    /**
     * ===============================================
     * DYNAMIC PLUGIN WIDGETS
     * ===============================================
     */

    default:

      return {
        payload: widget?.payload
      };

  }

};

/**
 * =====================================================
 * DASHBOARD RENDERER
 * =====================================================
 */

export default function DashboardRenderer({

  layout,

  context

}: Props) {

  /**
   * ===============================================
   * WIDGET DATA
   * ===============================================
   */

  const widgets =
    context?.widgets || [];

  /**
   * ===============================================
   * DYNAMIC COMPONENTS
   * ===============================================
   */

  const [
    components,

    setComponents

  ] = useState<
    Record<string, any>
  >({});

  /**
   * ===============================================
   * LOAD COMPONENTS
   * ===============================================
   */

  useEffect(() => {

    const loadAll =
    async () => {

      const loaded:
      Record<string, any> = {};

      for (
        const block
        of layout?.blocks || []
      ) {

        if (
          !loaded[block.type]
        ) {

          loaded[block.type] =
            await loadPlugin(
              block.type
            );

        }

      }

      setComponents(
        loaded
      );

    };

    loadAll();

  }, [layout]);

  /**
   * ===============================================
   * RENDER
   * ===============================================
   */

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

          /**
           * =========================================
           * COMPONENT
           * =========================================
           */

          const Component =
            components[
              block.type
            ];

          if (!Component) {

            return (

              <div
                key={block.id}
              >

                Loading:
                {" "}
                {block.type}

              </div>

            );

          }

          /**
           * =========================================
           * MATCH WIDGET PAYLOAD
           * =========================================
           */

          const widget =
            widgets.find(
              (w: any) =>
                w.id ===
                block.id
            );

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

                  widget,

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