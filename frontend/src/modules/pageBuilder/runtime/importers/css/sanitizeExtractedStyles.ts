
// frontend/src/modules/pageBuilder/runtime/importers/html/css/sanitizeExtractedStyles.ts

export function sanitizeExtractedStyles(styles: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};

  Object.keys(styles).forEach((key) => {
    let value = styles[key];
    if (!value || value === "normal" || value === "none" || value.includes("rgba(0, 0, 0, 0)")) return;

    // 🧼 A. منع الـ Fractional Pixels (الكسور العشوائية)
    if (value.includes("px")) {
      const parsed = parseFloat(value);
      // لو العرض مكسر وعشوائي، نقتلوه ونخلو الـ Layout يتحكم (أو نقربوه لأقرب رقم صحيح)
      if (key === "width" && parsed > 500) return; // خليه ياخذ 100% أو flex-basis
      value = `${Math.round(parsed)}px`;
    }

    // 🧼 B. الـ Typography Sanitization (منع الخطوط المجهرية التافهة)
    if (key === "fontSize") {
      const size = parseFloat(value);
      if (size < 13) value = "14px"; // 🛡️ Floor Limit لحماية الـ Fidelity البصرية
    }

    sanitized[key] = value;
  });

  return sanitized;
}