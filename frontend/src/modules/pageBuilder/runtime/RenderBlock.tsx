import { blockRegistry } from "../core/blockRegistry";


export const renderBlock = (
  block: any,
  children?: React.ReactNode
) => {

  const config =
    blockRegistry[block.type];

  if (!config) {
    return null;
  }

  const Component =
    config.component;

  return (

    <Component
      data={block.data}
      style={block.style}
    >
      {children}
    </Component>

  );
};