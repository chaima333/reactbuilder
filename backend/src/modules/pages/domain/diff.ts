export const PageClassifier = {
  analyze: (oldData: any, newData: any) => {
    // 🧼 Normalization الحتمي
    const clean = (v: any) => String(v || "").trim();
    
    const diff = Object.keys(newData).filter(key => {
        if (['title', 'slug', 'content'].includes(key)) {
            return clean(oldData[key]).toLowerCase() !== clean(newData[key]).toLowerCase();
        }
        if (key === 'blocks') return JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]);
        return oldData[key] !== newData[key];
    });

    if (diff.length === 0) return { type: 'NO_CHANGE', reason: 'Identical normalized data', diff: [] };

    // 🧠 Intelligence: تحديد قيمة التغيير
    const hasCriticalFields = diff.some(f => ['title', 'content', 'blocks'].includes(f));
    const isContentOnly = diff.length === 1 && diff.includes('content');
    const contentDiffSize = Math.abs((newData.content?.length || 0) - (oldData.content?.length || 0));

    // القرار النهائي (The Judge)
    if (isContentOnly && contentDiffSize < 5) {
        return { type: 'COSMETIC', reason: 'Minor content tweak', diff };
    }

    if (!hasCriticalFields && diff.includes('status')) {
        return { 
            type: 'SEMANTIC', 
            flags: { shouldVersion: false, shouldSEO: false }, 
            diff 
        };
    }

    return {
      type: 'SEMANTIC',
      flags: {
        shouldVersion: hasCriticalFields,
        shouldSEO: diff.some(f => ['title', 'slug', 'metaData'].includes(f))
      },
      diff
    };
  }
};