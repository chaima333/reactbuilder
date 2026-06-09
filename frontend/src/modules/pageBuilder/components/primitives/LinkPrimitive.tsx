import React from "react";

interface LinkPrimitiveProps {

  label: string;

  href?: string;

  target?: string;

  style?: React.CSSProperties;
}

export const LinkPrimitive = ({
  label,
  href,
  target,
  style
}: LinkPrimitiveProps) => {

  return (

    <a
      href={href || "#"}

      target={target}

      style={{
        textDecoration:
          "none",

        color:
          "inherit",

        cursor:
          "pointer",

        ...style
      }}
    >
      {label || "Link"}
    </a>
  );
};