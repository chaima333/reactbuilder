import { pluginRegistry } from '../plugins/registry';

export default function DashboardRenderer({ layout, context }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
      {layout?.blocks?.map((block: any) => {
        const Component = pluginRegistry[block.type];

        if (!Component) {
          return (
            <div key={block.id} style={{ gridColumn: 'span 12', color: 'red' }}>
              Unknown widget: {block.type}
            </div>
          );
        }

        return (
          // نستخدم الـ gridColumn باش نضمن الـ span يخدم ديما
          <div key={block.id} style={{ gridColumn: `span ${block.col || 12}` }}>
            <Component {...context} />
          </div>
        );
      })}
    </div>
  );
}