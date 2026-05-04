// core/utils/diff.ts

export const isSemanticChange = (field: string, oldVal: any, newVal: any): boolean => {
  // 1. تنظيف القيم قبل المقارنة
  const clean = (v: any) => (typeof v === 'string' ? v.trim() : v);
  const a = clean(oldVal);
  const b = clean(newVal);

  // 2. إذا كان حقل نصي بسيط (Title, Slug)
  if (['title', 'slug'].includes(field)) {
    return String(a).toLowerCase() !== String(b).toLowerCase();
  }

  // 3. إذا كان Blocks (JSON) - نقارنوا المحتوى كـ String موحد
  if (field === 'blocks') {
    return JSON.stringify(a) !== JSON.stringify(b);
  }

  // 4. المقارنة العادية للبقية
  return a !== b;
};

export const getMeaningfulChanges = (oldData: any, newData: any): string[] => {
  return Object.keys(newData).filter(key => 
    isSemanticChange(key, oldData[key], newData[key])
  );
};