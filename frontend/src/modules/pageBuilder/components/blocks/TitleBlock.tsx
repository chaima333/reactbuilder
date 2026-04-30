import { useTheme } from "../../core/theme/ThemeProvider";
import { applyStyles } from "../../core/styleEngine";

export const TitleBlock = ({ data, device }: any) => {
  const { tokens } = useTheme();
  
  // الـ engine توّة باش يرجعلنا الـ Hex الحقيقي مالـ Token Path
  const activeStyle = applyStyles(data.style, device, tokens);

  return (
    <h1 style={{
      margin: 0,
      padding: "10px 0",
      fontFamily: tokens.typography.fontFamily,
      fontSize: activeStyle.fontSize || tokens.typography.h1,
      color: activeStyle.color || "inherit",
      textAlign: activeStyle.textAlign || "left",
      ...activeStyle // باش ياخذ أي زوائد أخرى كـ padding أو line-height
    }}>
      {data.props.content || "Title Text"}
    </h1>
  );
};