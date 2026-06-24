import React from "react";

interface LinkPrimitiveProps {
  label: string;
  href?: string;
  target?: string;
  style?: React.CSSProperties;
  disabledNavigation?: boolean;
}

export const LinkPrimitive = ({
  label,
  href,
  target,
  style,
  disabledNavigation = false
}: LinkPrimitiveProps) => {
  return (
    <a
      href={href || "#"}
      target={target}
     onClick={(e) => {
  if (disabledNavigation) {
    e.preventDefault();
  }
}}
      style={{
        textDecoration: "none",
        color: "inherit",
        cursor: "pointer",
        ...style
      }}
    >
      {label || "Link"}
    </a>
  );
};