import { useTheme } from "../../core/theme/ThemeProvider"; // جيب الـ Hook
import { applyStyles } from "../../core/styleEngine";

export const TextBlock = ({ data, onChange, preview, device }: any) => {
  const { tokens } = useTheme(); // 1. أجبد الخزنة

  return (
    <div
      style={{
        // 2. عدي الـ tokens للـ engine كـ parameter ثالث
        ...applyStyles(data.style, device, tokens), 
        outline: "none",
        minHeight: "1.2em",
      }}
    >
      {data.props?.content}
    </div>
  );
};